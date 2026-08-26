import { useEffect, useState } from "react";
import QRCode from "qrcode";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function montarUrlPublica(token) {
  return `${API_URL}/publico/ficha/${token}/pdf`;
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
