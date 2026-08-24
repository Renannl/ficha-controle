import { useEffect, useState } from "react";
import QRCode from "qrcode";

// Monta a URL pública que o QR vai apontar
export function montarUrlPublica(token) {
  return `${window.location.origin}/publico/ficha/${token}`;
}

// Hook: gera o data URL PNG do QR de forma assíncrona
export function useQrDataUrl(url) {
  const [dataUrl, setDataUrl] = useState(null);

  useEffect(() => {
    if (!url) return;
    let ativo = true;

    QRCode.toDataURL(url, {
      width: 512,
      margin: 2,
      errorCorrectionLevel: "H", // alta correção — ideal pra impressão/adesivo
    }).then((d) => {
      if (ativo) setDataUrl(d);
    });

    return () => {
      ativo = false;
    };
  }, [url]);

  return dataUrl;
}

// Baixa o PNG (pra imprimir e colar no painel)
export function baixarQrCode(dataUrl, filename) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
