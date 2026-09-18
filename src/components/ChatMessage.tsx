import { Check, Clock3, CalendarDays, ArrowUpRight } from "lucide-react";
import type { Message } from "../types/demo";
export function ChatMessage({
  message,
  onChoice,
  disabled,
}: {
  message: Message;
  onChoice: (s: string) => void;
  disabled: boolean;
}) {
  const b = message.booking;
  const vi = message.language === "vi";
  return (
    <div className={`message ${message.role}`}>
      {message.role === "ai" && <div className="mini-orb">K</div>}
      <div className="message-body">
        <span className="message-author">
          {message.role === "ai" ? "KhaiFrost AI" : "You"}
          {message.role === "ai" && <span className="ai-tag">AI</span>}
        </span>
        <div className="bubble">{message.text}</div>
        {message.choices && (
          <div className="choices">
            {message.choices.map((c) => (
              <button disabled={disabled} key={c} onClick={() => onChoice(c)}>
                {c.includes("PM") ? (
                  <Clock3 size={13} />
                ) : (
                  <ArrowUpRight size={13} />
                )}{" "}
                {c}
              </button>
            ))}
          </div>
        )}
        {b && (
          <div className="confirmation">
            <div className="confirm-title">
              <span>
                <Check size={15} />
              </span>{" "}
              {vi ? "LỊCH HẸN ĐÃ XÁC NHẬN" : "APPOINTMENT CONFIRMED"}
            </div>
            <h3>{b.service}</h3>
            <div>
              <CalendarDays size={14} />
              {b.date === new Date().toLocaleDateString("en-CA")
                ? vi
                  ? "Hôm nay"
                  : "Today"
                : b.date}{" "}
              · {b.time}
            </div>
            <div>
              <Clock3 size={14} />
              {b.staff} · {b.duration} {vi ? "phút" : "min"}
              {b.service === "Nail Art"
                ? vi
                  ? " (ước tính)"
                  : " (estimated)"
                : ""}
            </div>
            <footer>
              <span>{vi ? "Mã xác nhận" : "Confirmation"}</span>
              <strong>{b.code}</strong>
            </footer>
            <small>
              {vi
                ? "Lịch hẹn của bạn đã được xác nhận."
                : "Your appointment is all set."}
            </small>
          </div>
        )}
      </div>
    </div>
  );
}
