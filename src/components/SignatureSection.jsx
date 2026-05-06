import { useRef, useEffect, useState, useCallback } from 'react'

function SignatureCanvas({ dataUrl, onSave, onClear }) {
  const canvasRef = useRef(null)
  const isDrawing = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const [hasDrawn, setHasDrawn] = useState(false)

  // Set canvas resolution on mount
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * 2
    canvas.height = rect.height * 2
    const ctx = canvas.getContext('2d')
    ctx.scale(2, 2)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
  }, [dataUrl])

  const getPos = useCallback((e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches ? e.touches[0] : e
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    }
  }, [])

  function startDraw(e) {
    e.preventDefault()
    isDrawing.current = true
    lastPos.current = getPos(e)
  }

  function draw(e) {
    if (!isDrawing.current) return
    e.preventDefault()
    const pos = getPos(e)
    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    lastPos.current = pos
    if (!hasDrawn) setHasDrawn(true)
  }

  function endDraw(e) {
    if (e) e.preventDefault()
    isDrawing.current = false
  }

  function handleSave() {
    const canvas = canvasRef.current
    const url = canvas.toDataURL('image/png')
    onSave(url)
  }

  function handleClear() {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    setHasDrawn(false)
    onClear()
  }

  // If we already have a saved signature, show the preview
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
    )
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
            Assine aqui ✍️
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
          style={{ opacity: hasDrawn ? 1 : 0.5 }}
        >
          Salvar Assinatura
        </button>
      </div>
    </>
  )
}

const ROLES = [
  { key: 'executante', label: 'Executante' },
  { key: 'tecnico',    label: 'Técnico Responsável' },
  { key: 'supervisor', label: 'Supervisor IndusPower' },
]

export default function SignatureSection({ assinaturas, onSign, onNameChange, onFinalizar }) {
  return (
    <div className="signatures-section">
      <div className="card mb-3" style={{ padding: 0, overflow: 'visible', background: 'transparent', border: 'none', boxShadow: 'none' }}>
        <div className="section-header" style={{ padding: '0 0 12px', marginBottom: 16 }}>
          <div className="section-icon">✍️</div>
          <div>
            <h2>Assinaturas</h2>
            <p>Executante, Técnico e Supervisor</p>
          </div>
        </div>
      </div>

      {ROLES.map(role => {
        const sig = assinaturas[role.key]
        return (
          <div key={role.key} className="signature-block animate-fadeIn">
            <div className="signature-block-header">
              <span className="signature-role">{role.label}</span>
              {sig.data && (
                <span className="signature-date">Assinado em {sig.data}</span>
              )}
            </div>
            <input
              className="signature-name-input"
              value={sig.nome}
              onChange={(e) => onNameChange(role.key, e.target.value)}
              placeholder={`Nome do ${role.label.toLowerCase()}`}
            />
            <SignatureCanvas
              dataUrl={sig.dataUrl}
              onSave={(url) => onSign(role.key, url)}
              onClear={() => onSign(role.key, '')}
            />
          </div>
        )
      })}

      <div className="finalize-section animate-slideUp">
        <div className="finalize-card">
          <div className="finalize-header">
            <h3>Finalizar Ficha</h3>
            <p>Conclua a operação e gere o relatório oficial (PDF)</p>
          </div>
          
          <button 
            className="btn btn-primary btn-lg finalize-btn"
            onClick={() => onFinalizar()}
          >
            <span className="btn-icon">💾</span>
            Finalizar e Gerar PDF
          </button>
          
          <p className="finalize-note" style={{ fontSize: '11px', textAlign: 'center', opacity: 0.6, marginTop: '8px' }}>
            O relatório será gerado com os dados preenchidos até agora.
          </p>
        </div>
      </div>
    </div>
  )
}
