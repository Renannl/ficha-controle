import { useCallback, useEffect, useState } from "react";
import useLoginForm from "../hooks/useLoginForm";
import Despedida, { lerDespedida } from "./Despedida";
import { isApp } from "../native/nativeApp";
import { listarPerfis, removerPerfil } from "../native/perfis";
import PerfisSalvos, { Avatar, setorDoPerfil } from "../native/PerfisSalvos";

export default function LoginScreen({ onLogin }) {
  const { usuario, senha, erro, loading, setUsuario, setSenha, handleSubmit } =
    useLoginForm(onLogin);

  const [perfis, setPerfis] = useState([]);
  const [perfilEscolhido, setPerfilEscolhido] = useState(null);
  const [outraConta, setOutraConta] = useState(false);

  const [despedida, setDespedida] = useState(lerDespedida);
  const fimDespedida = useCallback(() => setDespedida(null), []);
  useEffect(() => {
    try {
      sessionStorage.removeItem("despedida");
    } catch {
    }
  }, []);

  useEffect(() => {
    if (!isApp) return;
    listarPerfis()
      .then(setPerfis)
      .catch(() => setPerfis([]));
  }, []);

  const mostrarPerfis =
    isApp && perfis.length > 0 && !outraConta && !perfilEscolhido;

  function escolherPerfil(perfil) {
    setPerfilEscolhido(perfil);
    setUsuario(perfil.username);
    setSenha("");
  }

  function voltarParaPerfis() {
    setPerfilEscolhido(null);
    setOutraConta(false);
    setUsuario("");
    setSenha("");
  }

  function usarOutraConta() {
    setOutraConta(true);
    setUsuario("");
    setSenha("");
  }

  async function removerDoAparelho(perfil) {
    if (!window.confirm(`Remover ${perfil.nome} deste aparelho?`)) return;
    setPerfis(await removerPerfil(perfil.username));
  }

  return (
    <>
      {despedida && <Despedida dados={despedida} onFim={fimDespedida} />}
    <div className="login-page">
      <div className="login-container">
        <div className="login-brand">
          <div className="login-logo">
            <img
              src="/brand/gestor-de-fichas-vertical.svg"
              alt="Gestor de Fichas – IndusPower"
              className="login-logo-img marca-clara"
            />
            <img
              src="/brand/gestor-de-fichas-vertical-negativo.svg"
              alt=""
              aria-hidden="true"
              className="login-logo-img marca-escura"
            />
          </div>

          <p className="login-subtitle">Centro de Controle de Fichas</p>
        </div>

        {mostrarPerfis ? (
          <PerfisSalvos
            perfis={perfis}
            onEscolher={escolherPerfil}
            onRemover={removerDoAparelho}
            onOutraConta={usarOutraConta}
          />
        ) : (
          <form className="login-card" onSubmit={handleSubmit}>
            {perfilEscolhido ? (
              <div className="perfil-escolhido">
                <span className="perfil-anel">
                  <Avatar perfil={perfilEscolhido} tamanho={84} />
                </span>
                <h2>{perfilEscolhido.nome}</h2>
                <p>{setorDoPerfil(perfilEscolhido.role)}</p>
              </div>
            ) : (
              <div className="login-card-header">
                <h2>Acesso ao Sistema</h2>
                <p>Entre com suas credenciais corporativas</p>
              </div>
            )}

            <div className="login-fields">
              {!perfilEscolhido && (
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
              )}

              <div className="login-field">
                <label htmlFor="login-pass">
                  {perfilEscolhido ? "Senha do domínio" : "Senha"}
                </label>

                <input
                  id="login-pass"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  disabled={loading}
                  autoFocus={!!perfilEscolhido}
                />
              </div>
            </div>

            {erro && <div className="login-error">{erro}</div>}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>

            {isApp && (perfilEscolhido || (outraConta && perfis.length > 0)) && (
              <button
                type="button"
                className="perfil-trocar"
                onClick={voltarParaPerfis}
                disabled={loading}
              >
                {perfilEscolhido
                  ? "Não é você? Escolher outra conta"
                  : "Voltar para as contas salvas"}
              </button>
            )}
          </form>
        )}
      </div>
    </div>
    </>
  );
}
