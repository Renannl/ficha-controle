import { uploadPdf, uploadBook } from "./uploadService";
/**
 * Serviço de Exportação de PDF (Ficha / Book)
 */

const A4_PRINT_WIDTH = 780;

function copyHeadStyles(clonedDoc) {
  const nodes = document.querySelectorAll('style, link[rel="stylesheet"]');
  const loadPromises = [];

  nodes.forEach((node) => {
    const clone = node.cloneNode(true);
    clonedDoc.head.appendChild(clone);

    // Se for <link>, espera o carregamento real do CSS no novo doc
    if (node.tagName === "LINK") {
      loadPromises.push(
        new Promise((resolve) => {
          clone.onload = resolve;
          clone.onerror = resolve; // não trava se falhar
          setTimeout(resolve, 2000); // fallback de segurança
        }),
      );
    }
  });

  return Promise.all(loadPromises);
}

function injectPrintStylesOverride(clonedDoc) {
  const style = clonedDoc.createElement("style");
  style.innerHTML = `
    html, body {
      width: ${A4_PRINT_WIDTH}px !important;
      background: #fff !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: visible !important;
    }
    img {
      max-width: 100% !important;
      height: auto !important;
    }
    .print-only,
    .book-mode {
      display: block !important;
      width: 100% !important;
    }

    /* 🔑 FORÇA o layout "mobile" das tabelas/grids, 
       ignorando @media queries do desktop */
    .print-checklist-table,
    .fotos-grid,
    .taf-pdf-table {
      display: table !important; /* ou o display correto do modo mobile */
    }
  `;
  clonedDoc.head.appendChild(style);
}

function forceFullWidth(root, width) {
  root.style.setProperty("transform", "none", "important");
  root.style.setProperty("zoom", "1", "important");
  root.style.setProperty("width", `${width}px`, "important");
  root.style.setProperty("max-width", `${width}px`, "important");
  root.style.setProperty("margin", "0", "important");
}

/**
 * 🆕 Copia todos os <style> e <link rel="stylesheet"> do documento real
 * para o clone, garantindo que classes de CSS Modules/styled-components
 * sejam aplicadas corretamente durante a captura do html2canvas.
 */

function disableViewportConstraint() {
  const meta = document.querySelector('meta[name="viewport"]');
  const original = meta ? meta.getAttribute("content") : null;
  if (meta) {
    meta.setAttribute(
      "content",
      `width=${A4_PRINT_WIDTH + 50}, initial-scale=1`,
    );
  }
  return { meta, original };
}

function restoreViewportConstraint({ meta, original }) {
  if (meta && original !== null) {
    meta.setAttribute("content", original);
  }
}

function resetScrollPosition() {
  window.scrollTo(0, 0);
  document.documentElement.scrollLeft = 0;
  document.body.scrollLeft = 0;
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
 * Gera um PDF (Book) a partir de um elemento HTML e o salva/envia.
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

  const currentTheme =
    document.documentElement.getAttribute("data-theme") || "light";
  document.documentElement.setAttribute("data-theme", "light");

  const tempWrapper = document.createElement("div");
  tempWrapper.style.cssText = `
    position:absolute; top:0; left:0;
    width:${A4_PRINT_WIDTH}px;
    background:#fff;
    opacity:0.01; z-index:-1; pointer-events:none;
  `;

  const printClone = originalElement.cloneNode(true);
  printClone.id = elementId;
  printClone.style.cssText = `
    display:block !important;
    width:${A4_PRINT_WIDTH}px !important;
    max-width:${A4_PRINT_WIDTH}px !important;
    background:#fff !important;
  `;

  forceFullWidth(printClone, A4_PRINT_WIDTH);

  tempWrapper.appendChild(printClone);
  document.body.appendChild(tempWrapper);

  await waitForImages(printClone);
  await new Promise((r) => setTimeout(r, 300));

  resetScrollPosition();
  const viewportState = disableViewportConstraint();
  await new Promise((r) => setTimeout(r, 100));

  try {
    const pdfBlob = await window
      .html2pdf()
      .set({
        margin: [8, 8, 8, 8],
        filename: "BOOK.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          width: A4_PRINT_WIDTH,
          height: printClone.scrollHeight,
          windowWidth: A4_PRINT_WIDTH,
          windowHeight: printClone.scrollHeight,
          scrollX: 0,
          scrollY: 0,
          onclone: async (clonedDoc) => {
            await copyHeadStyles(clonedDoc);
            injectPrintStylesOverride(clonedDoc); // essa é síncrona, não precisa de await
          },
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
    restoreViewportConstraint(viewportState);
    if (document.body.contains(tempWrapper)) {
      document.body.removeChild(tempWrapper);
    }
    document.documentElement.setAttribute("data-theme", currentTheme);
  }
}

/**
 * Gera um PDF (Ficha) a partir de um elemento HTML e o salva/envia.
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
  tempWrapper.style.cssText = `position:absolute;top:0;left:0;width:${A4_PRINT_WIDTH}px;background:#fff;opacity:0.01;z-index:-1;pointer-events:none;`;
  const printClone = originalElement.cloneNode(true);
  printClone.id = elementId;
  printClone.classList.remove("print-only");

  forceFullWidth(printClone, A4_PRINT_WIDTH);

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
  printClone.style.cssText = `display:block !important;width:${A4_PRINT_WIDTH}px !important;max-width:${A4_PRINT_WIDTH}px !important;background:#fff !important;padding:20px !important;`;

  tempWrapper.appendChild(printClone);
  document.body.appendChild(tempWrapper);

  await waitForImages(printClone);
  await new Promise((r) => setTimeout(r, 300));

  resetScrollPosition();
  const viewportState = disableViewportConstraint();
  await new Promise((r) => setTimeout(r, 100));

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
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          width: A4_PRINT_WIDTH,
          height: printClone.scrollHeight,
          windowWidth: A4_PRINT_WIDTH,
          windowHeight: printClone.scrollHeight,
          scrollX: 0,
          scrollY: 0,
          onclone: (clonedDoc) => {
            copyHeadStyles(clonedDoc);
            injectPrintStylesOverride(clonedDoc);
          },
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
    restoreViewportConstraint(viewportState);
    if (document.body.contains(tempWrapper))
      document.body.removeChild(tempWrapper);
    if (document.body.contains(overlay)) document.body.removeChild(overlay);

    document.documentElement.setAttribute("data-theme", currentTheme);
  }
}
