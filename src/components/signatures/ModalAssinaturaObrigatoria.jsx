import { useEffect, useRef, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://192.168.101.60:3001";

function getRoleFromToken() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role;
  } catch {
    return null;
  }
}

function getUsernameFromToken() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.username;
  } catch {
    return null;
  }
}

export default function ModalAssinaturaObrigatoria() {
  const canvasRef = useRef(null);
  const [evento, setEvento] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [assinando, setAssinando] = useState(false);
  const [erro, setErro] = useState("");
  const [documentoHtml, setDocumentoHtml] = useState("");
  const [concordou, setConcordou] = useState(false);
  const usuario = getUsernameFromToken();

  function recortarAssinatura(canvas) {
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;
    const pixels = ctx.getImageData(0, 0, width, height).data;

    let minX = width,
      minY = height,
      maxX = -1,
      maxY = -1;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const red = pixels[(y * width + x) * 4];
        // Só considera pixel "escuro" (a assinatura desenhada)
        if (red < 200) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX < 0) return null; // nada desenhado

    // Margem de respiro ao redor da assinatura
    const margem = 10;
    minX = Math.max(0, minX - margem);
    minY = Math.max(0, minY - margem);
    maxX = Math.min(width, maxX + margem);
    maxY = Math.min(height, maxY + margem);

    const largura = maxX - minX;
    const altura = maxY - minY;

    const recortado = document.createElement("canvas");
    recortado.width = largura;
    recortado.height = altura;
    recortado
      .getContext("2d")
      .drawImage(canvas, minX, minY, largura, altura, 0, 0, largura, altura);

    return recortado;
  }

  // ─── Busca status da APR da semana ───
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API_URL}/assinaturas/atual`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.jaAssinou) setEvento(data.evento);
        setCarregando(false);
      })
      .catch(() => setCarregando(false));
  }, []);

  // ─── Busca o documento (HTML) quando o evento carrega ───
  useEffect(() => {
    if (!evento) return;
    const token = localStorage.getItem("token");

    fetch(`${API_URL}/assinaturas/documento`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setDocumentoHtml(data.html || ""))
      .catch(() => setDocumentoHtml(""));
  }, [evento]);

  // ─── Canvas de assinatura ───
  useEffect(() => {
    if (!evento) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = 600;
    canvas.height = 200;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    // 🔑 Usa ref em vez de variável local (não é resetado entre cliques)
    const estado = { ultimo: null, desenhando: false };

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height),
      };
    };

    const iniciar = (e) => {
      e.preventDefault();
      estado.desenhando = true;
      estado.ultimo = getPos(e);
    };

    const mover = (e) => {
      if (!estado.desenhando) return;
      e.preventDefault();
      const p = getPos(e);
      ctx.beginPath();
      ctx.moveTo(estado.ultimo.x, estado.ultimo.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      estado.ultimo = p;
    };

    const parar = () => {
      estado.desenhando = false;
    };

    canvas.addEventListener("mousedown", iniciar);
    canvas.addEventListener("mousemove", mover);
    canvas.addEventListener("mouseup", parar);
    canvas.addEventListener("mouseleave", parar);
    canvas.addEventListener("touchstart", iniciar, { passive: false });
    canvas.addEventListener("touchmove", mover, { passive: false });
    canvas.addEventListener("touchend", parar);

    return () => {
      canvas.removeEventListener("mousedown", iniciar);
      canvas.removeEventListener("mousemove", mover);
      canvas.removeEventListener("mouseup", parar);
      canvas.removeEventListener("mouseleave", parar);
      canvas.removeEventListener("touchstart", iniciar);
      canvas.removeEventListener("touchmove", mover);
      canvas.removeEventListener("touchend", parar);
    };
    // 🔑 Só re-executa quando o evento muda (não quando desenhando muda)
  }, [evento]);

  const limpar = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const confirmar = async () => {
    if (!concordou) {
      setErro("Você precisa ler e marcar que está ciente da APR.");
      return;
    }

    const canvas = canvasRef.current;

    // 🔑 Recorta até a área desenhada (centraliza a assinatura)
    const recortado = recortarAssinatura(canvas);
    if (!recortado) {
      setErro("Desenhe sua assinatura antes de confirmar.");
      return;
    }

    const dataUrl = recortado.toDataURL("image/png");

    setAssinando(true);
    setErro("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/assinaturas/${evento.id}/assinar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ assinaturaDataUrl: dataUrl }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao assinar");
      }

      window.location.reload();
    } catch (err) {
      setErro(err.message);
      setAssinando(false);
    }
  };

  if (carregando) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.85)",
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div className="login-spinner" />
        <p>Verificando assinatura da APR...</p>
      </div>
    );
  }

  if (!evento) return null; // já assinou → libera

  // ─── MODAL FULLSCREEN BLOQUEANTE ───
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          maxWidth: "820px",
          width: "100%",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
        }}
      >
        {/* Cabeçalho do modal */}
        <div
          style={{
            background: "#1976d2",
            color: "#fff",
            padding: "18px 24px",
            textAlign: "center",
            flexShrink: 0,
          }}
        >
          <h2 style={{ margin: 0, fontSize: "20px" }}>
            📋 APR Semanal Obrigatória
          </h2>
          <p style={{ margin: "6px 0 0", fontSize: "13px", opacity: 0.95 }}>
            {evento.titulo}
          </p>
        </div>

        {/* Corpo rolável */}
        <div style={{ padding: "24px", overflowY: "auto" }}>
          {/* 📄 DOCUMENTO DA APR */}
          <h3
            style={{
              margin: "0 0 10px",
              fontSize: "15px",
              color: "#1976d2",
            }}
          >
            Leia o documento antes de assinar:
          </h3>

          <div
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              overflow: "hidden",
              background: "#fff",
            }}
          >
            {documentoHtml ? (
              <iframe
                srcDoc={documentoHtml}
                title="Documento APR"
                style={{
                  width: "100%",
                  height: "380px",
                  border: "none",
                }}
              />
            ) : (
              <p
                style={{
                  padding: "20px",
                  color: "#999",
                  textAlign: "center",
                  fontSize: "13px",
                }}
              >
                Carregando documento...
              </p>
            )}
          </div>

          {/* ✅ Checkbox de ciência */}
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              marginTop: "16px",
              fontSize: "13px",
              color: "#333",
              cursor: "pointer",
            }}
          >
            {usuario === "renan.boni" && (
              <p
                style={{
                  color: "#1976d2",
                  fontSize: "13px",
                  fontWeight: "bold",
                  margin: "12px 0 0",
                }}
              >
                👑 Você é o <strong>Responsável pela atividade (Líder)</strong>.
                Sua assinatura será registrada no campo do responsável.
              </p>
            )}

            <input
              type="checkbox"
              checked={concordou}
              onChange={(e) => setConcordou(e.target.checked)}
              style={{ marginTop: "2px", cursor: "pointer" }}
            />
            <span>
              Declaro que <strong>li e estou ciente</strong> dos riscos, das
              medidas de controle e dos procedimentos descritos nesta APR
              Semanal.
            </span>
          </label>

          {/* ✍️ Canvas de assinatura */}
          <div
            style={{
              border: "2px dashed #1976d2",
              borderRadius: "8px",
              padding: "8px",
              background: "#fafafa",
              textAlign: "center",
              marginTop: "16px",
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                width: "100%",
                height: "200px",
                cursor: "crosshair",
                borderRadius: "4px",
                touchAction: "none",
              }}
            />
            <small
              style={{ color: "#666", display: "block", marginTop: "4px" }}
            >
              Assine com o mouse ou com o dedo (touch)
            </small>
          </div>

          {erro && (
            <p
              style={{ color: "#d32f2f", marginTop: "10px", fontSize: "13px" }}
            >
              ⚠️ {erro}
            </p>
          )}

          {/* Botões */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "16px",
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={limpar}
              disabled={assinando}
              style={{
                padding: "10px 20px",
                border: "1px solid #ccc",
                background: "#fff",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              🗑️ Limpar
            </button>
            <button
              onClick={confirmar}
              disabled={assinando || !concordou}
              style={{
                padding: "10px 24px",
                border: "none",
                background: assinando || !concordou ? "#999" : "#2e7d32",
                color: "#fff",
                borderRadius: "6px",
                cursor: assinando || !concordou ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              {assinando ? "Enviando..." : "✓ Confirmar Assinatura"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
