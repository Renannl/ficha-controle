import { QRCodeSVG } from "qrcode.react";
import { montarUrlPublica } from "./QrCodeDocumentacao";

export default function QrCodePrint({ ficha, size = 64 }) {
  const token = ficha?.tokenPublico;

  console.log("[QrCodePrint] renderizando com token:", token);

  if (!token) return <div>SEM TOKEN</div>;

  const url = montarUrlPublica(token);

  return (
    <div className="qr-print">
      <QRCodeSVG
        value={url}
        size={size}
        level="H"
        marginSize={1}
        bgColor="#ffffff"
        fgColor="#000000"
      />
      <div className="qr-print-label">Documentos do painel</div>
    </div>
  );
}
