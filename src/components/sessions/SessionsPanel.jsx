import SessionRow from "./SessionRow";
import { calcTotalMinutes } from "./SessionUtils";

export default function SessionsPanel({ sessions, onUpdate }) {
  const totalMinutes = calcTotalMinutes(sessions);

  const totalH = Math.floor(totalMinutes / 60);
  const totalM = totalMinutes % 60;

  return (
    <div className="sessions-panel">
      <div className="card mb-3">
        <div className="section-header">
          <div className="section-icon">🕐</div>

          <div>
            <h2>Sessões de Trabalho</h2>
            <p>Registre DATA, hora de início e fim de cada sessão (1ª a 15ª)</p>
          </div>
        </div>

        <div className="checklist-summary mb-3">
          <span className="summary-text">Total de horas:</span>

          <span
            className="summary-text"
            style={{
              color: "var(--blue-accent)",
              fontSize: 14,
            }}
          >
            {totalMinutes > 0
              ? `${totalH}h${
                  totalM > 0 ? String(totalM).padStart(2, "0") + "min" : ""
                }`
              : "—"}
          </span>
        </div>

        {sessions.map((session, index) => (
          <SessionRow
            key={index}
            session={session}
            index={index}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  );
}
