export default function PhotoAlbumCard({ ficha, onClick }) {
  const photoCount = ficha.items.filter((i) => i.foto).length || 0;

  const coverPhoto = ficha.items.find((i) => i.foto)?.foto;

  return (
    <div className="photo-album-card" onClick={onClick}>
      <div className="album-cover">
        {coverPhoto ? (
          <img src={coverPhoto} alt="Cover" />
        ) : (
          <div className="album-placeholder">📸</div>
        )}

        <div className="album-badge">{photoCount} fotos</div>
      </div>

      <div className="album-info">
        <div className="album-title">{ficha.nomeEquipamento || "Sem Nome"}</div>

        <div className="album-sub">
          {ficha.cliente} ·{" "}
          {ficha.createdAt
            ? new Date(ficha.createdAt).toLocaleDateString()
            : "--"}
        </div>
      </div>
    </div>
  );
}
