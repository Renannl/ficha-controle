export default function PhotoCard({ foto, descricao, itemId, downloadName }) {
  return (
    <div className="photo-bank-card card-glow">
      <div className="photo-bank-img-wrap">
        <img src={foto} alt={descricao} />

        <a
          href={foto}
          download={downloadName}
          className="photo-download-btn"
          onClick={(e) => e.stopPropagation()}
        >
          📥
        </a>
      </div>

      <div className="photo-bank-info">
        <span className="photo-bank-id">{itemId}</span>

        <span className="photo-bank-desc">{descricao || "Sem descrição"}</span>
      </div>
    </div>
  );
}
