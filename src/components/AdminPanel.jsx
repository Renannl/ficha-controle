import React, { useState, useEffect } from 'react'
import { ROLES, ROLE_PRESETS } from '../data/users'

export default function AdminPanel({ onBack }) {

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const [editingUser, setEditingUser] = useState(null)

  const [nome, setNome] = useState('')
  const [role, setRole] = useState('producao')
  const [permissoes, setPermissoes] = useState([])
  const [active, setActive] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {

    try {

      const token =
        localStorage.getItem('token')

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      const roleOrder = {
        admin: 1,
        corretor: 2,
        projetos: 3,
        producao: 4
      }

      const sortedUsers = [...data].sort((a, b) => {

        const roleA =
          roleOrder[a.role] || 999

        const roleB =
          roleOrder[b.role] || 999

        // primeiro ordena cargo
        if (roleA !== roleB) {
          return roleA - roleB
        }

        // depois ordena nome
        return (a.nome || '')
          .localeCompare(b.nome || '')
      })

      setUsers(sortedUsers)

    } catch (err) {

      console.error(err)

    } finally {

      setLoading(false)
    }
  }

  function editarUsuario(user) {

    setEditingUser(user)

    setNome(user.nome || '')

    setRole(user.role || 'producao')

    setPermissoes(user.permissoes || [])

    setActive(user.active)
  }

  function togglePermission(perm) {

    setPermissoes(prev =>
      prev.includes(perm)
        ? prev.filter(p => p !== perm)
        : [...prev, perm]
    )
  }

  function handleRoleChange(newRole) {

  setRole(newRole)

  const preset =
    ROLE_PRESETS[newRole] || []

  setPermissoes(preset)
  }

  async function salvarUsuario() {

    if (!editingUser) return

    try {

      const token =
        localStorage.getItem('token')

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users/${editingUser.id}`,
        {
          method: 'PUT',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            nome,
            role,
            permissoes,
            active
          })
        }
      )

      if (!response.ok) {
        throw new Error('Erro atualizar')
      }

      await loadUsers()

      alert('Usuário atualizado')

      setEditingUser(null)

      setNome('')
      setRole('producao')
      setPermissoes([])
      setActive(true)

    } catch (err) {

      console.error(err)

      alert('Erro atualizar usuário')
    }
  }

  return (
    <div className="admin-panel animate-fadeIn">
      <header className="admin-header">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="back-button-circular" onClick={onBack} title="Sair da Administração">
              🚪
            </button>
            <div className="admin-title-group">
              <h1 className="text-xl font-bold">Configurações do Sistema</h1>
              <p className="text-xs text-muted">Acessos e permissões</p>
            </div>
          </div>
          <div className="admin-status-badge">
            <span className="status-dot"></span>
            Interface Administrador
          </div>
        </div>
      </header>

      <div className="admin-content-grid container">
        {/* LADO ESQUERDO: FORMULÁRIO */}
        <div className="admin-col-form">
          <section className="admin-card card-glow">
            <div className="admin-card-header">
              <div className="card-icon">👤</div>
              <h3 className="text-md font-bold">
                {editingUser ? 'Editar Usuário' : 'Selecione um usuário'}
              </h3>
            </div>
            
            <div className="admin-form-body">
              <div className="form-row">
                <label className="field-label">Nome de Exibição</label>
                <input 
                  type="text" 
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Ex: João Silva"
                  className="admin-input"
                />
              </div>
              <div className="form-row">
                <label className="field-label">Cargo / Função</label>
                <select 
                  value={role}
                  onChange={e => handleRoleChange(e.target.value)}
                  className="admin-select"
                >
                  {Object.entries(ROLES).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <label className="field-label">Status do Usuário</label>
                <label className="switch-toggle">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={e =>
                      setActive(e.target.checked)}
                  />
                <span className="switch-slider"></span>
                  <span className="switch-label">
                    {active ? 'Ativo' : 'Desativado'}
                  </span>
                </label>
              </div>

              <div className="permissions-box">
                <label className="field-label mb-3 block">Módulos de Execução</label>
                <div className="permissions-grid mb-4">
                  <label className={`perm-item ${permissoes.includes('taf') ? 'active' : ''}`}>
                    <input type="checkbox" checked={permissoes.includes('taf')} onChange={() => togglePermission('taf')} />
                    <span className="perm-icon">⚡</span>
                    <span className="perm-text">TAF</span>
                  </label>
                  <label className={`perm-item ${permissoes.includes('controle') ? 'active' : ''}`}>
                    <input type="checkbox" checked={permissoes.includes('controle')} onChange={() => togglePermission('controle')} />
                    <span className="perm-icon">📋</span>
                    <span className="perm-text">Controle</span>
                  </label>
                  <label className={`perm-item ${permissoes.includes('fotos') ? 'active' : ''}`}>
                    <input type="checkbox" checked={permissoes.includes('fotos')} onChange={() => togglePermission('fotos')} />
                    <span className="perm-icon">📸</span>
                    <span className="perm-text">Fotos</span>
                  </label>
                </div>

                <label className="field-label mb-3 block">Permissões de Visibilidade e Gestão</label>
                <div className="permissions-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
                  <label className={`perm-item ${permissoes.includes('ver_tudo') ? 'active' : ''}`}>
                    <input type="checkbox" checked={permissoes.includes('ver_tudo')} onChange={() => togglePermission('ver_tudo')} />
                    <span className="perm-icon">👁️</span>
                    <span className="perm-text">Ver todas as fichas</span>
                  </label>
                  <label className={`perm-item ${permissoes.includes('ver_enviadas') ? 'active' : ''}`}>
                    <input type="checkbox" checked={permissoes.includes('ver_enviadas')} onChange={() => togglePermission('ver_enviadas')} />
                    <span className="perm-icon">📩</span>
                    <span className="perm-text">Ver concluídas</span>
                  </label>
                  <label className={`perm-item ${permissoes.includes('ver_aprovacao') ? 'active' : ''}`}>
                    <input type="checkbox" checked={permissoes.includes('ver_aprovacao')} onChange={() => togglePermission('ver_aprovacao')} />
                    <span className="perm-icon">⏳</span>
                    <span className="perm-text">Ver aprovação</span>
                  </label>
                  <label className={`perm-item ${permissoes.includes('editar_ficha') ? 'active' : ''}`}>
                    <input type="checkbox" checked={permissoes.includes('editar_ficha')} onChange={() => togglePermission('editar_ficha')} />
                    <span className="perm-icon">✏️</span>
                    <span className="perm-text">Editar ficha</span>
                  </label>
                  <label className={`perm-item ${permissoes.includes('aprovar') ? 'active' : ''}`}>
                    <input type="checkbox" checked={permissoes.includes('aprovar')} onChange={() => togglePermission('aprovar')} />
                    <span className="perm-icon">✅</span>
                    <span className="perm-text">Aprovar Fichas</span>
                  </label>
                  <label className={`perm-item ${permissoes.includes('rejeitar') ? 'active' : ''}`}>
                    <input type="checkbox" checked={permissoes.includes('rejeitar')} onChange={() => togglePermission('rejeitar')} />
                    <span className="perm-icon">❌</span>
                    <span className="perm-text">Rejeitar Fichas</span>
                  </label>
                </div>
              </div>

              <div className="form-actions mt-6">
                <button
                  className="btn-admin-submit"
                  onClick={salvarUsuario}
                >
                  Salvar Alterações
                </button>
                {editingUser && (
                  <button
                    className="btn-admin-cancel"
                    onClick={() => {
                    setEditingUser(null)
                    setNome('')
                    setRole('producao')
                    setPermissoes([])
                    setActive(true)
                  }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* NOVO BOX: SINCRONIZAÇÃO DE DOMÍNIO (Movido para cá) */}
          <section className="admin-card domain-sync-card card-glow-amber mt-6">
            <div className="admin-card-header" style={{ borderBottomColor: 'rgba(255, 193, 7, 0.2)' }}>
              <div className="card-icon">🌐</div>
              <div>
                <h3 className="text-md font-bold">Sincronização de Domínio</h3>
                <span className="badge-setup">EM BREVE</span>
              </div>
            </div>
            <div className="admin-form-body">
              <p className="text-xs text-muted mb-4">
                Prepare a integração com o Active Directory/SharePoint. Os usuários serão buscados automaticamente no domínio da empresa.
              </p>
              <div className="sync-placeholder">
                <div className="sync-icon-group">
                  <span className="sync-icon">🏢</span>
                  <span className="sync-arrow">↔</span>
                  <span className="sync-icon">☁️</span>
                </div>
                <button className="btn-sync-disabled" disabled>
                  Configurar Integração
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* LADO DIREITO: LISTA */}
        <div className="admin-col-list">
          <section className="admin-card">
            <div className="admin-card-header">
              <div className="card-icon">👥</div>
              <h3 className="text-md font-bold">Equipe Cadastrada</h3>
            </div>
            
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Colaborador</th>
                    <th>Usuário</th>
                    <th>Cargo</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>

                      {/* COLABORADOR */}
                      <td>
                        {
                          user.nome
                          ||
                          user.username
                            ?.split('.')
                            .map(
                              parte =>
                                parte.charAt(0).toUpperCase() +
                                parte.slice(1).toLowerCase()
                            )
                            .join(' ')
                        }
                      </td>

                      {/* USUÁRIO */}
                      <td className="user-column">
                        {user.username}
                      </td>

                      {/* CARGO */}
                      <td>
                        <span className={`role-badge role-${user.role}`}>
                          {user.role}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td>
                        <span
                          className={`status-badge ${
                            user.active
                              ? 'status-active'
                              : 'status-disabled'
                          }`}
                        >
                          {user.active ? 'ATIVO' : 'DESATIVADO'}
                        </span>
                      </td>

                      {/* AÇÕES */}
                      <td>
                        {user.username !== 'master' && (
                          <button
                            className="btn-edit-user"
                            onClick={() => editarUsuario(user)}
                          >
                            ⚙️
                          </button>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* NOVO BOX: SOLICITAÇÕES DE ACESSO */}
          <section className="admin-card mt-6 card-glow-blue">
            <div className="admin-card-header" style={{ borderBottomColor: 'rgba(21, 101, 192, 0.1)' }}>
              <div className="card-icon">🔔</div>
              <div>
                <h3 className="text-md font-bold">Solicitações de Acesso</h3>
                <p className="text-[10px] text-muted">Pendentes de aprovação do domínio</p>
              </div>
            </div>
            
            <div className="admin-form-body">
              <div className="request-list">
                {/* Exemplo de Solicitação */}
                <div className="request-item">
                  <div className="request-info">
                    <div className="request-user">Funcionário ID #32</div>
                    <div className="request-meta">Tentativa de login via Domínio • Agora</div>
                  </div>
                  <div className="request-actions">
                    <button className="btn-approve-mini" title="Liberar Acesso">Aprovar</button>
                    <button className="btn-deny-mini" title="Negar Acesso">Negar</button>
                  </div>
                </div>

                <div className="request-empty-state" style={{ display: 'none' }}>
                  <span className="icon">✅</span>
                  <p>Nenhuma solicitação pendente</p>
                </div>
              </div>
            </div>
            <div className="admin-card-footer" style={{ padding: '10px 20px', background: 'var(--bg-elevated)', borderTop: '1px solid var(--border)' }}>
               <p className="text-[9px] text-muted italic text-center">
                 Novos usuários do domínio aparecerão aqui para liberação de perfil.
               </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
