import PhotoUploadCard from "./PhotoUploadCard";

export default function PhotoGrid({
  fotos,
  onRemove,
  onUpload,
  onDescricaoChange,
  onAdd,
}) {
  return (
    <div className="photo-grid">
      {fotos.map((foto) => (
        <div key={foto.id} className="photo-grid-item">
          <PhotoUploadCard
            foto={foto}
            onRemove={onRemove}
            onDescricaoChange={onDescricaoChange}
            onUpload={onUpload}
          />
        </div>
      ))}

      <button type="button" className="add-photo-tile" onClick={onAdd}>
        <span className="add-photo-tile-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </span>
        <span className="add-photo-tile-text">Adicionar Foto</span>
        <span className="add-photo-tile-sub">Câmera ou Galeria</span>
      </button>
    </div>
  );
}
