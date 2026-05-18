import { useState, useEffect, useRef } from 'react'
import { OPERACOES } from '../data/fichaTemplate'
import { ROLES } from '../data/users'
import PhotoBank from './PhotoBank'
import Dashboard from './Dashboard'
import ConfirmModal from './ConfirmModal'

export default function HomeScreen({ fichas, onNova, onOpen, onDelete, user, onLogout, theme, onToggleTheme, onOpenAdmin, onApprove }) {
  const [filterStatus, setFilterStatus] = useState(() => localStorage.getItem('homeFilterStatus') || 'all')
  const [filterType, setFilterType] = useState(() => localStorage.getItem('homeFilterType') || 'all')

  useEffect(() => {
    localStorage.setItem('homeFilterStatus', filterStatus)
  }, [filterStatus])

  useEffect(() => {
    localStorage.setItem('homeFilterType', filterType)
  }, [filterType])
  const [showNewMenu, setShowNewMenu] = useState(false)
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('homeViewMode') || 'list')
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [deleteId, setDeleteId] = useState(null) // ID da ficha para deletar

  // ─── Drag Logic for Tabs ───
  const toggleRef = useRef(null)
  const [dragOffset, setDragOffset] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleTouchStart = (e) => {
    setIsDragging(true)
    updateDragPosition(e.touches[0].clientX)
  }
  const handleTouchMove = (e) => {
    if (!isDragging) return
    updateDragPosition(e.touches[0].clientX)
  }
  const handleTouchEnd = () => {
    if (!isDragging) return
    if (dragOffset !== null) {
      if (dragOffset < 0.33) setViewMode('list')
      else if (dragOffset < 0.66) setViewMode('gallery')
      else setViewMode('dashboard')
    }
    setIsDragging(false)
    setDragOffset(null)
  }
  const updateDragPosition = (clientX) => {
    if (!toggleRef.current) return
    const rect = toggleRef.current.getBoundingClientRect()
    let x = (clientX - rect.left) / rect.width
    x = Math.max(0.16, Math.min(0.84, x))
    setDragOffset(x)
  }

  useEffect(() => {
    localStorage.setItem('homeViewMode', viewMode)
  }, [viewMode])

  const hasPerm = (roles = []) => {
    return roles.includes(user?.role)
  }

  const availableOps =
    Object.values(OPERACOES).filter(op => {

      // TAF
      if (op.codigo === '50') {

        return hasPerm([
          'admin',
          'qualidade'
        ])
      }

      // FOTO
      if (op.codigo === '80') {

        return hasPerm([
          'admin',
          'engenharia'
        ])
      }

      // CONTROLE NORMAL
      return hasPerm([
        'admin',
        'producao',
        'qualidade'
      ])
    })

  const total = fichas.length
  const emAndamento = fichas.filter(f => {
    const done = f.items.length > 0 ? f.items.filter(i => i.resultado === 'ok' || i.resultado === 'na').length : 0
    return done > 0 && done < f.items.length
  }).length
  const concluidas = fichas.filter(f => {
    const done = f.items.length > 0 ? f.items.filter(i => i.resultado === 'ok' || i.resultado === 'na').length : 0
    return done === f.items.length && f.items.length > 0
  }).length

  const filteredFichas = fichas.filter(f => {
    // Filtro de Status
    const statusMatch = filterStatus === 'all' ? true : getStatus(f) === filterStatus

    // Filtro de Tipo (TAF ou Controle ou Foto)
    const isTaf = f.operacao === '50'
    const isFoto = f.operacao === '80'
    let typeMatch = true;
    if (filterType === 'taf') typeMatch = isTaf;
    else if (filterType === 'controle') typeMatch = !isTaf && !isFoto;
    else if (filterType === 'foto') typeMatch = isFoto;

    // Filtro de Pesquisa
    const term = searchTerm.toLowerCase()
    const searchMatch = !searchTerm ||
      (f.nomeEquipamento || '').toLowerCase().includes(term) ||
      (f.id || '').toLowerCase().includes(term) ||
      (f.codigo || '').toLowerCase().includes(term) ||
      (f.cliente || '').toLowerCase().includes(term);

    return statusMatch && typeMatch && searchMatch
  })

  function getStatus(ficha) {
    if (ficha.statusAprovacao === 'reprovado') return 'rejected'
    if (ficha.status === 'finalizada' && (!ficha.statusAprovacao || ficha.statusAprovacao === 'aguardando')) return 'aguardando'
    if (ficha.statusAprovacao === 'aprovado') return 'approved'
    const total = ficha.items.length
    if (total === 0) return 'empty'
    const done = ficha.items.filter(i => i.resultado === 'ok' || i.resultado === 'na').length
    if (done === 0) return 'empty'
    if (done === total) return 'done'
    return 'progress'
  }

  function getProgressPct(ficha) {
    const total = ficha.items.length
    if (total === 0) return 0
    const done = ficha.items.filter(i => i.resultado === 'ok' || i.resultado === 'na').length
    return Math.round((done / total) * 100)
  }

  function handleDelete(e, id) {
    e.stopPropagation()
    setDeleteId(id)
  }

  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId)
      setDeleteId(null)
    }
  }

  const handleCreateNew = (code) => {
    setShowNewMenu(false)
    onNova(code)
  }

  return (
    <div className="home">
      {/* Background decoration */}
      <div className="home-bg-decoration">
        <div className="login-bg-circle login-bg-circle-1" />
        <div className="login-bg-circle login-bg-circle-2" />
        <div className="login-bg-circle login-bg-circle-3" />
      </div>

      {/* User bar */}
      <div className="user-bar">
        <div className="user-info">
          <div className="user-avatar">
            {(user?.nome || '?')[0].toUpperCase()}
          </div>
          <div>
            <div className="user-name">{user?.nome || 'Usuário'}</div>
            <div className="user-role">{user?.role ? ROLES[user.role] : ''}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="logout-btn" onClick={onToggleTheme} title="Alternar Tema">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          {user?.role === 'admin' && (
            <button className="logout-btn" onClick={onOpenAdmin} title="Administração">
              ⚙️
            </button>
          )}
          <button className="logout-btn" onClick={onLogout} title="Sair do Sistema">
            🚪
          </button>
        </div>
      </div>

      {/* Brand + stats */}
      <div className="home-header">
        <div className="home-brand">
          <div className="brand-logo-wrap">
            <img src="/ip.png" alt="Logo" className="home-logo-img" />
          </div>
          <div>
            <h1>Ficha de Controle</h1>
          </div>
        </div>
        <div className="home-stats">
          <div className="stat-card">
            <div className="stat-value">{total}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--amber)' }}>{emAndamento}</div>
            <div className="stat-label">Em Andamento</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--green)' }}>{concluidas}</div>
            <div className="stat-label">Concluídas</div>
          </div>
        </div>
      </div>

      {/* View Toggles */}
      <div 
        className="home-view-toggle" 
        ref={toggleRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className={`view-toggle-slider ${isDragging ? 'dragging' : ''}`} 
          style={{ 
            left: isDragging 
              ? `calc(${dragOffset * 100}% - (33.33% / 2) + var(--toggle-pad))` 
              : viewMode === 'list' ? 'var(--toggle-pad)' : viewMode === 'gallery' ? 'calc(33.33% + var(--toggle-pad))' : 'calc(66.66% + var(--toggle-pad))',
            width: 'calc(33.33% - (var(--toggle-pad) * 2))'
          }}
        ></div>
        <button
          className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
        >
          📋 Relatórios
        </button>
        <button
          className={`view-toggle-btn ${viewMode === 'gallery' ? 'active' : ''}`}
          onClick={() => setViewMode('gallery')}
        >
          🖼️ Banco de Fotos
        </button>
        <button
          className={`view-toggle-btn ${viewMode === 'dashboard' ? 'active' : ''}`}
          onClick={() => setViewMode('dashboard')}
        >
          📊 Métricas
        </button>
      </div>

      {/* Conteúdo Dinâmico */}
      {viewMode === 'dashboard' ? (
        <div style={{ padding: '16px', paddingBottom: '100px' }}>
          <Dashboard fichas={fichas} user={user} onApprove={onApprove} />
        </div>
      ) : viewMode === 'gallery' ? (
        <PhotoBank fichas={fichas} />
      ) : (
        <>
          {/* Lista */}
          {fichas.length === 0 && !showNewMenu ? (
            <div className="home-empty" style={{ paddingBottom: 120 }}>
              <div className="empty-icon">📋</div>
              <p>Nenhuma ficha criada ainda. Toque no botão + para começar.</p>
            </div>
          ) : (
            <div className="home-list">
              <div className="home-list-header flex items-center justify-between mb-3" style={{ flexWrap: 'wrap', gap: '8px', gridColumn: '1 / -1', width: '100%' }}>
                <div className="flex items-center gap-2">
                  {!showSearch && <div className="home-list-title" style={{ marginBottom: 0 }}>Fichas Recentes</div>}

                  <div className={`search-container ${showSearch ? 'active' : ''}`}>
                    <button
                      className="search-toggle-btn"
                      onClick={() => {
                        setShowSearch(!showSearch)
                        if (showSearch) setSearchTerm('')
                      }}
                    >
                      {showSearch ? '✕' : '🔍'}
                    </button>
                    {showSearch && (
                      <input
                        className="search-input animate-slideInRight"
                        type="text"
                        placeholder="Nome ou código..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                      />
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {/* Filtro de Tipo */}
                  <select
                    className="text-xs font-semibold"
                    style={{
                      background: 'var(--blue-glow) url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%233CA3AB\' stroke-width=\'2\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E") no-repeat right 8px center',
                      border: '1px solid var(--blue-accent)',
                      borderRadius: 'var(--radius-xs)',
                      padding: '6px 24px 6px 10px',
                      color: 'var(--blue-primary)',
                      outline: 'none',
                      cursor: 'pointer',
                      appearance: 'none',
                      WebkitAppearance: 'none'
                    }}
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">Todos</option>
                    <option value="taf">⚡ TAF</option>
                    <option value="controle">📋 Controle</option>
                    <option value="foto">📸 Fotos</option>
                  </select>

                  {/* Filtro de Status */}
                  <select
                    className="text-xs font-semibold"
                    style={{
                      background: 'var(--bg-elevated) url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%237A8FA6\' stroke-width=\'2\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E") no-repeat right 8px center',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-xs)',
                      padding: '6px 24px 6px 10px',
                      color: 'var(--text-secondary)',
                      outline: 'none',
                      cursor: 'pointer',
                      appearance: 'none',
                      WebkitAppearance: 'none'
                    }}
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">Status</option>
                    <option value="progress">Andamento</option>
                    <option value="done">Concluídas</option>
                    <option value="empty">Novas</option>
                  </select>
                </div>
              </div>
              {filteredFichas.length === 0 ? (
                <div className="text-center py-12 opacity-60 text-sm card-glow-none" style={{padding: '20px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)'}}>
                  Nenhuma ficha encontrada para estes filtros.
                </div>
              ) : (
                filteredFichas.map((ficha, i) => {
                  const status = getStatus(ficha)
                  const pct = getProgressPct(ficha)
                  return (
                    <div
                      key={ficha.id}
                      className={`ficha-card status-${status}`}
                      style={{ animationDelay: `${i * 0.05}s` }}
                      onClick={() => onOpen(ficha.id)}
                    >
                      <div className="ficha-card-top">
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="ficha-card-title">
                            {ficha.nomeEquipamento || 'Sem nome'}
                          </div>
                          <div className="ficha-card-sub">
                            {OPERACOES[ficha.operacao]?.nome || '—'} · {ficha.cliente || '—'}
                          </div>
                        </div>
                        <button
                          className="delete-btn"
                          onClick={(e) => handleDelete(e, ficha.id)}
                          title="Excluir"
                        >🗑</button>
                      </div>
                      <div className="ficha-card-bottom">
                        <div className="flex items-center gap-2">
                          {status === 'rejected' && <span className="badge badge-danger" style={{ background: 'var(--red)', color: 'white', fontWeight: 'bold' }}>⚠️ REFAZER</span>}
                          {status === 'aguardando' && <span className="badge badge-amber" style={{ background: 'var(--amber)', color: '#000', fontWeight: 'bold' }}>⏳ Aguardando Aprovação</span>}
                          {status === 'approved' && <span className="badge badge-green" style={{ background: 'var(--green)', color: 'white', fontWeight: 'bold' }}>✓ Aprovada</span>}
                          {status === 'done' && <span className="badge badge-blue" style={{ background: 'var(--blue)', color: 'white' }}>📋 Preenchida</span>}
                          {status === 'progress' && <span className="badge badge-amber">Em andamento</span>}
                          {status === 'empty' && <span className="badge badge-muted">Nova</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="progress-bar" style={{ width: 50 }}>
                            <div className="progress-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs font-bold text-blue">{pct}%</span>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </>
      )}

      {/* NEW FICHA MENU Overlay */}
      {showNewMenu && (
        <div className="new-ficha-overlay animate-fadeIn" onClick={() => setShowNewMenu(false)}>
          <div className="new-ficha-menu animate-slideUp" onClick={e => e.stopPropagation()}>
            <div className="new-ficha-menu-header">
              <h3>Selecione o Modelo</h3>
              <p>Escolha qual ficha deseja iniciar agora</p>
            </div>
            <div className="new-ficha-options">
              {availableOps.map(op => (
                <button
                  key={op.codigo}
                  className="new-ficha-opt-btn"
                  onClick={() => handleCreateNew(op.codigo)}
                >
                  <div className="opt-icon">📝</div>
                  <div className="opt-text">
                    <div className="opt-title">{op.nome}</div>
                    <div className="opt-desc">{op.objetivo}</div>
                  </div>
                </button>
              ))}
            </div>
            <button className="btn btn-ghost w-full mt-3" onClick={() => setShowNewMenu(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        className={`fab ${showNewMenu ? 'fab-active' : ''}`}
        onClick={() => setShowNewMenu(!showNewMenu)}
        title="Nova Ficha"
      >
        {showNewMenu ? '✕' : '+'}
      </button>
      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal 
        isOpen={!!deleteId}
        title="Excluir Ficha?"
        message="Esta ação não pode ser desfeita. Todos os dados desta ficha serão removidos permanentemente."
        confirmText="Excluir"
        cancelText="Manter"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        type="danger"
      />
    </div>
  )
}
