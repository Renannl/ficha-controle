import { useRef, useEffect, useState, useCallback } from "react";
import { PenLine } from "lucide-react";

export default function SignatureCanvas({ dataUrl, onSave, onClear }) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    function ajustar() {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const escala = Math.max(2, window.devicePixelRatio || 1);
      const largura = Math.round(rect.width * escala);
      const altura = Math.round(rect.height * escala);
      if (canvas.width === largura && canvas.height === altura) return;

      let copia = null;
      if (canvas.width && canvas.height) {
        copia = document.createElement("canvas");
        copia.width = canvas.width;
        copia.height = canvas.height;
        copia.getContext("2d").drawImage(canvas, 0, 0);
      }

      canvas.width = largura;
      canvas.height = altura;

      const ctx = canvas.getContext("2d");
      if (copia) ctx.drawImage(copia, 0, 0, largura, altura);
      ctx.setTransform(escala, 0, 0, escala, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
    }

    ajustar();
    const observador = new ResizeObserver(ajustar);
    observador.observe(canvas);
    return () => observador.disconnect();
  }, [dataUrl]);

  const getPos = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const touch = e.touches ? e.touches[0] : e;

    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  }, []);

  function startDraw(e) {
    e.preventDefault();

    isDrawing.current = true;
    lastPos.current = getPos(e);
  }

  function draw(e) {
    if (!isDrawing.current) return;

    e.preventDefault();

    const pos = getPos(e);

    const ctx = canvasRef.current.getContext("2d");

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    lastPos.current = pos;

    if (!hasDrawn) {
      setHasDrawn(true);
    }
  }

  function endDraw(e) {
    if (e) e.preventDefault();

    isDrawing.current = false;
  }

  function handleSave() {
    const url = canvasRef.current.toDataURL("image/png");
    onSave(url);
  }

  function handleClear() {
    const canvas = canvasRef.current;

    if (canvas) {
      const ctx = canvas.getContext("2d");

      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    setHasDrawn(false);
    onClear();
  }

  if (dataUrl) {
    return (
      <>
        <div className="signature-preview">
          <img src={dataUrl} alt="Assinatura" />
        </div>

        <div className="signature-actions">
          <button className="btn btn-ghost btn-sm" onClick={handleClear}>
            Refazer
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="signature-canvas-wrap">
        <canvas
          ref={canvasRef}
          className="signature-canvas"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />

        {!hasDrawn && (
          <div className="signature-placeholder">
            <PenLine size={16} />
            Assine aqui
          </div>
        )}
      </div>

      <div className="signature-actions">
        <button className="btn btn-ghost btn-sm" onClick={handleClear}>
          Limpar
        </button>

        <button
          className="btn btn-primary btn-sm"
          onClick={handleSave}
          disabled={!hasDrawn}
          style={{
            opacity: hasDrawn ? 1 : 0.5,
          }}
        >
          Salvar Assinatura
        </button>
      </div>
    </>
  );
}
