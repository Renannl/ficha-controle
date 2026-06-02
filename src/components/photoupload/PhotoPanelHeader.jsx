export default function PhotoPanelHeader({ items, handleMultiUpload }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
        gap: "16px",
        flexWrap: "wrap",
      }}
    >
      <p
        style={{
          color: "var(--text-secondary)",
          fontSize: "14px",
          margin: 0,
        }}
      >
        Tire fotos direto da câmera com seu celular ou carregue imagens da
        galeria.
      </p>

      <label className="photo-multi-upload">
        <span>📂</span>
        Carregar Vários Arquivos
        <input
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handleMultiUpload}
        />
      </label>
    </div>
  );
}
