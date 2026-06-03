import { calcHours } from "./sessionUtils";

export default function SessionRow({ session, index, onUpdate }) {
  return (
    <div
      className="session-row"
      style={{
        animationDelay: `${index * 0.03}s`,
      }}
    >
      <div className="session-number">{session.numero}ª</div>

      <div className="session-fields">
        <div className="session-field">
          <div className="session-field-label">Data</div>

          <input
            type="date"
            value={session.data}
            onChange={(e) => onUpdate(index, "data", e.target.value)}
          />
        </div>

        <div className="session-field">
          <div className="session-field-label">H. Ini.</div>

          <input
            type="time"
            value={session.hIni}
            onChange={(e) => onUpdate(index, "hIni", e.target.value)}
          />
        </div>

        <div className="session-field">
          <div className="session-field-label">H. Fim</div>

          <input
            type="time"
            value={session.hFim}
            onChange={(e) => onUpdate(index, "hFim", e.target.value)}
          />
        </div>
      </div>

      <div className="session-hours">
        {calcHours(session.hIni, session.hFim) || "—"}
      </div>
    </div>
  );
}
