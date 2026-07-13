import { uploadPdf } from "./uploadService";
/**
 * Serviço de Integração com SharePoint e Exportação de PDF
 * Preparado para Power Automate / Microsoft Flow.
 */

const POWER_AUTOMATE_URL = import.meta.env.VITE_POWER_AUTOMATE_URL || "";

// A4 a 96 DPI ≈ 794px de largura. Usamos 780px para garantir que
// as margens do jsPDF não cortem nenhum conteúdo.
const A4_PRINT_WIDTH = 780;

/**
 * Gera um PDF a partir de um elemento HTML e o salva/envia.
 *
 * Estratégia:
 *  1. Clona o elemento de impressão (que fica escondido com display:none)
 *  2. Posiciona o clone FORA da viewport (left: -9999px) mas visível para
 *     o browser (sem display:none), garantindo renderização completa pelo
 *     html2canvas.
 *  3. Captura o clone, gera o PDF e remove o clone do DOM.
 */
export async function exportFicha(ficha, elementId = "print-view-root") {
  const originalElement = document.getElementById(elementId);
  if (!originalElement) {
    console.error(
      "[Export] Elemento para impressão não encontrado:",
      elementId,
    );
    return false;
  }

  if (!ficha?.dbId) {
    console.error("[Export] Ficha sem dbId, upload será ignorado:", ficha);
    alert(
      "Atenção: a ficha ainda não foi salva no servidor. O PDF será baixado, mas não enviado.",
    );
  }

  // ── Forçar Tema Claro Temporário ─────────────────────────────────────────
  // Garante que o PDF nunca sofra com letras invisíveis caso o usuário
  // esteja usando o modo escuro (textos brancos no fundo branco do PDF).
  const currentTheme =
    document.documentElement.getAttribute("data-theme") || "light";
  document.documentElement.setAttribute("data-theme", "light");

  // ── Overlay de carregamento ──────────────────────────────────────────────
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; 
    width: 100vw; height: 100vh;
    background: rgba(10,15,30,0.98);
    backdrop-filter: blur(5px);
    z-index: 2147483647; /* Máximo possível */
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    color: #fff; font-family: Inter, sans-serif;
  `;
  overlay.innerHTML = `
    <div style="width:50px;height:50px;border:4px solid rgba(255,255,255,0.1);
      border-top-color:#1565C0;border-radius:50%;animation:finalSpin 1s linear infinite;"></div>
    <p style="margin-top:20px;font-weight:700;font-size:16px;">Finalizando Ficha...</p>
    <p id="ov-status" style="margin-top:8px;font-size:12px;opacity:0.7;">Processando imagens...</p>
    <style>@keyframes finalSpin { 100% { transform:rotate(360deg); } }</style>
  `;
  document.body.appendChild(overlay);

  // ── Clone de Renderização Otimizado ──────────────────────────────────────
  const tempWrapper = document.createElement("div");
  tempWrapper.style.cssText = `position:absolute;top:0;left:0;width:${A4_PRINT_WIDTH}px;opacity:0.01;z-index:-1;pointer-events:none;`;
  const printClone = originalElement.cloneNode(true);
  printClone.classList.remove("print-only");

  printClone.querySelectorAll(".foto-frame").forEach((frame) => {
    const img = frame.querySelector("img");
    if (!img || !img.src || img.src === window.location.href) {
      frame.remove();
    }
  });

  // Otimização de imagens para evitar estouro de RAM no mobile
  printClone.querySelectorAll("img").forEach((img) => {
    img.style.maxWidth = "100%";
    img.style.height = "auto";
    img.style.objectFit = "contain";
  });
  printClone.style.cssText = `display:block !important;width:${A4_PRINT_WIDTH}px !important;background:#fff !important;padding:20px !important;`;

  tempWrapper.appendChild(printClone);
  document.body.appendChild(tempWrapper);

  await new Promise((r) => setTimeout(r, 1800)); // Tempo para o celular "desenhar" o clone aplicando o modo claro

  const safeFilename = `FICHA_${(ficha.codigo || "DOC").replace(/[^a-z0-9]/gi, "_")}.pdf`;

  // ── Safeguard: Timeout para não travar o app ──
  const timeoutId = setTimeout(() => {
    if (document.body.contains(overlay)) {
      document.body.removeChild(overlay);
      document.documentElement.setAttribute("data-theme", currentTheme);
      alert(
        "A geração demorou demais. O celular pode estar com pouca memória livre. Tente remover algumas fotos ou fechar outros aplicativos.",
      );
    }
  }, 25000); // 25 segundos de limite

  try {
    const statusText = document.getElementById("ov-status");
    if (statusText) statusText.innerText = "Gerando arquivo PDF...";

    console.log("[Export] Ficha a ser exportada:", ficha.id, ficha.operacao);

    // Configuração de Margens Inteligentes (Top, Right, Bottom, Left em mm)
    const isMobile = window.innerWidth <= 768;
    const marginPC = [0.5, 1.5, 12, 2]; // << EDITE AQUI AS MARGENS DO PC
    const marginMobile = [2, 5, 7, 0.5]; // << NÃO TOQUE AQUI (Margens otimizadas Mobile)

    const finalMargin = isMobile ? marginMobile : marginPC;

    const pdfBlob = await window
      .html2pdf()
      .set({
        margin: finalMargin,
        filename: safeFilename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: window.devicePixelRatio > 1 ? 2.5 : 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
          letterRendering: true,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
        pagebreak: {
          mode: ["css"],
          avoid: [".foto-frame", "tr"],
        },
      })
      .from(printClone)
      .output("blob");

    const uploadResult = ficha?.dbId ? await uploadPdf(pdfBlob, ficha) : null;

    if (!uploadResult) {
      console.warn(
        "[Export] PDF gerado localmente, mas falhou o envio ao servidor.",
      );
      // opcional: notificar o usuário de forma não bloqueante
    }

    if (statusText) statusText.innerText = "Iniciando download...";

    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = safeFilename;
    document.body.appendChild(link);

    setTimeout(() => {
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 500);
    }, 100);

    return true;
  } catch (err) {
    console.error("[Export] Erro:", err);
    alert("Erro ao gerar PDF: " + err.message);
    return false;
  } finally {
    clearTimeout(timeoutId);
    if (document.body.contains(tempWrapper))
      document.body.removeChild(tempWrapper);
    if (document.body.contains(overlay)) document.body.removeChild(overlay);

    // RESTAURA O TEMA DO USUÁRIO
    document.documentElement.setAttribute("data-theme", currentTheme);
  }
}

export async function exportBook(elementId = "book-print-root") {
  const originalElement = document.getElementById(elementId);

  if (!originalElement) {
    console.error("Elemento não encontrado:", elementId);
    return false;
  }

  const tempWrapper = document.createElement("div");

  tempWrapper.style.cssText = `
    position:absolute;
    top:0;
    left:0;
    width:${A4_PRINT_WIDTH}px;
    opacity:0.01;
    z-index:-1;
    pointer-events:none;
  `;

  const printClone = originalElement.cloneNode(true);

  printClone.style.cssText = `
    display:block !important;
    width:${A4_PRINT_WIDTH}px !important;
    background:#fff !important;
  `;

  tempWrapper.appendChild(printClone);
  document.body.appendChild(tempWrapper);

  await new Promise((r) => setTimeout(r, 1500));

  try {
    const pdfBlob = await window
      .html2pdf()
      .set({
        margin: [0.5, 1.5, 12, 2],
        filename: "BOOK.pdf",
        image: {
          type: "jpeg",
          quality: 0.98,
        },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
        pagebreak: {
          mode: ["css"],
        },
      })
      .from(printClone)
      .output("blob");

    const url = URL.createObjectURL(pdfBlob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "BOOK.pdf";

    document.body.appendChild(link);

    link.click();

    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
    }, 1000);

    return true;
  } finally {
    document.body.removeChild(tempWrapper);
  }
}

/**
 * Envia os dados e o PDF para um fluxo do Power Automate.
 * No SharePoint, o JSON vira uma linha na lista e o PDF um arquivo na pasta.
 */
async function sendToSharePoint(ficha, pdfBlob) {
  try {
    // Converte o PDF para Base64 para trafegar no JSON do Power Automate
    const base64Pdf = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.readAsDataURL(pdfBlob);
    });

    const payload = {
      ...ficha,
      pdfBase64: base64Pdf,
      pdfFileName: `FICHA_${ficha.codigo}_${ficha.nrInd}.pdf`,
      exportDate: new Date().toISOString(),
    };

    const response = await fetch(POWER_AUTOMATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log(
        "[Export] Sucesso ao enviar para SharePoint via Power Automate",
      );
    } else {
      console.error("[Export] Falha no Power Automate:", response.statusText);
    }
  } catch (err) {
    console.error("[Export] Erro na conexão com SharePoint/Flow:", err);
  }
}
