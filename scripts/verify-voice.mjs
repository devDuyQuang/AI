import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const url = process.env.DEMO_URL || 'http://localhost:5175/';
const errors = [];
const context = await browser.newContext({ viewport: { width: 1512, height: 982 } });
async function mockSpeech(context) {
 await context.addInitScript(() => {
  window.voiceTest = { sessions: [], spoken: [], cancels: 0, events: [] };
  class Recognition {
   constructor() { window.voiceTest.sessions.push(this); }
   start() { window.voiceTest.events.push('start'); }
   stop() { this.stopped = true; window.voiceTest.events.push('stop'); }
   abort() { this.aborted = true; }
   result(parts) { this.onresult?.({ results: parts.map(([transcript, isFinal]) => Object.assign([{ transcript }], { isFinal })) }); }
   end() { this.lastEnd = this.onend; this.onend?.(); }
  }
  window.SpeechRecognition = Recognition;
  Object.defineProperty(window, 'speechSynthesis', { value: { cancel() { window.voiceTest.cancels++; window.voiceTest.events.push('cancel'); }, speak(u) { window.voiceTest.spoken.push(u.text); window.voiceTest.events.push('speak'); } } });
  window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
 });
}
await mockSpeech(context);
const page = await context.newPage();
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto(url);
const result = parts => page.evaluate(parts => window.voiceTest.sessions.at(-1).result(parts), parts);
const count = () => page.locator('.message.user').count();
const reset = () => page.getByRole('button',{name:'Reset Session',exact:true}).click();
const end = () => page.evaluate(() => { const r=window.voiceTest.sessions.at(-1);r.end();r.lastEnd?.(); });
async function send(text) { await page.getByRole('textbox').fill(text);await page.getByRole('button',{name:'Send message',exact:true}).click();await page.getByText('Thinking',{exact:true}).waitFor({state:'hidden'}); }
await send('Giá gel manicure bao nhiêu?');await page.getByText(/Gel Manicure có giá \$38/).waitFor();
await send('How much is a gel manicure?');await page.getByText(/Gel Manicure is \$38/).waitFor();
await send('toi muon dat lich lam nail');
await page.getByRole('button',{name:'Gel Manicure',exact:true}).click();
await page.getByRole('button',{name:'3:00 PM',exact:true}).click();
await page.getByText(/Emily và Anna đang trống/).waitFor();
await page.reload();
await page.getByRole('button',{name:'Emily',exact:true}).click();
await page.getByText('LỊCH HẸN ĐÃ XÁC NHẬN',{exact:true}).waitFor();
await reset();
for (const [lang, first, middle, full, ack] of [
 ['en','I want','I want to book','I want to book a gel manicure at three PM','✓ Got it'],
 ['vi','Tôi muốn','Tôi muốn đặt lịch làm nail','Tôi muốn đặt lịch làm nail lúc ba giờ chiều','✓ Đã nhận']
]) {
 await page.getByLabel('Input language').selectOption(lang);
 await page.getByRole('button',{name:'Tap to speak',exact:true}).click();
 assert.equal(await page.evaluate(()=>window.voiceTest.sessions.at(-1).lang),lang==='vi'?'vi-VN':'en-US');
 await result([[first,false]]);await page.waitForTimeout(500);assert.equal(await count(),0);
 await result([[middle,false]]);await page.waitForTimeout(700);assert.equal(await count(),0);
 await result([[full,true]]);await page.waitForTimeout(1500);assert.equal(await count(),0);
 assert.equal(await page.evaluate(()=>!!window.voiceTest.sessions.at(-1).stopped),false);
 await page.waitForTimeout(600);assert.equal(await page.evaluate(()=>window.voiceTest.sessions.at(-1).stopped),true);
 await end();await page.getByRole('heading',{name:ack,exact:true}).waitFor();assert.equal(await count(),0);
 await page.waitForTimeout(1500);assert.equal(await count(),1);assert.equal(await page.locator('.message.ai').count(),2);
 assert.equal(await page.locator('.message.user .bubble').innerText(),full);
 await reset();
}
await page.getByRole('switch').click();
await page.getByRole('button',{name:'Tap to speak',exact:true}).click();
await result([['Hôm nay salon mấy giờ đóng cửa?',true]]);
await page.getByRole('button',{name:'Tap when finished',exact:true}).click();await end();
await page.getByText(/Salon mở cửa từ/).waitFor();
assert.equal(await count(),1);assert.equal(await page.evaluate(()=>window.voiceTest.spoken.length),1);
await page.getByRole('button',{name:'Tap to speak',exact:true}).click();
assert.deepEqual(await page.evaluate(()=>window.voiceTest.events.slice(-2)),['cancel','start']);
await result([['Tôi muốn',true]]);await end();
await result([['đặt lịch',true]]);await end();
await result([['làm nail',true]]);await end();
await page.getByRole('button',{name:'Continue speaking',exact:true}).waitFor();
assert.equal(await count(),1);
await page.getByRole('button',{name:'Send now',exact:true}).click();
await page.getByRole('button',{name:'Gel Manicure',exact:true}).waitFor();
assert.equal(await count(),2);assert.equal(await page.locator('.message.user .bubble').last().innerText(),'Tôi muốn đặt lịch làm nail');
await page.getByLabel('Input language').selectOption('vi');await page.reload();assert.equal(await page.getByLabel('Input language').inputValue(),'vi');
for(const width of [1512,390]) {await page.setViewportSize({width,height:982});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:`/tmp/khaifrost-bilingual-${width}.png`,fullPage:true});}
assert.deepEqual(errors,[]);
console.log('PASS: English/Vietnamese text, Vietnamese booking across reload, slow EN/VI voice, 2s silence, 450ms confirmation, manual finish, exactly-once delivery, limited restart and Send now, voice cancellation, persisted input locale, responsive and zero console errors. Speech events simulated.');
await browser.close();
