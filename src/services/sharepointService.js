import { uploadPdf, uploadBook } from "./uploadService";
/**
 * Serviço de Exportação de PDF (Ficha / Book)
 */

// A4 a 96 DPI ≈ 794px de largura. Usamos 780px como fallback,
// mas a largura REAL é calculada dinamicamente a partir do clone.
const A4_PRINT_WIDTH = 780;

function injectPrintStylesOverride(clonedDoc) {
  const style = clonedDoc.createElement("style");
  style.innerHTML = `
    .print-view-root, .book-mode,
    .print-view-root *, .book-mode * {
      box-sizing: border-box !important;
      max-width: none !important;
    }
    .print-view-root, .book-mode {
      width: 100% !important;
      display: block !important;
      overflow: hidden !important;
    }
    .print-view-root > *, .book-mode > * {
      width: 100% !important;
    }
    .print-view-root table, .book-mode table {
      width: 100% !important;
      table-layout: fixed !important;
      border-collapse: collapse !important;
    }
    .print-view-root td, .print-view-root th,
    .book-mode td, .book-mode th {
      word-break: break-word !important;
      overflow-wrap: break-word !important;
    }
    .print-info-table td, .print-checklist-table td, .print-checklist-table th {
      word-wrap: break-word;
      padding: 3px 6px !important;
      font-size: 10px !important;
      line-height: 1.2 !important;
    }
    .print-checklist-table thead {
      display: table-header-group;
    }
    .print-view-root, .book-mode,
    .print-view-root *, .book-mode * {
      flex-shrink: 1 !important;
    }
  `;
  clonedDoc.head.appendChild(style);
}

async function waitForImages(container) {
  const imgs = Array.from(container.querySelectorAll("img"));
  await Promise.all(
    imgs.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
        setTimeout(resolve, 5000);
      });
    }),
  );
}

/**
 * Gera um PDF a partir de um elemento HTML e o salva/envia.
 */
export async function exportBook(fichaIds, elementId = "book-print-root") {
  const originalElement = document.getElementById(elementId);

  if (!originalElement) {
    console.error("Elemento não encontrado:", elementId);
    return false;
  }

  if (!fichaIds || fichaIds.length === 0) {
    console.error("[exportBook] Nenhuma ficha vinculada informada");
    alert("Selecione ao menos uma ficha para vincular ao book.");
    return false;
  }

  const tempWrapper = document.createElement("div");
  tempWrapper.style.cssText = `
    position:absolute; top:0; left:0;
    width:${A4_PRINT_WIDTH}px;
    opacity:0.01; z-index:-1; pointer-events:none;
  `;

  const printClone = originalElement.cloneNode(true);
  printClone.style.cssText = `
    display:block !important;
    width:${A4_PRINT_WIDTH}px !important;
    background:#fff !important;
  `;

  tempWrapper.appendChild(printClone);
  document.body.appendChild(tempWrapper);

  await waitForImages(printClone);
  await new Promise((r) => setTimeout(r, 300));

  const realWidth = Math.max(A4_PRINT_WIDTH, Math.ceil(printClone.scrollWidth));

  try {
    const pdfBlob = await window
      .html2pdf()
      .set({
        margin: [8, 8, 8, 8],
        filename: "BOOK.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: Math.min(window.devicePixelRatio || 1, 2),
          useCORS: true,
          backgroundColor: "#ffffff",
          width: realWidth,
          height: printClone.scrollHeight,
          windowWidth: realWidth,
          windowHeight: printClone.scrollHeight,
          onclone: (clonedDoc) => injectPrintStylesOverride(clonedDoc),
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: {
          mode: ["css", "legacy"],
          avoid: [".foto-frame"],
        },
      })
      .from(printClone)
      .output("blob");

    const uploadResult = await uploadBook(pdfBlob, fichaIds);
    if (!uploadResult) {
      console.warn("[exportBook] Book gerado, mas falhou o envio ao servidor.");
    }

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
  } catch (err) {
    console.error("[exportBook] Erro:", err);
    alert("Erro ao gerar Book: " + err.message);
    return false;
  } finally {
    document.body.removeChild(tempWrapper);
  }
}

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

  const currentTheme =
    document.documentElement.getAttribute("data-theme") || "light";
  document.documentElement.setAttribute("data-theme", "light");

  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; 
    width: 100vw; height: 100vh;
    background: rgba(10,15,30,0.98);
    backdrop-filter: blur(5px);
    z-index: 2147483647;
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

  printClone.querySelectorAll("img").forEach((img) => {
    img.style.maxWidth = "100%";
    img.style.height = "auto";
    img.style.objectFit = "contain";
  });
  printClone.style.cssText = `display:block !important;width:${A4_PRINT_WIDTH}px !important;background:#fff !important;padding:20px !important;`;

  tempWrapper.appendChild(printClone);
  document.body.appendChild(tempWrapper);

  await waitForImages(printClone);
  await new Promise((r) => setTimeout(r, 300));

  const realWidth = Math.max(A4_PRINT_WIDTH, Math.ceil(printClone.scrollWidth));

  const safeFilename = `FICHA_${(ficha.codigo || "DOC").replace(/[^a-z0-9]/gi, "_")}.pdf`;

  const timeoutId = setTimeout(() => {
    if (document.body.contains(overlay)) {
      document.body.removeChild(overlay);
      document.documentElement.setAttribute("data-theme", currentTheme);
      alert(
        "A geração demorou demais. O celular pode estar com pouca memória livre. Tente remover algumas fotos ou fechar outros aplicativos.",
      );
    }
  }, 25000);

  try {
    const statusText = document.getElementById("ov-status");
    if (statusText) statusText.innerText = "Gerando arquivo PDF...";

    console.log("[Export] Ficha a ser exportada:", ficha.id, ficha.operacao);

    const isMobile = window.innerWidth <= 768;
    const marginPC = [8, 8, 8, 8];
    const marginMobile = [8, 5, 10, 5];

    const finalMargin = isMobile ? marginMobile : marginPC;

    const pdfBlob = await window
      .html2pdf()
      .set({
        margin: finalMargin,
        filename: safeFilename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: Math.min(window.devicePixelRatio || 1, 2),
          useCORS: true,
          backgroundColor: "#ffffff",
          width: realWidth,
          height: printClone.scrollHeight,
          windowWidth: realWidth,
          windowHeight: printClone.scrollHeight,
          onclone: (clonedDoc) => injectPrintStylesOverride(clonedDoc),
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
        pagebreak: {
          mode: ["css", "legacy"],
          avoid: [".foto-frame"],
        },
      })
      .from(printClone)
      .output("blob");

    console.log("[DEBUG] ficha.dbId:", ficha?.dbId);
    const uploadResult = ficha?.dbId ? await uploadPdf(pdfBlob, ficha) : null;
    console.log("[DEBUG] uploadResult:", uploadResult);

    if (!uploadResult) {
      console.warn(
        "[Export] PDF gerado localmente, mas falhou o envio ao servidor.",
      );
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

    document.documentElement.setAttribute("data-theme", currentTheme);
  }
}
