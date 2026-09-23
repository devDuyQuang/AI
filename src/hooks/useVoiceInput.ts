// import { useEffect, useRef, useState } from 'react';
// import { canSpeak, createRecognition, type Recognition } from '../lib/speech';
// export const SILENCE_TIMEOUT_MS = 2000;
// const MAX_AUTO_RESTARTS = 2;
// export type VoicePhase = 'idle' | 'listening' | 'finishing' | 'confirmed' | 'paused';
// export function useVoiceInput(onSubmit: (text: string) => void, blocked: boolean, locale: string) {
//  const [phase, setPhase] = useState<VoicePhase>('idle');
//  const [transcript, setTranscript] = useState({ final: '', interim: '' });
//  const [notice, setNotice] = useState('');
//  const active = useRef<Recognition | null>(null);
//  const status = useRef<VoicePhase>('idle');
//  const buffer = useRef({ final: '', interim: '' });
//  const prefix = useRef('');
//  const finished = useRef(false); const submitted = useRef(false); const restarts = useRef(0);
//  const lastChange = useRef(0);
//  const silence = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
//  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
//  const delivery = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
//  const submit = useRef(onSubmit); submit.current = onSubmit;
//  const changePhase = (p: VoicePhase) => { status.current = p; setPhase(p); };
//  const fullText = () => [buffer.current.final, buffer.current.interim].filter(Boolean).join(' ').trim();
//  function detach(r: Recognition) { r.onresult = null; r.onerror = null; r.onend = null; }
//  function cleanup() {
//   clearTimeout(silence.current); clearTimeout(timeout.current); clearTimeout(delivery.current);
//   const r = active.current; active.current = null;
//   if (r) { detach(r); try { r.abort(); } catch { /* already stopped */ } }
//  }
//  function cancel() { cleanup(); finished.current = false; submitted.current = false; prefix.current = ''; buffer.current = { final:'', interim:'' }; setTranscript(buffer.current); changePhase('idle'); }
//  useEffect(() => cleanup, []);
//  function pause(message: string) { cleanup(); finished.current = false; changePhase('paused'); setNotice(message); }
//  function confirm() {
//   if (submitted.current) return;
//   const text = fullText();
//   if (!text) { cancel(); return; }
//   submitted.current = true; clearTimeout(silence.current); clearTimeout(timeout.current); changePhase('confirmed');
//   delivery.current = setTimeout(() => { buffer.current = {final:'',interim:''}; prefix.current = ''; setTranscript(buffer.current); changePhase('idle'); submit.current(text); }, 450);
//  }
//  function stop() {
//   if (!['listening','paused'].includes(status.current) || finished.current || submitted.current) return;
//   finished.current = true; clearTimeout(silence.current); changePhase('finishing');
//   const r = active.current;
//   if (!r) { confirm(); return; }
//   timeout.current = setTimeout(() => pause('Voice did not finish. Your transcript is saved below. Continue speaking or send now.'), 5000);
//   try { r.stop(); } catch { pause('Voice was interrupted. Continue speaking or send now.'); }
//  }
//  function armSilence() {
//   clearTimeout(silence.current);
//   if (fullText()) silence.current = setTimeout(stop, SILENCE_TIMEOUT_MS);
//  }
//  function launch() {
//   try {
//    const r = createRecognition();
//    if (!r) { changePhase('idle'); setNotice('Voice input isn’t supported in this browser. You can always type below.'); return; }
//    active.current = r; r.lang = locale; r.continuous = true; r.interimResults = true;
//    r.onresult = event => {
//     if (active.current !== r || submitted.current) return;
//     const final: string[] = []; const interim: string[] = [];
//     for (let i=0; i<event.results.length; i++) { const result=event.results[i]; const text=result[0]?.transcript.trim(); if(text) (result.isFinal ? final : interim).push(text); }
//     buffer.current = { final:[prefix.current,...final].filter(Boolean).join(' '), interim:interim.join(' ') };
//     setTranscript(buffer.current); lastChange.current = Date.now();
//     if (!finished.current) armSilence();
//    };
//    r.onerror = event => { if(active.current !== r) return; pause(event.error === 'not-allowed' ? 'Microphone access is blocked. Allow it in your browser, or type below.' : 'Listening was interrupted. Continue speaking or send now.'); };
//    r.onend = () => {
//     if(active.current !== r) return;
//     detach(r); active.current = null; clearTimeout(timeout.current);
//     if(finished.current) { confirm(); return; }
//     if(fullText() && Date.now()-lastChange.current >= SILENCE_TIMEOUT_MS) { confirm(); return; }
//     if(restarts.current < MAX_AUTO_RESTARTS) {
//      restarts.current++; prefix.current = fullText(); buffer.current = {final:prefix.current,interim:''}; setTranscript(buffer.current); launch();
//     } else pause('Listening paused. Your transcript is saved. Continue speaking or send now.');
//    };
//    r.start(); changePhase('listening');
//   } catch { pause('Voice could not restart. Continue speaking or send now.'); }
//  }
//  function start() {
//   if(blocked || !['idle','paused'].includes(status.current)) return;
//   const resume = status.current === 'paused';
//   if(!resume) cancel(); else { prefix.current = fullText(); buffer.current = {final:prefix.current,interim:''}; setTranscript(buffer.current); }
//   finished.current = false; submitted.current = false; restarts.current = 0; lastChange.current = Date.now(); setNotice('');
//   if(canSpeak()) window.speechSynthesis.cancel();
//   launch();
//  }
//  return { phase, transcript, notice, start, stop, cancel };
// }


import { useEffect, useRef, useState } from 'react';
import { canSpeak, createRecognition, type Recognition } from '../lib/speech';

export const SILENCE_TIMEOUT_MS = 2000;
const MAX_AUTO_RESTARTS = 2;
export type VoicePhase = 'idle' | 'listening' | 'finishing' | 'confirmed' | 'paused';

export function useVoiceInput(onSubmit: (text: string) => void, blocked: boolean, locale: string) {
 const [phase, setPhase] = useState<VoicePhase>('idle');
 const [transcript, setTranscript] = useState({ final: '', interim: '' });
 const [notice, setNotice] = useState('');
 const active = useRef<Recognition | null>(null);
 const status = useRef<VoicePhase>('idle');
 const buffer = useRef({ final: '', interim: '' });
 const prefix = useRef('');
 const finished = useRef(false); const submitted = useRef(false); const restarts = useRef(0);
 const lastChange = useRef(0);
 const silence = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
 const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
 const delivery = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
 const submit = useRef(onSubmit); submit.current = onSubmit;
 
 const changePhase = (p: VoicePhase) => { status.current = p; setPhase(p); };
 const fullText = () => [buffer.current.final, buffer.current.interim].filter(Boolean).join(' ').trim();
 
 function detach(r: Recognition) { r.onresult = null; r.onerror = null; r.onend = null; }
 
 function cleanup() {
  clearTimeout(silence.current); clearTimeout(timeout.current); clearTimeout(delivery.current);
  const r = active.current; active.current = null;
  if (r) { detach(r); try { r.abort(); } catch { /* already stopped */ } }
 }
 
 function cancel() { cleanup(); finished.current = false; submitted.current = false; prefix.current = ''; buffer.current = { final:'', interim:'' }; setTranscript(buffer.current); changePhase('idle'); }
 
 useEffect(() => cleanup, []);
 
 function pause(message: string) { cleanup(); finished.current = false; changePhase('paused'); setNotice(message); }
 
 function confirm() {
  if (submitted.current) return;
  const text = fullText();
  if (!text) { cancel(); return; }
  submitted.current = true; clearTimeout(silence.current); clearTimeout(timeout.current); changePhase('confirmed');
  delivery.current = setTimeout(() => { buffer.current = {final:'',interim:''}; prefix.current = ''; setTranscript(buffer.current); changePhase('idle'); submit.current(text); }, 450);
 }
 
 function stop() {
  if (!['listening','paused'].includes(status.current) || finished.current || submitted.current) return;
  finished.current = true; clearTimeout(silence.current); changePhase('finishing');
  const r = active.current;
  if (!r) { confirm(); return; }
  timeout.current = setTimeout(() => pause('Voice did not finish. Your transcript is saved below. Continue speaking or send now.'), 5000);
  try { r.stop(); } catch { pause('Voice was interrupted. Continue speaking or send now.'); }
 }
 
 function armSilence() {
  clearTimeout(silence.current);
  if (fullText()) silence.current = setTimeout(stop, SILENCE_TIMEOUT_MS);
 }
 
 function launch() {
  try {
   const r = createRecognition();
   if (!r) { changePhase('idle'); setNotice('Voice input isn’t supported in this browser. You can always type below.'); return; }
   active.current = r; r.lang = 'en-US'; r.continuous = true; r.interimResults = true;
   
   r.onresult = event => {
    if (active.current !== r || submitted.current) return;
    const final: string[] = []; const interim: string[] = [];
    for (let i=0; i<event.results.length; i++) { const result=event.results[i]; const text=result[0]?.transcript.trim(); if(text) (result.isFinal ? final : interim).push(text); }
    buffer.current = { final:[prefix.current,...final].filter(Boolean).join(' '), interim:interim.join(' ') };
    setTranscript(buffer.current); lastChange.current = Date.now();
    if (!finished.current) armSilence();
   };
   
   r.onerror = event => { 
     if(active.current !== r) return; 
     pause(event.error === 'not-allowed' ? 'Microphone access is blocked. Allow it in your browser, or type below.' : 'Listening was interrupted. Continue speaking or send now.'); 
   };
   
   r.onend = () => {
    if(active.current !== r) return;
    detach(r); active.current = null; clearTimeout(timeout.current);
    if(finished.current) { confirm(); return; }
    if(fullText() && Date.now()-lastChange.current >= SILENCE_TIMEOUT_MS) { confirm(); return; }
    if(restarts.current < MAX_AUTO_RESTARTS) {
     restarts.current++; prefix.current = fullText(); buffer.current = {final:prefix.current,interim:''}; setTranscript(buffer.current); launch();
    } else pause('Listening paused. Your transcript is saved. Continue speaking or send now.');
   };
   
   r.start(); changePhase('listening');
  } catch { pause('Voice could not restart. Continue speaking or send now.'); }
 }
 
 function start() {
  if(blocked || !['idle','paused'].includes(status.current)) return;
  const resume = status.current === 'paused';
  if(!resume) cancel(); else { prefix.current = fullText(); buffer.current = {final:prefix.current,interim:''}; setTranscript(buffer.current); }
  finished.current = false; submitted.current = false; restarts.current = 0; lastChange.current = Date.now(); setNotice('');
  if(canSpeak()) window.speechSynthesis.cancel();
  launch();
 }
 
 return { phase, transcript, notice, start, stop, cancel };
}
