import PhotoUploadCard from "./PhotoUploadCard";

export default function PhotoGrid({
  fotos,
  onRemove,
  onUpload,
  onDescricaoChange,
}) {
  return (
    <div
      className="photo-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
        gap: "16px",
      }}
    >
      {fotos.map((foto) => (
        <PhotoUploadCard
          key={foto.id}
          foto={foto}
          onRemove={onRemove}
          onDescricaoChange={onDescricaoChange}
          onUpload={onUpload}
        />
      ))}
    </div>
  );
}
