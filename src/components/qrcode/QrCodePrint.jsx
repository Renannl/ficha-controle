import { QRCodeSVG } from "qrcode.react";
import { montarUrlPublica } from "./QrCodeDocumentacao";

export default function QrCodePrint({ ficha, size = 150 }) {
  const token = ficha?.tokenPublico;

  if (!token) return null;

  const url = montarUrlPublica(token);

  return (
    <div className="qr-print">
      <QRCodeSVG
        value={url}
        size={size}
        level="L"
        marginSize={4}
        bgColor="#ffffff"
        fgColor="#000000"
        shapeRendering="crispEdges"
        style={{
          display: "block",
          width: `${size}px`,
          height: `${size}px`,
          maxWidth: "none",
          maxHeight: "none",
          overflow: "visible",
          stroke: "none",
        }}
      />
    </div>
  );
}
