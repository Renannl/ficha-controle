import { useMemo, useState } from 'react'
import { OPERACOES } from '../data/fichaTemplate'
import {
  getFichaStatus,
  getProgressPct
} from '../utils/fichaStatus'

export default function Dashboard({ fichas, user, onApprove }) {
  const [searchTerm, setSearchTerm] = useState('')
  const metrics = useMemo(() => {
    const total = fichas.length
    let concluidas = 0
    let reprovadas = 0
    let emAndamento = 0
    let novas = 0
    let totalItems = 0
    let itemsOk = 0
    let itemsNa = 0
    let totalFotos = 0
    let taf = 0
    let controle = 0
    let fotos = 0

    const fichaProgress = []

    fichas.forEach(f => {
      const itemCount = f.items.length
      totalItems += itemCount

      // Count by type
      if (f.operacao === '50') taf++
      else if (f.operacao === '80') fotos++
      else controle++

      // Count photos
      if (f.items) {
        f.items.forEach(item => {
          if (item.foto) totalFotos++
          if (item.resultado === 'ok') itemsOk++
          if (item.resultado === 'na') itemsNa++
        })
      }

      // Status
      const done = itemCount > 0
        ? f.items.filter(i =>
            i.resultado === 'ok' ||
            i.resultado === 'na'
          ).length
        : 0

      const pct = getProgressPct(f)

      const status = getFichaStatus(f)

      if (status === 'empty') {
        novas++
      }

      else if (
        [
          'progress',
          'waiting'
        ].includes(status)
      ) {
        emAndamento++
      }

      else if (status === 'rejected') {
        reprovadas++
      }

      else if (
        [
          'done',
          'approved'
        ].includes(status)
      ) {
        concluidas++
      }

      fichaProgress.push({
        id: f.id,
        nrInd: f.nrInd || '—',
        nome: f.nomeEquipamento || 'Sem nome',
        tipo: OPERACOES[f.operacao]?.nome || '—',
        pct,
        done,
        total: itemCount,
        status,
        statusAprovacao: f.statusAprovacao || null,
        criadoEm: f.criadoEm,
        finalizadaAt: f.finalizadaAt,
      })
    })

    const pctGeral = totalItems > 0 ? Math.round(((itemsOk + itemsNa) / totalItems) * 100) : 0

    // Sort by progress descending
    fichaProgress.sort((a, b) => b.pct - a.pct)

    return {
      total, concluidas, emAndamento, novas, reprovadas,
      totalItems, itemsOk, itemsNa, totalFotos,
      taf, controle, fotos,
      pctGeral,
      fichaProgress,
    }
  }, [fichas])

  const { total, concluidas, emAndamento, novas, reprovadas, totalItems, itemsOk, itemsNa, totalFotos, taf, controle, fotos, pctGeral, fichaProgress } = metrics

  const filteredFichas = useMemo(() => {
    if (!searchTerm) return fichaProgress
    const lower = searchTerm.toLowerCase()
    return fichaProgress.filter(f => 
      f.id.toLowerCase().includes(lower) || 
      f.nrInd.toLowerCase().includes(lower) ||
      f.nome.toLowerCase().includes(lower)
    )
  }, [fichaProgress, searchTerm])

  // Donut chart percentages
  const donutConcluida = total > 0 ? (concluidas / total) * 100 : 0
  const donutAndamento = total > 0 ? (emAndamento / total) * 100 : 0
  const donutNova = total > 0 ? (novas / total) * 100 : 0
  const donutReprovadas = total > 0 ? (reprovadas / total) * 100 : 0

  // Conic gradient for donut
  const conicGradient = total > 0
    ? `conic-gradient(
        var(--green) 0% ${donutConcluida}%,

        var(--amber)
        ${donutConcluida}%
        ${donutConcluida + donutAndamento}%,

        var(--red)
        ${donutConcluida + donutAndamento}%
        ${donutConcluida + donutAndamento + donutReprovadas}%,

        var(--text-muted)
        ${donutConcluida + donutAndamento + donutReprovadas}%
        100%
      )`
    : `conic-gradient(var(--border) 0% 100%)`

  // Type bar max
  const typeMax = Math.max(taf, controle, fotos, 1)

  // Recent finalized
  const recentFinalized = fichaProgress
    .filter(f =>
      [
        'done',
        'approved'
      ].includes(f.status)
    )
    .slice(0, 5)

  return (
    <div className="dashboard animate-scaleIn">
      {/* ─── Título ─── */}
      <div className="dash-title-row">
        <h2 className="dash-title">Dashboard</h2>
        <span className="dash-subtitle">{total} ficha{total !== 1 ? 's' : ''} registrada{total !== 1 ? 's' : ''}</span>
      </div>

      {/* ─── Progresso Geral ─── */}
      <div className="dash-section">
        <div className="dash-section-header">
          <h3>Progresso Geral</h3>
          <span className="dash-pct-badge">{pctGeral}%</span>
        </div>
        <div className="dash-progress-bar-lg">
          <div
            className="dash-progress-fill-lg"
            style={{ width: `${pctGeral}%` }}
          />
        </div>
        <div className="dash-progress-legend">
          <span>{itemsOk + itemsNa} de {totalItems} itens verificados</span>
        </div>
      </div>

      {/* ─── Gráfico Donut + Itens ─── */}
      <div className="dash-grid-2">
        {/* Donut */}
        <div className="dash-section">
          <h3 className="dash-section-h3">Status das Fichas</h3>
          <div className="dash-donut-wrap">
            <div
              className="dash-donut"
              style={{ background: conicGradient }}
            >
              <div className="dash-donut-hole">
                <span className="dash-donut-value">{total}</span>
                <span className="dash-donut-label">fichas</span>
              </div>
            </div>
          </div>
          <div className="dash-donut-legend">
            <div className="dash-legend-item">
              <span className="dash-legend-dot" style={{ background: 'var(--green)' }} />
              <span>Concluídas ({concluidas})</span>
            </div>
            <div className="dash-legend-item">
              <span className="dash-legend-dot" style={{ background: 'var(--amber)' }} />
              <span>Andamento ({emAndamento})</span>
            </div>
            <div className="dash-legend-item">
              <span
                className="dash-legend-dot"
                style={{ background: 'var(--red)' }}
              />
              <span>Reprovadas ({reprovadas})</span>
            </div>
            <div className="dash-legend-item">
              <span className="dash-legend-dot" style={{ background: 'var(--text-muted)' }} />
              <span>Novas ({novas})</span>
            </div>
          </div>
        </div>

        {/* Itens Verificados */}
        <div className="dash-section">
          <h3 className="dash-section-h3">Itens Verificados</h3>
          <div className="dash-items-summary">
            <div className="dash-item-stat">
              <div className="dash-item-stat-value" style={{ color: 'var(--green)' }}>{itemsOk}</div>
              <div className="dash-item-stat-label">OK ✓</div>
              <div className="dash-item-stat-bar">
                <div className="dash-item-stat-fill" style={{ width: `${totalItems > 0 ? (itemsOk / totalItems) * 100 : 0}%`, background: 'var(--green)' }} />
              </div>
            </div>
            <div className="dash-item-stat">
              <div className="dash-item-stat-value" style={{ color: 'var(--red)' }}>{itemsNa}</div>
              <div className="dash-item-stat-label">N/A ✗</div>
              <div className="dash-item-stat-bar">
                <div className="dash-item-stat-fill" style={{ width: `${totalItems > 0 ? (itemsNa / totalItems) * 100 : 0}%`, background: 'var(--red)' }} />
              </div>
            </div>
            <div className="dash-item-stat">
              <div className="dash-item-stat-value" style={{ color: 'var(--text-muted)' }}>{totalItems - itemsOk - itemsNa}</div>
              <div className="dash-item-stat-label">Pendente</div>
              <div className="dash-item-stat-bar">
                <div className="dash-item-stat-fill" style={{ width: `${totalItems > 0 ? ((totalItems - itemsOk - itemsNa) / totalItems) * 100 : 0}%`, background: 'var(--border-light)' }} />
              </div>
            </div>
          </div>
          <div className="dash-foto-stat">
            <span className="dash-foto-count">{totalFotos}</span>
            <span className="dash-foto-label">foto{totalFotos !== 1 ? 's' : ''} registrada{totalFotos !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* ─── Distribuição por Tipo ─── */}
      <div className="dash-section">
        <h3 className="dash-section-h3">Distribuição por Tipo</h3>
        <div className="dash-type-bars">
          <div className="dash-type-row">
            <span className="dash-type-label">TAF</span>
            <div className="dash-type-bar-track">
              <div className="dash-type-bar-fill dash-type-taf" style={{ width: `${(taf / typeMax) * 100}%` }} />
            </div>
            <span className="dash-type-count">{taf}</span>
          </div>
          <div className="dash-type-row">
            <span className="dash-type-label">Controle</span>
            <div className="dash-type-bar-track">
              <div className="dash-type-bar-fill dash-type-controle" style={{ width: `${(controle / typeMax) * 100}%` }} />
            </div>
            <span className="dash-type-count">{controle}</span>
          </div>
          <div className="dash-type-row">
            <span className="dash-type-label">Fotos</span>
            <div className="dash-type-bar-track">
              <div className="dash-type-bar-fill dash-type-fotos" style={{ width: `${(fotos / typeMax) * 100}%` }} />
            </div>
            <span className="dash-type-count">{fotos}</span>
          </div>
        </div>
      </div>

      {/* ─── Ranking de Progresso ─── */}
      {fichaProgress.length > 0 && (
        <div className="dash-section">
          <h3 className="dash-section-h3">Ranking de Progresso</h3>
          <div className="dash-ranking">
            {fichaProgress.slice(0, 8).map((f, i) => (
              <div key={f.id} className="dash-rank-item">
                <span className="dash-rank-pos">#{i + 1}</span>
                <div className="dash-rank-info">
                  <div className="dash-rank-name">{f.nome}</div>
                  <div className="dash-rank-type">{f.tipo}</div>
                </div>
                <div className="dash-rank-bar-wrap">
                  <div className="dash-rank-bar">
                    <div
                      className="dash-rank-bar-fill"
                      style={{
                        width: `${f.pct}%`,
                        background:
                          f.status === 'approved'
                            ? 'var(--green)'

                            : f.status === 'waiting'
                            ? 'var(--amber)'

                            : f.status === 'done'
                            ? 'var(--blue)'

                            : f.status === 'progress'
                            ? 'var(--amber)'

                            : f.status === 'rejected'
                            ? 'var(--red)'

                            : 'var(--border-light)'
                      }}
                    />
                  </div>
                </div>
                <span className="dash-rank-pct">{f.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Últimas Finalizadas ─── */}
      {recentFinalized.length > 0 && (
        <div className="dash-section">
          <h3 className="dash-section-h3">Últimas Finalizadas</h3>
          <div className="dash-recent">
            {recentFinalized.map(f => (
              <div key={f.id} className="dash-recent-item">
                <div className="dash-recent-dot" />
                <div className="dash-recent-info">
                  <div className="dash-recent-name">{f.nome}</div>
                  <div className="dash-recent-type">{f.tipo} · {f.done}/{f.total} itens</div>
                </div>
                <span className="dash-recent-badge">100%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Lista Detalhada com Busca ─── */}
      <div className="dash-section">
        <h3 className="dash-section-h3">Relação de Painéis e Consultas</h3>
        <input 
          type="text" 
          placeholder="🔍 Buscar por ID, IND ou Nome do Painel..." 
          className="search-input" 
          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-main)', marginBottom: '15px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', background: 'var(--bg-elevated)', position: 'sticky', top: 0, zIndex: 10 }}>
                <th style={{ padding: '10px' }}>ID</th>
                <th style={{ padding: '10px' }}>IND</th>
                <th style={{ padding: '10px' }}>Nome/Equipamento</th>
                <th style={{ padding: '10px' }}>Progresso</th>
                <th style={{ padding: '10px' }}>Status</th>
                <th style={{ padding: '10px' }}>Aprovação</th>
              </tr>
            </thead>
            <tbody>
              {filteredFichas.length > 0 ? filteredFichas.map(f => (
                <tr key={f.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-muted)' }}>{f.id.slice(0, 8)}</td>
                  <td style={{ padding: '10px', fontWeight: 600 }}>{f.nrInd}</td>
                  <td style={{ padding: '10px' }}>{f.nome}</td>
                  <td style={{ padding: '10px' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <div style={{ flex: 1, background: 'var(--border-light)', height: '6px', borderRadius: '3px' }}>
                         <div style={{ width: `${f.pct}%`, background: f.pct === 100 ? 'var(--green)' : 'var(--amber)', height: '100%', borderRadius: '3px' }} />
                       </div>
                       <span style={{ fontSize: '12px' }}>{f.done}/{f.total}</span>
                     </div>
                  </td>
                    <td style={{ padding: '10px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 600,

                        background:
                          f.status === 'approved'
                            ? 'var(--green)'
                            : f.status === 'waiting'
                            ? 'var(--amber)'
                            : f.status === 'done'
                            ? 'var(--blue)'
                            : f.status === 'progress'
                            ? 'var(--amber)'
                            : f.status === 'rejected'
                            ? 'var(--red)'
                            : 'var(--bg-secondary)',

                        color:
                          f.status === 'empty'
                            ? 'var(--text-main)'
                            : '#fff'
                      }}>
                        {
                          f.status === 'approved'
                            ? 'APROVADA'

                            : f.status === 'waiting'
                            ? 'AGUARDANDO'

                            : f.status === 'done'
                            ? 'PREENCHIDA'

                            : f.status === 'progress'
                            ? 'EM ANDAMENTO'

                            : f.status === 'rejected'
                            ? 'REPROVADA'

                            : 'NOVA'
                        }
                      </span>
                    </td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                        background: f.statusAprovacao === 'aprovado' ? 'var(--green)' : 
                                    f.statusAprovacao === 'reprovado' ? 'var(--red)' : 
                                    f.statusAprovacao === 'aguardando' ? 'var(--amber)' : 'transparent',
                        color: (f.statusAprovacao === 'aprovado' || f.statusAprovacao === 'reprovado') ? '#fff' : 
                               f.statusAprovacao === 'aguardando' ? '#000' : 'var(--text-muted)'
                      }}>
                        {f.statusAprovacao === 'aprovado' ? 'APROVADO' : 
                         f.statusAprovacao === 'reprovado' ? 'REPROVADO' : 
                         f.statusAprovacao === 'aguardando' ? 'AGUARDANDO APROVAÇÃO' : '—'}
                      </span>
                      {f.statusAprovacao === 'aguardando' && user?.permissoes?.includes('aprovar') && (
                        <button onClick={() => onApprove(f.id, 'aprovado')} style={{ fontSize: '14px', background: 'transparent', border: 'none', cursor: 'pointer' }} title="Aprovar">✅</button>
                      )}
                      {f.statusAprovacao === 'aguardando' && user?.permissoes?.includes('rejeitar') && (
                        <button onClick={() => onApprove(f.id, 'reprovado')} style={{ fontSize: '14px', background: 'transparent', border: 'none', cursor: 'pointer' }} title="Rejeitar">❌</button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum painel encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty state */}
      {total === 0 && (
        <div className="dash-empty">
          <p>Crie fichas para visualizar métricas e gráficos aqui.</p>
        </div>
      )}
    </div>
  )
}
