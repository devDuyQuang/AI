function makeId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  AudioLines,
  Clock3,
  Tags,
  CalendarPlus,
  Headphones,
  Sparkles,
} from "lucide-react";
import { initialSession } from "../data/demoData";
import { keys, readBookings, readSession, save } from "../lib/storage";
import { respond } from "../lib/mockAi";
import { canSpeak, speak } from "../lib/speech";
import { recognitionLocale, type DemoLanguage } from "../lib/language";
import { useVoiceInput } from "../hooks/useVoiceInput";
import type { Session } from "../types/demo";
import { MicrophoneOrb } from "./MicrophoneOrb";
import { ChatMessage } from "./ChatMessage";
import { LiveContextPanel } from "./LiveContextPanel";
import { ScenarioCards } from "./ScenarioCards";

const quickActions = [
  { icon: Clock3, label: "Opening hours" },
  { icon: Tags, label: "Service prices" },
  { icon: CalendarPlus, label: "Book appointment" },
  { icon: Headphones, label: "Talk to staff" },
];

export function AiReceptionistDemo() {
  const [session, setSession] = useState(readSession);
  const [bookings, setBookings] = useState(readBookings);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [voice, setVoice] = useState(true);
  const [storageWarning, setStorageWarning] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const scroller = useRef<HTMLDivElement>(null);
  const pending = useRef(false);
  const voiceRef = useRef(voice);
  voiceRef.current = voice;
  
  const [inputLanguage, setInputLanguage] = useState<"auto" | "en" | "vi">("en");
  
  const voiceInput = useVoiceInput(
    send,
    busy,
    recognitionLocale(inputLanguage, session.language),
  );

  useEffect(() => {
    if (!save(keys.inputLanguage, inputLanguage)) setStorageWarning(true);
  }, [inputLanguage]);

  useEffect(() => {
    if (!save(keys.session, session)) setStorageWarning(true);
  }, [session]);

  useEffect(() => {
    if (!save(keys.bookings, bookings)) setStorageWarning(true);
  }, [bookings]);

  useEffect(() => {
    if (scroller.current)
      scroller.current.scrollTo({
        top: scroller.current.scrollHeight,
        behavior: "smooth",
      });
  }, [session, busy]);

  useEffect(
    () => () => {
      clearTimeout(timer.current);
      if (canSpeak()) window.speechSynthesis.cancel();
    },
    [],
  );

  function send(
    query: string,
    base: Session = session,
    choiceLanguage?: DemoLanguage,
  ) {
    if (!query.trim() || pending.current) return;
    voiceInput.cancel();
    if (canSpeak()) window.speechSynthesis.cancel();
    pending.current = true;
    setBusy(true);
    setInput("");
    const next = {
      ...base,
      messages: [
        ...base.messages,
        { id: makeId(), role: "user" as const, text: query.trim() },
      ],
    };
    setSession(next);
    timer.current = setTimeout(
      () => {
        const result = respond(query, base.flow, bookings, choiceLanguage);
        setSession({
          messages: [...next.messages, result.message],
          flow: result.flow,
          language: result.language,
        });
        if (result.booking) {
          const b = result.booking;
          setBookings((old) => [...old.filter((x) => x.code !== b.code), b]);
        }
        setBusy(false);
        pending.current = false;
        if (voiceRef.current) speak(result.message.text, result.language);
      },
      650 + Math.random() * 220,
    );
  }

  function scenario(q: string) {
    clearTimeout(timer.current);
    voiceInput.cancel();
    pending.current = false;
    setBusy(false);
    send(q, initialSession());
    document
      .getElementById("demo")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      {/* BANNER ĐƯỢC ĐƯA LÊN TRÊN CÙNG TRANG, TRÀN VIỀN 100% VÀ TỰ ĐỘNG RESPONSIVE */}
      <div style={{
        width: '100%',
        backgroundColor: '#1e293b',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '8px 12px',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        flexWrap: 'wrap' /* Giúp tự động xuống dòng mượt mà trên điện thoại */
      }}>
        <span style={{
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          color: '#fbbf24',
          fontSize: '10px',
          fontWeight: '800',
          padding: '2px 6px',
          borderRadius: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          whiteSpace: 'nowrap'
        }}>
          Demo Mode
        </span>
        <span style={{ 
          fontSize: '12px', 
          fontWeight: '500', 
          color: '#94a3b8',
          lineHeight: '1.4'
        }}>
          Simulated responses for preview. Production version connects directly to production-grade LLM brains.
        </span>
      </div>

      <section id="demo" className="demo-section" style={{ marginTop: '0' }}>
        <div className="demo-overline">
          <span>
            <i /> AI RECEPTIONIST
          </span>
          <span>Experience the conversation.</span>
        </div>
        <div className="demo-shell">
          <div className="demo-header">
            <div className="assistant-logo">
              <AudioLines size={22} />
            </div>
            <div>
              {/* HUY HIỆU LIVE ACTIVE GIỮ NGUYÊN KIỂU SANG TRỌNG HOẶC ĐỔI TIÊU ĐỀ PHỤ */}
              <h2>
                KhaiFrost AI Receptionist{" "}
                <span className="online-badge">
                  <i /> Online
                </span>
              </h2>
              <p>
                Aurora Nail Studio <span>·</span> Interactive Preview
              </p>
            </div>
            <span className="demo-header-end">
              <span /> SYSTEM ACTIVE
            </span>
          </div>
          
          <div className="demo-layout">
            <div className="demo-main">
              <MicrophoneOrb
                phase={voiceInput.phase}
                transcript={voiceInput.transcript}
                busy={busy}
                onStart={voiceInput.start}
                onStop={voiceInput.stop}
                voice={voice}
                onVoice={() => {
                  if (voice && canSpeak()) window.speechSynthesis.cancel();
                  setVoice(!voice);
                }}
                supported={canSpeak()}
                notice={voiceInput.notice}
                inputLanguage={inputLanguage}
                onInputLanguage={setInputLanguage}
              />
              <div className="chat">
                <div className="chat-heading">
                  <span>YOUR CONVERSATION</span>
                  <span>Today</span>
                </div>
                <div
                  className="messages"
                  ref={scroller}
                  role="log"
                  aria-label="Conversation"
                  aria-live="polite"
                >
                  {session.messages.map((m, i) => (
                    <ChatMessage
                      key={m.id}
                      message={m}
                      onChoice={(q) => send(q, session, m.language)}
                      disabled={busy || i !== session.messages.length - 1}
                    />
                  ))}
                  {busy && (
                    <div className="thinking">
                      <div className="mini-orb">K</div>
                      <span>Thinking</span>
                      <i />
                      <i />
                      <i />
                    </div>
                  )}
                </div>
                <div className="composer">
                  <div className="quick-actions">
                    {quickActions.map(({ icon: Icon, label }) => (
                      <button
                        key={label}
                        disabled={busy}
                        onClick={() => send(label)}
                      >
                        <Icon size={12} />
                        {label}
                      </button>
                    ))}
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      send(input);
                    }}
                  >
                    <input
                      aria-label="Ask me anything"
                      placeholder="Ask me anything..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      maxLength={1000}
                    />
                    <span className="enter-hint">↵</span>
                    <button
                      disabled={busy || !input.trim()}
                      aria-label="Send message"
                    >
                      <ArrowUp size={20} />
                    </button>
                  </form>
                  <div className="composer-note">
                    <Sparkles size={11} />
                    {storageWarning
                      ? "Browser storage unavailable. This session won’t persist after refresh."
                      : "Powered by KhaiFrost AI Core"}
                  </div>
                </div>
              </div>
            </div>
            <LiveContextPanel count={bookings.length} />
          </div>
        </div>
      </section>
      <ScenarioCards onScenario={scenario} />
    </>
  );
}

