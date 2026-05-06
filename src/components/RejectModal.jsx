import React, { useState } from 'react';

export default function RejectModal({ isOpen, onClose, onConfirm }) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!reason.trim()) {
      alert("É obrigatório informar o motivo da reprovação.");
      return;
    }
    onConfirm(reason);
    setReason('');
  };

  return (
    <div className="modal-overlay animate-fadeIn">
      <div className="confirm-modal card-glow animate-popIn" style={{ minWidth: '400px' }}>
        <div className="confirm-modal-icon" style={{ background: 'var(--red-glow)', color: 'var(--red)' }}>
          ❌
        </div>
        <h3 className="confirm-modal-title">Reprovar Ficha</h3>
        <p className="confirm-modal-message">
          Descreva os erros registrados ou motivos para a reprovação.<br/>
          Isso será enviado de volta para o operador corrigir e refazer a ficha.
        </p>

        <div style={{ marginTop: '16px', marginBottom: '24px' }}>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Anotações de reprovação obrigatórias..."
            rows={5}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-main)',
              resize: 'none'
            }}
          />
        </div>
        
        <div className="confirm-modal-actions">
          <button className="btn-modal-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button 
            className="btn-modal-confirm btn-danger" 
            onClick={handleConfirm}
            style={{ opacity: reason.trim() ? 1 : 0.5 }}
          >
            Confirmar Reprovação
          </button>
        </div>
      </div>
    </div>
  );
}
