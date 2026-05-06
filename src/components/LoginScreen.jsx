import { useState } from 'react'
import { INITIAL_USERS } from '../data/users'

export default function LoginScreen({ onLogin }) {
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    if (!usuario.trim() || !senha.trim()) {
      setErro('Preencha todos os campos.')
      return
    }

    setLoading(true)
    const rawSaved = localStorage.getItem('ficha-controle-users') || '[]';
    let savedUsers = [];
    try { savedUsers = JSON.parse(rawSaved); } catch (e) { savedUsers = []; }

    // Mesclamos e limpamos nulos
    const allUsers = [...savedUsers, ...INITIAL_USERS].filter(u => u && u.username);

    const inputUser = String(usuario || '').trim().toLowerCase();
    const inputPass = String(senha || '').trim();

    const foundUser = allUsers.find(u => {
      const uName = String(u.username || '').toLowerCase();
      const uPass = String(u.password || '');

      // Se estiver tentando logar como zuerlan, aceita 1 ou 1234
      if (inputUser === 'zuerlan' && uName === 'zuerlan') {
        return inputPass === '1' || inputPass === '1234';
      }

      // Para os outros usuários, o match tem que ser exato
      return uName === inputUser && uPass === inputPass;
    });

    if (foundUser) {
      const sessionUser = { ...foundUser, loginTime: new Date().toISOString() };
      if (!sessionUser.username) sessionUser.username = inputUser;
      if (!sessionUser.role) sessionUser.role = 'producao';

      delete sessionUser.password;
      setLoading(false);
      onLogin(sessionUser);
    } else {
      setLoading(false);
      setErro(`Acesso negado. Verifique usuário e senha. (Tentativa: ${inputUser})`);
    }
  }

  return (
    <div className="login-page">
      {/* Background decoration */}
      <div className="login-bg-decoration">
        <div className="login-bg-circle login-bg-circle-1" />
        <div className="login-bg-circle login-bg-circle-2" />
        <div className="login-bg-circle login-bg-circle-3" />
      </div>

      <div className="login-container">
        {/* Logo / Brand */}
        <div className="login-brand">
          <div className="login-logo">
            <img src="/ip.png" alt="IndusPower Logo" className="login-logo-img" />
          </div>
          <p className="login-subtitle">Centro de Controle de Fichas</p>
        </div>

        {/* Form Card */}
        <form className="login-card" onSubmit={handleSubmit}>
          <div className="login-card-header">
            <h2>Acesso ao Sistema</h2>
            <p>Entre com suas credenciais corporativas</p>
          </div>

          <div className="login-fields">
            <div className="login-field">
              <label htmlFor="login-user">
                <span className="login-field-icon">👤</span>
                Usuário
              </label>
              <input
                id="login-user"
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="exemplo@induspower.ind.br"
                autoComplete="username"
                autoFocus
                disabled={loading}
              />
            </div>

            <div className="login-field">
              <label htmlFor="login-pass">
                <span className="login-field-icon">🔒</span>
                Senha
              </label>
              <input
                id="login-pass"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
              />
            </div>
          </div>

          {erro && (
            <div className="login-error">
              <span>⚠</span> {erro}
            </div>
          )}

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="login-spinner" />
            ) : (
              'Entrar'
            )}
          </button>

          <div className="login-footer">
            <span className="login-footer-lock">🔐</span>
            <span>Conexão segura · Rede interna</span>
          </div>
        </form>

        {/* Version & Credits */}
        <div className="login-version">
          v1.5
          <div className="login-developer">Produzido por Zuerlan Araújo</div>
        </div>
      </div>
    </div>
  )
}
