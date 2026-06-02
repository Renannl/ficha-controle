import useLoginForm from "../hooks/useLoginForm";

export default function LoginScreen({ onLogin }) {
  const { usuario, senha, erro, loading, setUsuario, setSenha, handleSubmit } =
    useLoginForm(onLogin);

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-brand">
          <div className="login-logo">
            <img
              src="/ip.png"
              alt="IndusPower Logo"
              className="login-logo-img"
            />
          </div>

          <p className="login-subtitle">Centro de Controle de Fichas</p>
        </div>

        <form className="login-card" onSubmit={handleSubmit}>
          <div className="login-card-header">
            <h2>Acesso ao Sistema</h2>
            <p>Entre com suas credenciais corporativas</p>
          </div>

          <div className="login-fields">
            <div className="login-field">
              <label htmlFor="login-user">Usuário</label>

              <input
                id="login-user"
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="login-field">
              <label htmlFor="login-pass">Senha</label>

              <input
                id="login-pass"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {erro && <div className="login-error">{erro}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
