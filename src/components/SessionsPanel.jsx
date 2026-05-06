export default function SessionsPanel({ sessions, onUpdate }) {
  function calcHours(hIni, hFim) {
    if (!hIni || !hFim) return ''
    const [h1, m1] = hIni.split(':').map(Number)
    const [h2, m2] = hFim.split(':').map(Number)
    const mins = (h2 * 60 + m2) - (h1 * 60 + m1)
    if (mins <= 0) return ''
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${h}h${m > 0 ? String(m).padStart(2, '0') : ''}`
  }

  const totalMinutes = sessions.reduce((sum, s) => {
    if (!s.hIni || !s.hFim) return sum
    const [h1, m1] = s.hIni.split(':').map(Number)
    const [h2, m2] = s.hFim.split(':').map(Number)
    const mins = (h2 * 60 + m2) - (h1 * 60 + m1)
    return sum + (mins > 0 ? mins : 0)
  }, 0)

  const totalH = Math.floor(totalMinutes / 60)
  const totalM = totalMinutes % 60

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

        {/* Total */}
        <div className="checklist-summary mb-3">
          <span className="summary-text">Total de horas:</span>
          <span className="summary-text" style={{ color: 'var(--blue-accent)', fontSize: 14 }}>
            {totalMinutes > 0 ? `${totalH}h${totalM > 0 ? String(totalM).padStart(2, '0') + 'min' : ''}` : '—'}
          </span>
        </div>

        {/* Session rows */}
        {sessions.map((session, index) => (
          <div key={index} className="session-row" style={{ animationDelay: `${index * 0.03}s` }}>
            <div className="session-number">{session.numero}ª</div>
            <div className="session-fields">
              <div className="session-field">
                <div className="session-field-label">Data</div>
                <input
                  type="date"
                  value={session.data}
                  onChange={(e) => onUpdate(index, 'data', e.target.value)}
                />
              </div>
              <div className="session-field">
                <div className="session-field-label">H. Ini.</div>
                <input
                  type="time"
                  value={session.hIni}
                  onChange={(e) => onUpdate(index, 'hIni', e.target.value)}
                />
              </div>
              <div className="session-field">
                <div className="session-field-label">H. Fim</div>
                <input
                  type="time"
                  value={session.hFim}
                  onChange={(e) => onUpdate(index, 'hFim', e.target.value)}
                />
              </div>
            </div>
            <div className="session-hours">
              {calcHours(session.hIni, session.hFim) || '—'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
