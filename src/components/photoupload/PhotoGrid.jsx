import PhotoUploadCard from "./PhotoUploadCard";

export default function PhotoGrid({
  fotos,
  onRemove,
  onUpload,
  onDescricaoChange,
  onAdd,
}) {
  return (
    <div
      className="photo-grid"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "16px",
      }}
    >
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
        <span className="add-photo-tile-icon">＋</span>
        <span className="add-photo-tile-text">Adicionar Foto</span>
      </button>
    </div>
  );
}
