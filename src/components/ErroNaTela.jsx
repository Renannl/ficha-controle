import { Component } from "react";

export default class ErroNaTela extends Component {
  constructor(props) {
    super(props);
    this.state = { erro: null, pilha: "" };
  }

  static getDerivedStateFromError(erro) {
    return { erro };
  }

  componentDidCatch(erro, info) {
    console.error("[ErroNaTela]", erro, info?.componentStack);
    this.setState({ pilha: info?.componentStack || "" });
  }

  render() {
    const { erro, pilha } = this.state;
    if (!erro) return this.props.children;

    const linhas = (texto, n) =>
      String(texto || "")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, n)
        .join("\n");

    const detalhe = [
      `${erro?.name || "Erro"}: ${erro?.message || String(erro)}`,
      linhas(erro?.stack, 5),
      linhas(pilha, 6),
      `Tela: ${window.location.pathname}`,
      navigator.userAgent,
    ]
      .filter(Boolean)
      .join("\n\n");

    const sair = (destino) => {
      this.setState({ erro: null, pilha: "" });
      if (destino === "voltar") window.history.back();
      else window.location.assign("/dashboard");
    };

    return (
      <div
        role="alert"
        style={{
          minHeight: "100vh",
          padding: "24px 16px",
          boxSizing: "border-box",
          background: "var(--bg-base, #f3f4f6)",
          color: "var(--text-primary, #111827)",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>
            Algo deu errado nesta tela
          </h2>
          <p style={{ margin: "0 0 16px", fontSize: 15, lineHeight: 1.45 }}>
            Nada foi perdido do que já estava salvo. Tire um print desta
            mensagem e envie para o suporte.
          </p>
          <pre
            style={{
              margin: "0 0 16px",
              padding: 12,
              maxHeight: "45vh",
              overflow: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontSize: 12,
              lineHeight: 1.4,
              borderRadius: 10,
              background: "var(--bg-card, #fff)",
              border: "1px solid var(--border, #e5e7eb)",
              userSelect: "text",
              WebkitUserSelect: "text",
            }}
          >
            {detalhe}
          </pre>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={() => sair("voltar")}
              style={{
                flex: "1 1 140px",
                minHeight: 48,
                border: "1px solid var(--border, #d1d5db)",
                borderRadius: 12,
                background: "transparent",
                color: "inherit",
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              Voltar
            </button>
            <button
              onClick={() => sair("inicio")}
              style={{
                flex: "1 1 140px",
                minHeight: 48,
                border: 0,
                borderRadius: 12,
                background: "#1a4b50",
                color: "#fff",
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              Ir para o início
            </button>
          </div>
        </div>
      </div>
    );
  }
}
