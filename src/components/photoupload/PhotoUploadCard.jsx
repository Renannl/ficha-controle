export default function PhotoUploadCard({
  foto,
  onDescricaoChange,
  onRemove,
  onUpload,
}) {
  return (
    <div
      className="photo-card"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          value={foto.descricao || ""}
          onChange={(e) => onDescricaoChange(foto.id, e.target.value)}
          placeholder="Descrição da foto"
          style={{
            flex: 1,
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
            padding: "6px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "bold",
            textTransform: "uppercase",
          }}
        />
      </div>

      {foto.imagem ? (
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "1/1",
            borderRadius: "6px",
            overflow: "hidden",
            border: "1px solid var(--border)",
          }}
        >
          <img
            src={foto.imagem}
            alt="Evidência"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              background: "#000",
            }}
          />

          <button
            onClick={() => onRemove(foto.id)}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: "rgba(255,0,0,0.85)",
              color: "#fff",
              border: "1px solid #ff4444",
              borderRadius: "4px",
              padding: "6px 12px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            Remover
          </button>
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            aspectRatio: "1/1",
            border: "2px dashed var(--border)",
            borderRadius: "6px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            background: "var(--bg-card)",
          }}
        >
          <div
            style={{
              fontSize: "32px",
              opacity: 0.5,
            }}
          >
            📸
          </div>

          <label
            style={{
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <div
              style={{
                background: "var(--blue)",
                color: "#fff",
                padding: "10px 24px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "700",
              }}
            >
              Tirar / Carregar Foto
            </div>

            <span
              style={{
                fontSize: "10px",
                color: "var(--text-secondary)",
              }}
            >
              Câmera ou Galeria
            </span>

            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => onUpload(foto.id, e.target.files?.[0])}
            />
          </label>
        </div>
      )}
    </div>
  );
}
