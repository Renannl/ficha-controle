import { useState, useEffect, useRef } from 'react'
import { OPERACOES } from '../data/fichaTemplate'
import { ROLES } from '../data/users'
import PhotoBank from './PhotoBank'
import Dashboard from './Dashboard'
import ConfirmModal from './ConfirmModal'
import {
  getFichaStatus,
  getProgressPct
} from '../utils/fichaStatus'
import {
  Moon,
  Sun,
  Settings,
  LogOut,
  LayoutList,
  Images,
  BarChart3,
  ClipboardList,
  Search,
  X,
  Zap,
  Camera,
  User,
  Tag,
  Trash2,
  Plus,
  FileText,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Circle,
  UserPlus
} from 'lucide-react'

// ADICIONADO: 'listaUsuarios' e 'onAtualizarOperadores' nas propriedades recebidas
export default function HomeScreen({ fichas, onNova, onOpen, onDelete, user, onLogout, theme, onToggleTheme, onOpenAdmin, onApprove, listaUsuarios = [], onAtualizarOperadores }) {
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

  // ADICIONADO: Estado para controlar qual menu drop-down de usuário está aberto (guarda o ID da ficha)
  const [activeDropdownFichaId, setActiveDropdownFichaId] = useState(null)

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

  const hasPerm = (perms = []) => {
    // ADMIN vê tudo
    if (user?.role === 'admin') {
      return true
    }
    // Verifica permissões do usuário
    return perms.some(p =>
      user?.permissoes?.includes(p)
    )
  }

  const availableOps =
    Object.values(OPERACOES).filter(op => {
      // TAF
      if (op.codigo === '50') {
        return hasPerm(['taf'])
      }
      // FOTO
      if (op.codigo === '80') {
        return hasPerm(['fotos'])
      }
      // CONTROLE
      return hasPerm(['controle'])
    })

  const total = fichas.length
  const emAndamento = fichas.filter(f =>
    [
      'progress',
      'waiting'
    ].includes(getFichaStatus(f))
  ).length

  const concluidas = fichas.filter(f =>
    [
      'done',
      'approved'
    ].includes(getFichaStatus(f))
  ).length

  const filteredFichas = fichas.filter(f => {
    const statusMatch =
      filterStatus === 'all'
        ? true
        : getFichaStatus(f) === filterStatus

    const isTaf = f.operacao === '50'
    const isFoto = f.operacao === '80'

    let typeMatch = true

    if (filterType === 'taf') {
      typeMatch = isTaf
    }
    else if (filterType === 'controle') {
      typeMatch = !isTaf && !isFoto
    }
    else if (filterType === 'foto') {
      typeMatch = isFoto
    }

    const term = searchTerm.toLowerCase()

    const searchMatch =
      !searchTerm ||
      (f.nomeEquipamento || '')
        .toLowerCase()
        .includes(term) ||
      (f.id || '')
        .toLowerCase()
        .includes(term) ||
      (f.codigo || '')
        .toLowerCase()
        .includes(term) ||
      (f.cliente || '')
        .toLowerCase()
        .includes(term)

    return (
      statusMatch &&
      typeMatch &&
      searchMatch
    )
  })

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

  // ADICIONADO: Gerencia a atribuição de operadores à ficha
  const handleToggleOperadorFicha = (e, ficha, usuario) => {
    e.stopPropagation(); // Não abre a ficha ao clicar no item da lista
    
    const operadoresAtuais = ficha.operadores || [];
    const jaExiste = operadoresAtuais.some(op => op.id === usuario.id || op.username === usuario.username);
    
    let novosOperadores;
    if (jaExiste) {
      // Remove se clicar em alguém que já está ativo
      novosOperadores = operadoresAtuais.filter(op => op.id !== usuario.id && op.username !== usuario.username);
    } else {
      // Adiciona o novo operador
      novosOperadores = [...operadoresAtuais, { id: usuario.id, nome: usuario.nome, username: usuario.username }];
    }

    if (onAtualizarOperadores) {
      onAtualizarOperadores(ficha.id, novosOperadores);
    }
  };

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
            {theme === 'light'
              ? <Moon size={18} />
              : <Sun size={18} />
            }
          </button>
          {user?.role === 'admin' && (
          <button className="logout-btn" onClick={onOpenAdmin} title="Administração">
            <Settings size={18} />
          </button>
          )}
          <button className="logout-btn" onClick={onLogout} title="Sair do Sistema">
            <LogOut size={18} />
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
          <LayoutList size={16} />
          Relatórios
        </button>
        <button
          className={`view-toggle-btn ${viewMode === 'gallery' ? 'active' : ''}`}
          onClick={() => setViewMode('gallery')}
        >
          <Images size={16} />
          Banco de Fotos
        </button>
        <button
          className={`view-toggle-btn ${viewMode === 'dashboard' ? 'active' : ''}`}
          onClick={() => setViewMode('dashboard')}
        >
          <BarChart3 size={16} />
          Métricas
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
              <div className="empty-icon">
                <ClipboardList size={42} strokeWidth={1.8} />
              </div>
              <p>Nenhuma ficha criada ainda. Toque no botão + para começar.</p>
            </div>
          ) : (
            <div className="home-list animate-scaleIn">
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
                      {showSearch
                        ? <X size={18} />
                        : <Search size={18} />
                      }
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
                    <option value="taf">TAF</option>
                    <option value="controle">Controle</option>
                    <option value="foto">Fotos</option>
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
                    <option value="all">Todos Status</option>
                    <option value="progress">🟡 Andamento</option>
                    <option value="done">🔵 Preenchida</option>
                    <option value="waiting">🟠 Aguardando</option>
                    <option value="approved">🟢 Aprovada</option>
                    <option value="rejected">🔴 Reprovada</option>
                    <option value="empty">⚪ Nova</option>
                  </select>
                </div>
              </div>
              {filteredFichas.length === 0 ? (
                <div className="text-center py-12 opacity-60 text-sm card-glow-none" style={{padding: '20px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)'}}>
                  Nenhuma ficha encontrada para estes filtros.
                </div>
              ) : (
                filteredFichas.map((ficha, i) => {
                  const status = getFichaStatus(ficha)
                  const pct = getProgressPct(ficha)
                  const operadores = ficha.operadores || [] // Garante o array de operadores ativos no card

                  return (
                    <div
                      key={ficha.id}
                      className={`ficha-card status-${status}`}
                      style={{
                        animationDelay: `${i * 0.05}s`,
                        zIndex: activeDropdownFichaId === ficha.id ? 999 : 1
                      }}
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

                          <div className="ficha-card-meta">
                            <span className="ficha-meta-user">
                              <User size={14} />
                              {ficha.criadoPor || ficha.userId || '-'}
                            </span>

                            <span className="ficha-meta-code">
                              <Tag size={14} />
                              {ficha.codigo || '-'}
                            </span>
                          </div>
                        </div>
                        <button
                          className="delete-btn"
                          onClick={(e) => handleDelete(e, ficha.id)}
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* ─── MODIFICAÇÃO: AREA DE OPERADORES ATIVOS NO CARD (Entre o topo e a barra de progresso) ─── */}
                      <div 
                        className="ficha-card-operators-section"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: '10px',
                          marginBottom: '6px',
                          paddingTop: '8px',
                          borderTop: '1px solid var(--border)',
                          position: 'relative'
                        }}
                        onClick={(e) => e.stopPropagation()} // Impede que o clique nesta área abra a ficha inteira
                      >
                        {/* Lista de Avatares Pilhados */}
                        <div style={{ display: 'flex', itemsCenter: 'center', flex: 1, overflow: 'hidden' }}>
                          {operadores.length === 0 ? (
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                              Nenhum operador atribuído
                            </span>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', marginLeft: '4px' }}>
                              {operadores.map((op, idx) => (
                              <div
                                key={op.id || idx}
                                title={op.nome}
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  backgroundColor: 'var(--blue-accent)',
                                  color: 'var(--blue-primary)',
                                  border: '2px solid var(--bg-card)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '10px',
                                  fontWeight: 'bold',
                                  marginLeft: idx === 0 ? 0 : -8,
                                  position: 'relative',
                                  zIndex: operadores.length - idx,
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                  flexShrink: 0
                                }}
                              >
                                  {(op.nome || '?')[0].toUpperCase()}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Botão de Adicionar (+) com Dropdown Absoluto */}
                        <div style={{ position: 'relative' }}>
                          <button
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              border: '1px dashed var(--text-secondary)',
                              background: 'transparent',
                              color: 'var(--text-secondary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              outline: 'none'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdownFichaId(activeDropdownFichaId === ficha.id ? null : ficha.id);
                            }}
                            title="Vincular Operadores"
                          >
                            <UserPlus size={13} />
                          </button>

                          {/* Menu Dropdown Suspenso por Card */}
                          {activeDropdownFichaId === ficha.id && (
                            <div 
                              className="animate-scaleIn"
                              style={{
                                position: 'absolute',
                                right: 0,
                                top: '30px',
                                width: '180px',
                                maxHeight: '160px',
                                backgroundColor: 'var(--bg-elevated)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-xs)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                zIndex: 99,
                                overflowY: 'auto',
                                padding: '4px 0'
                              }}
                            >
                              <div style={{ padding: '4px 10px', fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 'bold', borderBottom: '1px solid var(--border)', textTransform: 'uppercase' }}>
                                Escalar Equipe
                              </div>
                              {listaUsuarios.map(u => {
                                const ativo = operadores.some(op => op.id === u.id || op.username === u.username);
                                return (
                                  <button
                                    key={u.id}
                                    onClick={(e) => handleToggleOperadorFicha(e, ficha, u)}
                                    style={{
                                      width: '100%',
                                      padding: '6px 10px',
                                      fontSize: '12px',
                                      textAlign: 'left',
                                      background: ativo ? 'var(--blue-glow)' : 'transparent',
                                      color: ativo ? 'var(--blue-primary)' : 'var(--text-secondary)',
                                      border: 'none',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between'
                                    }}
                                  >
                                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1 }}>
                                      {u.nome || u.username}
                                    </span>
                                    {ativo && <span style={{ fontSize: '9px' }}>🟢</span>}
                                  </button>
                                );
                              })}
                              {listaUsuarios.length === 0 && (
                                <div style={{ padding: '6px 10px', fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                  Sem usuários carregados
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="ficha-card-bottom">
                        <div className="flex items-center gap-2">
                          {status === 'rejected' && (
                          <span className="badge badge-red">
                            <AlertCircle size={14} />
                            Reprovada
                          </span>
                          )}

                          {status === 'waiting' && (
                          <span className="badge badge-amber">
                            <Clock3 size={14} />
                            Aguardando análise
                          </span>
                          )}

                          {status === 'approved' && (
                          <span className="badge badge-green">
                            <CheckCircle2 size={14} />
                            Aprovada
                          </span>
                          )}

                          {status === 'done' && (
                            <span className="badge badge-blue">
                              <FileText size={14} />
                              Preenchida
                            </span>
                          )}

                          {status === 'progress' && (
                            <span className="badge badge-amber">
                              <Clock3 size={14} />
                              Em andamento
                            </span>
                          )}

                          {status === 'empty' && (
                            <span className="badge badge-muted">
                              <Circle size={12} />
                              Nova
                            </span>
                          )}
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
                  <div className="opt-icon">
                    {op.codigo === '50' ? (
                      <Zap color="currentColor" size={22} />
                    ) : op.codigo === '80' ? (
                      <Camera color="currentColor" size={22} />
                    ) : (
                      <ClipboardList size={22} />
                    )}
                  </div>
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
        {showNewMenu
          ? <X size={26} />
          : <Plus size={26} />
        }
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