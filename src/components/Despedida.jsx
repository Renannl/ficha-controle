import { useEffect, useState } from "react";

export const DURACAO_TELA_MS = 2000;
const FADE_MS = 400;
const TOQUE_LIBERADO_MS = 800;

export function lerDespedida() {
  try {
    const valor = sessionStorage.getItem("despedida");
    return valor ? JSON.parse(valor) : null;
  } catch {
    return null;
  }
}

export default function Despedida({ dados, onFim, duracao = DURACAO_TELA_MS }) {
  const [saindo, setSaindo] = useState(false);
  const [podePular, setPodePular] = useState(false);

  useEffect(() => {
    const fade = setTimeout(() => setSaindo(true), duracao - FADE_MS);
    const fim = setTimeout(onFim, duracao);
    const toque = setTimeout(() => setPodePular(true), TOQUE_LIBERADO_MS);
    return () => {
      clearTimeout(fade);
      clearTimeout(fim);
      clearTimeout(toque);
    };
  }, [onFim, duracao]);

  const expirou = dados?.motivo === "expirou";
  const primeiroNome = String(dados?.nome || "").trim().split(/\s+/)[0];

  const titulo = expirou
    ? "Sua sessão terminou"
    : primeiroNome
      ? `Até logo, ${primeiroNome}!`
      : "Até logo!";
  const texto = expirou
    ? "Por segurança, saímos da sua conta. Entre novamente para continuar."
    : "Obrigado por registrar a produção no Gestor de Fichas. Volte sempre!";

  return (
    <div
      className={`welcome-screen despedida${saindo ? " despedida--saindo" : ""}`}
      role="status"
      aria-live="polite"
      onClick={() => podePular && onFim()}
    >
      <img
        src="/brand/gestor-de-fichas-vertical.svg"
        alt="Gestor de Fichas"
        className="welcome-logo marca-clara"
      />
      <img
        src="/brand/gestor-de-fichas-vertical-negativo.svg"
        alt=""
        aria-hidden="true"
        className="welcome-logo marca-escura"
      />
      <h1 className="welcome-text">{titulo}</h1>
      <p className="despedida-texto">{texto}</p>
      <p className="despedida-marca">IndusPower · Powering Solutions</p>
      <span
        className="despedida-progresso"
        aria-hidden="true"
        style={{ animationDuration: `${duracao}ms` }}
      />
    </div>
  );
}