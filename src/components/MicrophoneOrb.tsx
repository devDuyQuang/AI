// import { Mic, Volume2, VolumeX, AudioLines, Check } from "lucide-react";
// import type { VoicePhase } from "../hooks/useVoiceInput";
// import { detectLanguage, type InputLanguage } from "../lib/language";
// type Props = {
//   phase: VoicePhase;
//   transcript: { final: string; interim: string };
//   busy: boolean;
//   onStart: () => void;
//   onStop: () => void;
//   voice: boolean;
//   onVoice: () => void;
//   supported: boolean;
//   notice: string;
//   inputLanguage: InputLanguage;
//   onInputLanguage: (value: InputLanguage) => void;
// };
// export function MicrophoneOrb({
//   phase,
//   transcript,
//   busy,
//   onStart,
//   onStop,
//   voice,
//   onVoice,
//   supported,
//   notice,
//   inputLanguage,
//   onInputLanguage,
// }: Props) {
//   const listening = phase === "listening";
//   const confirmed = phase === "confirmed";
//   const processing = phase === "finishing" || confirmed;
//   const paused = phase === "paused";
//   const disabled = busy || processing;
//   const received =
//     detectLanguage(`${transcript.final} ${transcript.interim}`) === "vi"
//       ? "Đã nhận"
//       : "Got it";
//   return (
//     <section className="voice-stage">
//       <div className="stage-top">
//         <span className="tiny-label">MEET YOUR NEW FRONT DESK</span>
//         <span className="encrypted">
//           <i /> Ready when you are
//         </span>
//       </div>
//       <div
//         className={`orb-wrap ${listening ? "listening" : processing || busy ? "processing" : ""}`}
//       >
//         <div className="orbit orbit-one" />
//         <div className="orbit orbit-two" />
//         <div className="orbit orbit-three" />
//         <button
//           className="orb"
//           aria-label={
//             listening ? "Finish speaking" : "Start voice conversation"
//           }
//           aria-pressed={listening}
//           disabled={disabled}
//           onClick={listening ? onStop : onStart}
//         >
//           {confirmed ? (
//             <Check size={44} />
//           ) : (
//             <Mic size={44} strokeWidth={1.5} />
//           )}
//         </button>
//         <span className="orb-star star-one" />
//         <span className="orb-star star-two" />
//       </div>
//       <h2>
//         {confirmed
//           ? `✓ ${received}`
//           : listening
//             ? "Listening…"
//             : processing
//               ? "Processing speech…"
//               : busy
//                 ? "Thinking…"
//                 : paused
//                   ? "Continue when you’re ready"
//                   : "I’m your AI receptionist"}
//       </h2>
//       {listening || processing || paused ? (
//         <div className="live-transcript" aria-live="polite">
//           <span>{transcript.final}</span>{" "}
//           <span className="interim">{transcript.interim}</span>
//           {!transcript.final && !transcript.interim && (
//             <span className="interim">Take your time. I’m listening.</span>
//           )}
//         </div>
//       ) : (
//         <p>Ask about services, availability, pricing or book an appointment.</p>
//       )}
//       <div className="voice-controls">
//         <button
//           className={`speak-button ${listening ? "is-listening" : ""}`}
//           disabled={disabled}
//           onClick={listening ? onStop : onStart}
//         >
//           {listening ? (
//             <AudioLines className="waveform" size={18} />
//           ) : (
//             <Mic size={18} />
//           )}
//           {confirmed
//             ? received
//             : processing
//               ? "Finishing…"
//               : listening
//                 ? "Tap when finished"
//                 : paused
//                   ? "Continue speaking"
//                   : "Tap to speak"}
//         </button>
//         {paused && (
//           <button
//             className="send-now"
//             disabled={!`${transcript.final}${transcript.interim}`.trim()}
//             onClick={onStop}
//           >
//             Send now
//           </button>
//         )}
//         <button
//           className="voice-toggle"
//           role="switch"
//           aria-checked={voice}
//           disabled={!supported}
//           onClick={onVoice}
//         >
//           {voice ? <Volume2 size={15} /> : <VolumeX size={15} />}Voice reply{" "}
//           <span className={voice ? "toggle on" : "toggle"}>
//             <i />
//           </span>
//           <b>{voice ? "ON" : "OFF"}</b>
//         </button>
//         <label className="input-language">
//           Input language{" "}
//           <select
//             aria-label="Input language"
//             value={inputLanguage}
//             disabled={phase !== "idle" && phase !== "paused"}
//             onChange={(e) => onInputLanguage(e.target.value as InputLanguage)}
//           >
//             <option value="auto">Auto</option>
//             <option value="en">English</option>
//             <option value="vi">Tiếng Việt</option>
//           </select>
//         </label>
//       </div>
//       <span className="type-hint">
//         {listening ? "Waiting for you to finish…" : "or type below"}
//       </span>
//       {notice && (
//         <p className="voice-notice" role="status">
//           {notice}
//         </p>
//       )}
//     </section>
//   );
// }


import { Mic, Volume2, VolumeX, AudioLines, Check } from 'lucide-react';
import type { VoicePhase } from '../hooks/useVoiceInput';
import type { InputLanguage } from '../lib/language';

type Props = { 
  phase: VoicePhase; 
  transcript: { final: string; interim: string }; 
  busy: boolean; 
  onStart: () => void; 
  onStop: () => void; 
  voice: boolean; 
  onVoice: () => void; 
  supported: boolean; 
  notice: string; 
  inputLanguage: InputLanguage; 
  onInputLanguage: (value: InputLanguage) => void 
};

export function MicrophoneOrb({ phase, transcript, busy, onStart, onStop, voice, onVoice, supported, notice, inputLanguage, onInputLanguage }: Props) {
 const listening = phase === 'listening'; 
 const confirmed = phase === 'confirmed'; 
 const processing = phase === 'finishing' || confirmed; 
 const paused = phase === 'paused'; 
 const disabled = busy || processing;
 const received = 'Got it';

 return (
   <section className="voice-stage">
     <div className="stage-top">
       <span className="tiny-label">MEET YOUR NEW FRONT DESK</span>
       <span className="encrypted"><i/> Ready when you are</span>
     </div>
     
     <div className={`orb-wrap ${listening ? 'listening' : processing || busy ? 'processing' : ''}`}>
       <div className="orbit orbit-one"/>
       <div className="orbit orbit-two"/>
       <div className="orbit orbit-three"/>
       <button 
         className="orb" 
         aria-label={listening ? 'Finish speaking' : 'Start voice conversation'} 
         aria-pressed={listening} 
         disabled={disabled} 
         onClick={listening ? onStop : onStart}
       >
         {confirmed ? <Check size={44}/> : <Mic size={44} strokeWidth={1.5}/>}
       </button>
       <span className="orb-star star-one"/>
       <span className="orb-star star-two"/>
     </div>
     
     <h2>
       {confirmed ? `✓ ${received}` : listening ? 'Listening…' : processing ? 'Processing speech…' : busy ? 'Thinking…' : paused ? 'Continue when you’re ready' : 'I’m your AI receptionist'}
     </h2>
     
     {listening || processing || paused ? (
       <div className="live-transcript" aria-live="polite">
         <span>{transcript.final}</span>{' '}
         <span className="interim">{transcript.interim}</span>
         {!transcript.final && !transcript.interim && <span className="interim">Take your time. I’m listening.</span>}
       </div>
     ) : (
       <p>Ask about services, availability, pricing or book an appointment.</p>
     )}
     
     <div className="voice-controls">
       <button 
         className={`speak-button ${listening ? 'is-listening' : ''}`} 
         disabled={disabled} 
         onClick={listening ? onStop : onStart}
       >
         {listening ? <AudioLines className="waveform" size={18}/> : <Mic size={18}/>}
         {confirmed ? received : processing ? 'Finishing…' : listening ? 'Tap when finished' : paused ? 'Continue speaking' : 'Tap to speak'}
       </button>
       
       {paused && (
         <button className="send-now" disabled={!`${transcript.final}${transcript.interim}`.trim()} onClick={onStop}>
           Send now
         </button>
       )}
       
       <button 
         className="voice-toggle" 
         aria-label={voice ? 'Mute voice responses' : 'Unmute voice responses'} 
         onClick={onVoice}
       >
         {voice ? <Volume2 size={18}/> : <VolumeX size={18}/>}
       </button>
     </div>
     
     {notice && <div className="voice-notice text-rose-400 text-xs mt-2 font-medium">{notice}</div>}
   </section>
 );
}
