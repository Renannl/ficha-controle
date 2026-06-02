import PhotoUploadCard from "./PhotoUploadCard";

export default function PhotoGrid({ items, onUpdate, onRemove, onUpload }) {
  return (
    <div
      className="photo-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
        gap: "16px",
      }}
    >
      {items.map((item, idx) => (
        <PhotoUploadCard
          key={item.id}
          item={item}
          idx={idx}
          onUpdate={onUpdate}
          onRemove={onRemove}
          onUpload={onUpload}
        />
      ))}
    </div>
  );
}
