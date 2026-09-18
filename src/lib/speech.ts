import type { DemoLanguage } from './language';
type RecognitionEvent = { results: { [key: number]: { [key: number]: { transcript: string }; isFinal: boolean }; length: number } };
export type Recognition = { lang: string; continuous: boolean; interimResults: boolean; onresult: ((event: RecognitionEvent) => void) | null; onerror: ((event: { error: string }) => void) | null; onend: (() => void) | null; start: () => void; stop: () => void; abort: () => void };
type SpeechWindow = Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
export function createRecognition(): Recognition | null { const w = window as SpeechWindow; const Constructor = w.SpeechRecognition || w.webkitSpeechRecognition; return Constructor ? new Constructor() : null; }
export const canSpeak = () => 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
export function speak(text: string, language: DemoLanguage = 'en') {
 if (!canSpeak()) return;
 try {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language === 'vi' ? 'vi-VN' : 'en-US';
  const voices = window.speechSynthesis.getVoices?.() || [];
  const voice = voices.find(v => v.lang.toLowerCase() === utterance.lang.toLowerCase()) || voices.find(v => v.lang.toLowerCase().startsWith(language));
  if (voice) utterance.voice = voice;
  utterance.rate = 0.96;
  window.speechSynthesis.speak(utterance);
 } catch { /* Voice availability must never block chat. */ }
}
