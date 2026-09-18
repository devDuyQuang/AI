import {
  Check,
  ArrowUpRight,
  Building2,
  Zap,
  CalendarDays,
} from "lucide-react";
export function LiveContextPanel({ count }: { count: number }) {
  return (
    <aside className="context">
      <div className="context-heading">
        <span className="tiny-label">LIVE CONTEXT</span>
        <span className="live-dot" />
      </div>
      <div className="context-item">
        <Building2 size={15} />
        <div>
          <small>Business</small>
          <strong>Aurora Nail Studio</strong>
          <span>Beauty & Personal Care</span>
        </div>
      </div>
      <div className="context-item">
        <Zap size={15} />
        <div>
          <small>Status</small>
          <strong className="online-text">
            AI Online <i />
          </strong>
        </div>
      </div>
      <div className="context-item">
        <CalendarDays size={15} />
        <div>
          <small>Today</small>
          <strong>4 available slots</strong>
          <span>
            {count
              ? `${count} appointment${count > 1 ? "s" : ""} saved`
              : "Ready to book your next visit"}
          </span>
        </div>
      </div>
      <div className="capability-list">
        <span className="tiny-label">CAPABILITIES</span>
        {[
          "Answer FAQs",
          "Service pricing",
          "Appointment booking",
          "Rescheduling",
          "Human handoff",
        ].map((c) => (
          <div key={c}>
            <Check size={13} />
            {c}
          </div>
        ))}
      </div>
      <div className="context-note">
        <span className="small-spark">✧</span>
        <p>
          A great first impression.
          <br />
          Every single time.
        </p>
      </div>
      <div className="powered">
        Powered by
        <strong>
          KhaiFrost AI Core <ArrowUpRight size={12} />
        </strong>
      </div>
    </aside>
  );
}
