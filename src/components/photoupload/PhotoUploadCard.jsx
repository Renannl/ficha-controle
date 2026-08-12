export default function PhotoUploadCard({
  foto,
  onDescricaoChange,
  onRemove,
  onUpload,
}) {
  return (
    <div className="photo-card">
      <input
        type="text"
        className="photo-card-desc"
        value={foto.descricao || ""}
        onChange={(e) => onDescricaoChange(foto.id, e.target.value)}
        placeholder="Descrição da foto"
      />

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
        <div className="photo-card-empty">
          <div className="photo-card-actions">
            <label className="photo-card-btn photo-card-btn-camera">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              Câmera
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="photo-card-upload-input"
                onChange={(e) => onUpload(foto.id, e.target.files?.[0])}
              />
            </label>

            <label className="photo-card-btn photo-card-btn-gallery">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              Galeria
              <input
                type="file"
                accept="image/*"
                className="photo-card-upload-input"
                onChange={(e) => onUpload(foto.id, e.target.files?.[0])}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
