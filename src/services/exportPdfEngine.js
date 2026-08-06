// exportPdfEngine.js
import { uploadPdf, uploadBook } from "./uploadService";

const PDF_PAGE_WIDTH = 2000;

function extractAllCssText() {
  let cssText = "";
  const importsFallback = [];
  const sheets = Array.from(document.styleSheets);

  for (const sheet of sheets) {
    try {
      const rules = sheet.cssRules || sheet.rules;
      if (!rules) continue;
      for (const rule of rules) {
        cssText += rule.cssText + "\n";
      }
    } catch (e) {
      if (sheet.href) {
        importsFallback.push(`@import url("${sheet.href}");`);
      }
    }
  }

  return importsFallback.join("\n") + "\n" + cssText;
}

function injectFullCssSync(clonedDoc, cssText) {
  const style = clonedDoc.createElement("style");
  style.setAttribute("data-injected", "exportPdfEngine");
  style.textContent = cssText;
  clonedDoc.head.appendChild(style);
}

/**
 * 🔑 AJUSTE CRÍTICO
 * - thead e tbody usam display:flex nas <tr>, com o MESMO número de
 *   colunas (rowSpan/colSpan foram removidos do JSX do checklist).
 * - Classes .col-it/.col-desc/.col-sessions/.col-result definem a
 *   largura de cada coluna, aplicadas tanto em <th> quanto em <td>.
 * - break-inside: avoid em <tr> pra não cortar linha no meio entre páginas.
 * - font-size legível (15px), não mais 7px.
 */
function injectPdfOverridesSync(clonedDoc, width) {
  const style = clonedDoc.createElement("style");
  style.setAttribute("data-injected", "exportPdfEngine-overrides");
  style.textContent = `
    /* Unifica thead E tbody no MESMO sistema de layout (flex) */
    .print-checklist-table,
    .print-checklist-table thead,
    .print-checklist-table tbody {
      display: block !important;
      width: 100% !important;
    }

    .print-checklist-table thead tr,
    .print-checklist-table tbody tr {
      display: flex !important;
      width: 100% !important;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    .print-checklist-table thead th,
    .print-checklist-table tbody td {
      display: flex !important;
      align-items: center;
      border: 1px solid #000 !important;
      box-sizing: border-box !important;
    }

    /* section-title-row: 1 único td -> 100% */
    .print-checklist-table .section-title-row td {
      flex: 1 1 100% !important;
      width: 100% !important;
    }

    /* goal-row: 2 tds -> 44% / 56% */
    .print-checklist-table .goal-row td:first-child {
      flex: 0 0 44% !important;
      width: 44% !important;
    }
    .print-checklist-table .goal-row td:last-child {
      flex: 1 1 auto !important;
      width: 56% !important;
    }

    /* Larguras — MESMAS classes aplicadas em th E td */
    .col-it       { flex: 0 0 4%    !important; width: 4%    !important; justify-content: center; }
    .col-desc     { flex: 0 0 40%   !important; width: 40%   !important; justify-content: flex-start; text-align: left; }
    .col-sessions { flex: 0 0 2.53% !important; width: 2.53% !important; justify-content: center; }
    .col-result   { flex: 0 0 4%    !important; width: 4%    !important; justify-content: center; }

    /* Fonte legível dentro do canvas de 2000px */
    .print-checklist-table td,
    .print-checklist-table th {
      font-size: 15px !important;
      line-height: 1.3 !important;
      padding: 6px 4px !important;
    }

    .print-checklist-table .item-desc {
      font-size: 15px !important;
      font-weight: 600;
    }

    /* Rótulo "SESSÕES DE TRABALHO" acima da tabela */
    .print-checklist-group-label {
      text-align: center !important;
      font-weight: 700 !important;
      font-size: 15px !important;
      margin-bottom: 4px !important;
    }
  `;
  clonedDoc.head.appendChild(style);
}

function lockElementWidth(root, width) {
  root.style.setProperty("transform", "none", "important");
  root.style.setProperty("zoom", "1", "important");
  root.style.setProperty("width", `${width}px`, "important");
  root.style.setProperty("max-width", `${width}px`, "important");
  root.style.setProperty("margin", "0", "important");
}

function resetPageScroll() {
  window.scrollTo(0, 0);
  document.documentElement.scrollLeft = 0;
  document.body.scrollLeft = 0;
}

async function waitAllImagesReady(container) {
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

function lockViewportMeta(width) {
  const meta = document.querySelector('meta[name="viewport"]');
  const original = meta ? meta.getAttribute("content") : null;
  if (meta) {
    meta.setAttribute("content", `width=${width + 50}, initial-scale=1`);
  }
  return { meta, original };
}

function unlockViewportMeta({ meta, original }) {
  if (meta && original !== null) {
    meta.setAttribute("content", original);
  }
}

async function buildPdfBlob({
  sourceElement,
  targetId,
  filename,
  extraMarginBottom = 8,
}) {
  const cssText = extractAllCssText();
  const currentTheme =
    document.documentElement.getAttribute("data-theme") || "light";
  document.documentElement.setAttribute("data-theme", "light");

  const wrapper = document.createElement("div");
  wrapper.style.cssText = `
    position: absolute; top:0; left:0; opacity:0.01; z-index:-1;
    width: ${PDF_PAGE_WIDTH}px; background:#fff; pointer-events:none;
  `;

  const clone = sourceElement.cloneNode(true);
  clone.id = targetId;
  clone.classList.remove("print-only");
  clone.style.width = `${PDF_PAGE_WIDTH}px`;

  clone.querySelectorAll("img").forEach((img) => {
    img.style.maxWidth = "100%";
    img.style.height = "auto";
    img.style.objectFit = "contain";
  });
  clone.style.cssText += `display:block; background:#fff; padding:20px;`;

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  // 🔑 Injeta TODO o CSS (incluindo overrides de fonte) no clone ANTES de medir
  injectFullCssSync(document, cssText);

  // 🔑 CORREÇÃO: injeta os overrides de fonte direto no document (afeta o clone)
  // ANTES da medição, pra scrollHeight já refletir a fonte maior real.
  const preMeasureStyle = document.createElement("style");
  preMeasureStyle.setAttribute("data-injected", "exportPdfEngine-premeasure");
  preMeasureStyle.textContent = `
  #${targetId} table td, #${targetId} table th,
  #${targetId} .taf-pdf-table td, #${targetId} .taf-pdf-table th {
    font-size: 17px !important;
    line-height: 1.5 !important;
    padding: 8px 10px !important;
  }

  /* Checklist tem tamanho próprio, calibrado pro canvas de 2000px */
  #${targetId} .print-checklist-table td,
  #${targetId} .print-checklist-table th {
    font-size: 15px !important;
    padding: 6px 4px !important;
  }

  #${targetId} .print-checklist-group-label {
    font-size: 15px !important;
    font-weight: 700 !important;
  }

  #${targetId} h1, #${targetId} h2, #${targetId} h3, #${targetId} h4 {
    font-size: 1.4em !important;
  }
`;
  document.head.appendChild(preMeasureStyle);

  await waitAllImagesReady(clone);
  await new Promise((r) => setTimeout(r, 500));

  // 🔑 MEDIÇÃO REAL — agora já reflete a fonte maior aplicada
  const realWidth = Math.max(
    clone.scrollWidth,
    clone.offsetWidth,
    PDF_PAGE_WIDTH,
  );
  const realHeight = Math.max(clone.scrollHeight, clone.offsetHeight);

  // 🔼 Margem de segurança maior (fonte grande = mais risco de sub-medição)
  const safeWidth = realWidth + 40;
  const safeHeight = realHeight + 80;

  const viewportMeta = document.querySelector('meta[name="viewport"]');
  const originalMeta = viewportMeta
    ? viewportMeta.getAttribute("content")
    : null;
  if (viewportMeta) {
    viewportMeta.setAttribute("content", `width=${safeWidth}, initial-scale=1`);
  }

  const isMobile = window.innerWidth <= 768;
  const finalMargin = isMobile
    ? [8, 5, extraMarginBottom + 2, 5]
    : [8, 8, extraMarginBottom, 8];

  try {
    const pdfBlob = await window
      .html2pdf()
      .set({
        margin: finalMargin,
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 3,
          useCORS: true,
          backgroundColor: "#ffffff",
          width: safeWidth,
          height: safeHeight,
          windowWidth: safeWidth,
          windowHeight: safeHeight,
          scrollX: 0,
          scrollY: 0,
          onclone: (clonedDoc) => {
            clonedDoc.documentElement.scrollLeft = 0;
            clonedDoc.body.scrollLeft = 0;
            injectFullCssSync(clonedDoc, cssText);
            injectPdfOverridesSync(clonedDoc, safeWidth);
          },
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "landscape",
        },
        pagebreak: {
          mode: ["css"],
        },
      })
      .from(clone)
      .output("blob");
    return pdfBlob;
  } finally {
    if (viewportMeta && originalMeta) {
      viewportMeta.setAttribute("content", originalMeta);
    }
    if (document.head.contains(preMeasureStyle)) {
      document.head.removeChild(preMeasureStyle);
    }
    if (document.body.contains(wrapper)) document.body.removeChild(wrapper);
    document.documentElement.setAttribute("data-theme", currentTheme);
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
  }, 1000);
}

export async function generateFichaPdf(ficha, elementId = "print-view-root") {
  const sourceElement = document.getElementById(elementId);
  if (!sourceElement) {
    console.error("[generateFichaPdf] Elemento não encontrado:", elementId);
    return false;
  }

  if (!ficha?.dbId) {
    alert(
      "Atenção: a ficha ainda não foi salva no servidor. O PDF será baixado, mas não enviado.",
    );
  }

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
    <style>@keyframes finalSpin { 100% { transform:rotate(360deg); } }</style>
  `;
  document.body.appendChild(overlay);

  const safeFilename = `FICHA_${(ficha.codigo || "DOC").replace(/[^a-z0-9]/gi, "_")}.pdf`;

  const timeoutId = setTimeout(() => {
    if (document.body.contains(overlay)) {
      document.body.removeChild(overlay);
      alert("A geração demorou demais. Tente novamente.");
    }
  }, 25000);

  try {
    const pdfBlob = await buildPdfBlob({
      sourceElement,
      targetId: elementId,
      filename: safeFilename,
    });

    const uploadResult = ficha?.dbId ? await uploadPdf(pdfBlob, ficha) : null;

    if (!uploadResult) {
      console.warn(
        "[generateFichaPdf] PDF gerado localmente, mas falhou o envio ao servidor.",
      );
    }

    downloadBlob(pdfBlob, safeFilename);
    return true;
  } catch (err) {
    console.error("[generateFichaPdf] Erro:", err);
    alert("Erro ao gerar PDF: " + err.message);
    return false;
  } finally {
    clearTimeout(timeoutId);
    if (document.body.contains(overlay)) document.body.removeChild(overlay);
  }
}

export async function generateBookPdf(fichaIds, elementId = "book-print-root") {
  const sourceElement = document.getElementById(elementId);
  if (!sourceElement) {
    console.error("[generateBookPdf] Elemento não encontrado:", elementId);
    return false;
  }

  if (!fichaIds || fichaIds.length === 0) {
    alert("Selecione ao menos uma ficha para vincular ao book.");
    return false;
  }

  try {
    const pdfBlob = await buildPdfBlob({
      sourceElement,
      targetId: elementId,
      filename: "BOOK.pdf",
    });

    const uploadResult = await uploadBook(pdfBlob, fichaIds);
    if (!uploadResult) {
      console.warn(
        "[generateBookPdf] Book gerado, mas falhou o envio ao servidor.",
      );
    }

    downloadBlob(pdfBlob, "BOOK.pdf");
    return true;
  } catch (err) {
    console.error("[generateBookPdf] Erro:", err);
    alert("Erro ao gerar Book: " + err.message);
    return false;
  }
}
