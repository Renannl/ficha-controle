export default function PhotoUploadCard({
  foto,
  onDescricaoChange,
  onRemove,
  onUpload,
}) {
  return (
    <div className="photo-card">
      {/* ── Input de descrição ── */}
      <input
        type="text"
        className="photo-card-desc"
        value={foto.descricao || ""}
        onChange={(e) => onDescricaoChange(foto.id, e.target.value)}
        placeholder="Descrição da foto"
      />

      {/* ── Foto carregada ── */}
      {foto.imagem ? (
        <div className="photo-card-preview">
          <img src={foto.imagem} alt="Evidência" className="photo-card-img" />

          <button
            type="button"
            className="photo-card-remove"
            onClick={() => onRemove(foto.id)}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
            Remover
          </button>
        </div>
      ) : (
        /* ── Estado vazio ── */
        <div className="photo-card-empty">
          <div className="photo-card-empty-icon">📸</div>

          <label className="photo-card-upload-label">
            <span className="photo-card-upload-btn">Tirar / Carregar Foto</span>
            <span className="photo-card-upload-hint">Câmera ou Galeria</span>

            <input
              type="file"
              accept="image/*"
              className="photo-card-upload-input"
              onChange={(e) => onUpload(foto.id, e.target.files?.[0])}
            />
          </label>
        </div>
      )}
    </div>
  );
}
