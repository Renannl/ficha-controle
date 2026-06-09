import React, { useState } from "react";

export default function ApproveModal({ isOpen, onClose, onConfirm }) {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(reason);
    setReason("");
  };

  return (
    <div className="modal-overlay animate-fadeIn">
      <div
        className="confirm-modal card-glow animate-popIn"
        style={{ minWidth: "400px" }}
      >
        <div
          className="confirm-modal-icon"
          style={{
            background: "var(--green-glow)",
            color: "var(--green)",
          }}
        >
          ✅
        </div>

        <h3 className="confirm-modal-title">Aprovar Ficha</h3>

        <p className="confirm-modal-message">
          Adicione uma observação para o operador.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Anotações de aprovação obrigatórias..."
          rows={5}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            background: "var(--bg-secondary)",
            color: "var(--text-main)",
            resize: "none",
          }}
        />

        <div className="confirm-modal-actions">
          <button className="btn-modal-cancel" onClick={onClose}>
            Cancelar
          </button>

          <button
            className="btn-modal-confirm btn-primary"
            onClick={handleConfirm}
          >
            Confirmar Aprovação
          </button>
        </div>
      </div>
    </div>
  );
}