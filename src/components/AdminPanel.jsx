import React, { useState, useEffect } from 'react';
import { ROLES, INITIAL_USERS } from '../data/users';

export default function AdminPanel({ onBack }) {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('ficha-controle-users');
    return saved ? JSON.parse(saved) : [];
  });

  const [editingUsername, setEditingUsername] = useState(null);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  const [newUserRole, setNewUserRole] = useState('producao');
  const [newPermissions, setNewPermissions] = useState(['taf', 'controle', 'fotos']);

  const saveUsers = (updated) => {
    setUsers(updated);
    localStorage.setItem('ficha-controle-users', JSON.stringify(updated));
  };

  const resetForm = () => {
    setNewUserName('');
    setNewUserPass('');
    setNewDisplayName('');
    setNewUserRole('producao');
    setNewPermissions(['taf', 'controle', 'fotos']);
    setEditingUsername(null);
  };

  const handleEdit = (u) => {
    setEditingUsername(u.username);
    setNewUserName(u.username);
    setNewUserPass(u.password);
    setNewDisplayName(u.displayName);
    setNewUserRole(u.role);
    setNewPermissions(u.permissions || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const togglePermission = (perm) => {
    setNewPermissions(prev => 
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleSubmit = () => {
    if (!newUserName || !newUserPass) return;

    if (editingUsername) {
      // Editar (pode ser um usuário de INITIAL_USERS ou um já em users)
      const userToUpdate = [...INITIAL_USERS, ...users].find(u => u.username === editingUsername);
      const updatedInfo = {
        ...userToUpdate,
        username: newUserName,
        password: newUserPass,
        displayName: newDisplayName || newUserName,
        role: newUserRole,
        permissions: newPermissions
      };
      
      const newUsersList = users.some(u => u.username === editingUsername)
        ? users.map(u => u.username === editingUsername ? updatedInfo : u)
        : [...users, updatedInfo];
        
      saveUsers(newUsersList);
      resetForm();
    } else {
      // Adicionar
      const isTaken = [...INITIAL_USERS, ...users].some(u => u.username.toLowerCase() === newUserName.toLowerCase());
      if (isTaken) {
        alert('Este nome de usuário já existe!');
        return;
      }

      const newUser = {
        username: newUserName,
        password: newUserPass,
        displayName: newDisplayName || (newUserName.charAt(0).toUpperCase() + newUserName.slice(1)),
        role: newUserRole,
        permissions: newPermissions
      };

      saveUsers([...users, newUser]);
      resetForm();
    }
  };

  const handleDeleteUser = (username) => {
    if (confirm(`Excluir usuário ${username}?`)) {
      saveUsers(users.filter(u => u.username !== username));
    }
  };

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
              <h3 className="text-md font-bold">{editingUsername ? 'Editar Perfil' : 'Novo Colaborador'}</h3>
            </div>
            
            <div className="admin-form-body">
              <div className="form-row">
                <label className="field-label">Nome de Exibição</label>
                <input 
                  type="text" 
                  value={newDisplayName} 
                  onChange={e => setNewDisplayName(e.target.value)}
                  placeholder="Ex: João Silva"
                  className="admin-input"
                />
              </div>

              <div className="form-group-row">
                <div className="form-row flex-1">
                  <label className="field-label">Login</label>
                  <input 
                    type="text" 
                    value={newUserName}
                    onChange={e => setNewUserName(e.target.value)}
                    placeholder="usuario.indus"
                    className="admin-input"
                  />
                </div>
                <div className="form-row flex-1">
                  <label className="field-label">Senha</label>
                  <input 
                    type="text" 
                    value={newUserPass} 
                    onChange={e => setNewUserPass(e.target.value)}
                    placeholder="••••"
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <label className="field-label">Cargo / Função</label>
                <select 
                  value={newUserRole} 
                  onChange={e => setNewUserRole(e.target.value)}
                  className="admin-select"
                >
                  {Object.entries(ROLES).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="permissions-box">
                <label className="field-label mb-3 block">Módulos de Execução</label>
                <div className="permissions-grid mb-4">
                  <label className={`perm-item ${newPermissions.includes('taf') ? 'active' : ''}`}>
                    <input type="checkbox" checked={newPermissions.includes('taf')} onChange={() => togglePermission('taf')} />
                    <span className="perm-icon">⚡</span>
                    <span className="perm-text">TAF</span>
                  </label>
                  <label className={`perm-item ${newPermissions.includes('controle') ? 'active' : ''}`}>
                    <input type="checkbox" checked={newPermissions.includes('controle')} onChange={() => togglePermission('controle')} />
                    <span className="perm-icon">📋</span>
                    <span className="perm-text">Controle</span>
                  </label>
                  <label className={`perm-item ${newPermissions.includes('fotos') ? 'active' : ''}`}>
                    <input type="checkbox" checked={newPermissions.includes('fotos')} onChange={() => togglePermission('fotos')} />
                    <span className="perm-icon">📸</span>
                    <span className="perm-text">Fotos</span>
                  </label>
                </div>

                <label className="field-label mb-3 block">Permissões de Visibilidade e Gestão</label>
                <div className="permissions-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
                  <label className={`perm-item ${newPermissions.includes('ver_tudo') ? 'active' : ''}`}>
                    <input type="checkbox" checked={newPermissions.includes('ver_tudo')} onChange={() => togglePermission('ver_tudo')} />
                    <span className="perm-icon">👁️</span>
                    <span className="perm-text">Ver todas as fichas</span>
                  </label>
                  <label className={`perm-item ${newPermissions.includes('ver_enviadas') ? 'active' : ''}`}>
                    <input type="checkbox" checked={newPermissions.includes('ver_enviadas')} onChange={() => togglePermission('ver_enviadas')} />
                    <span className="perm-icon">📩</span>
                    <span className="perm-text">Ver só enviadas</span>
                  </label>
                  <label className={`perm-item ${newPermissions.includes('ver_aprovacao') ? 'active' : ''}`}>
                    <input type="checkbox" checked={newPermissions.includes('ver_aprovacao')} onChange={() => togglePermission('ver_aprovacao')} />
                    <span className="perm-icon">⏳</span>
                    <span className="perm-text">Ver de aprovação</span>
                  </label>
                  <label className={`perm-item ${newPermissions.includes('aprovar') ? 'active' : ''}`}>
                    <input type="checkbox" checked={newPermissions.includes('aprovar')} onChange={() => togglePermission('aprovar')} />
                    <span className="perm-icon">✅</span>
                    <span className="perm-text">Aprovar Fichas</span>
                  </label>
                  <label className={`perm-item ${newPermissions.includes('rejeitar') ? 'active' : ''}`}>
                    <input type="checkbox" checked={newPermissions.includes('rejeitar')} onChange={() => togglePermission('rejeitar')} />
                    <span className="perm-icon">❌</span>
                    <span className="perm-text">Rejeitar Fichas</span>
                  </label>
                </div>
              </div>

              <div className="form-actions mt-6">
                <button className="btn-admin-submit" onClick={handleSubmit}>
                  {editingUsername ? 'Salvar Alterações' : 'Criar Conta'}
                </button>
                {editingUsername && (
                  <button className="btn-admin-cancel" onClick={resetForm}>Cancelar</button>
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
                    <th>Acesso</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {[...INITIAL_USERS.filter(iu => !users.some(u => u.username === iu.username)), ...users].map(u => {
                    const isInitial = INITIAL_USERS.some(iu => iu.username === u.username);
                    const isProtected = u.username === 'zuerlan';

                    return (
                      <tr key={u.username}>
                        <td>
                          <div className="user-info-cell">
                            <div className="user-avatar">
                              {u.displayName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="user-name-cell">{u.displayName}</div>
                              <div className="user-login-cell">@{u.username} {isInitial && <span className="sys-label">SISTEMA</span>}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`role-badge ${u.role}`}>
                            {ROLES[u.role] ? ROLES[u.role].split(' ')[0] : u.role}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-2">
                             <button className="action-btn-edit" onClick={() => handleEdit(u)} title="Editar">✏️</button>
                             {!isProtected && (
                                <button className="action-btn-delete" onClick={() => handleDeleteUser(u.username)} title="Excluir">🗑</button>
                             )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
