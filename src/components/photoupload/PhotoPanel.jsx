import PhotoPanelHeader from "./PhotoPanelHeader";
import PhotoGrid from "./PhotoGrid";
import { usePhotoUpload } from "../../hooks/usePhotoUpload";

export default function PhotoPanel({ ficha, items, onUpdate }) {
  const { handlePhotoUpload } = usePhotoUpload(ficha, onUpdate);

  function removePhoto(idx) {
    if (confirm("Remover esta foto?")) {
      onUpdate(idx, "foto", "");
    }
  }

  function handleMultiUpload(e) {
    const files = Array.from(e.target.files);

    let slotIdx = 0;

    files.forEach((file) => {
      while (slotIdx < items.length && items[slotIdx].foto) {
        slotIdx++;
      }

      if (slotIdx < items.length) {
        handlePhotoUpload(slotIdx, file);
        slotIdx++;
      }
    });
  }

  return (
    <div
      className="photo-panel bg-card card-glow"
      style={{
        padding: "16px",
        borderRadius: "12px",
      }}
    >
      <h2
        style={{
          color: "var(--blue-light)",
          marginBottom: "16px",
          fontSize: "20px",
        }}
      >
        Relatório Fotográfico
      </h2>

      <PhotoPanelHeader items={items} handleMultiUpload={handleMultiUpload} />

      <PhotoGrid
        items={items}
        onUpdate={onUpdate}
        onRemove={removePhoto}
        onUpload={handlePhotoUpload}
      />
    </div>
  );
}
