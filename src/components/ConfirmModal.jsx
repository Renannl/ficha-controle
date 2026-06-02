import React from "react";

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "danger",
  showCancel = true,
}) {
  if (!isOpen) return null;

  const getIcon = () => {
    if (type === "success") return "✅";
    if (type === "danger") return "🗑️";
    return "⚠️";
  };

  return (
    <div className="modal-overlay animate-fadeIn">
      <div className="confirm-modal card-glow animate-popIn">
        <div className="confirm-modal-icon">{getIcon()}</div>
        <h3 className="confirm-modal-title">{title}</h3>
        <p className="confirm-modal-message">{message}</p>

        <div className="confirm-modal-actions">
          {showCancel && (
            <button className="btn-modal-cancel" onClick={onCancel}>
              {cancelText}
            </button>
          )}
          <button
            className={`btn-modal-confirm ${type === "danger" ? "btn-danger" : "btn-primary"} ${!showCancel ? "w-full" : ""}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
