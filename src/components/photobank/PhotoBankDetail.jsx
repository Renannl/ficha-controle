import { getFichaPhotos } from "../../utils/getFichasPhotos";
import PhotoCard from "./PhotoCard";

export default function PhotoBankDetail({ ficha, onBack }) {
  const photos = getFichaPhotos(ficha);

  return (
    <div
      className="photo-bank-detail animate-fadeIn"
      style={{
        padding: "20px 16px 100px",
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <button className="btn-icon" onClick={onBack}>
          ←
        </button>

        <div>
          <h3 className="text-lg font-bold">
            {ficha.nomeEquipamento || "Sem Nome"}
          </h3>

          <p className="text-xs text-muted">
            Exibindo {photos.length} fotos · {ficha.cliente}
          </p>
        </div>
      </div>

      <div
        className="photo-bank-grid"
        style={{
          marginLeft: "5px",
          marginRight: "5px",
        }}
      >
        {photos.map((item, idx) => (
          <PhotoCard
            key={item.id ?? idx}
            foto={item.foto}
            descricao={item.descricao}
            itemId={idx + 1}
            downloadName={`FOTO_${ficha.codigo}_${idx + 1}.jpg`}
          />
        ))}
      </div>
    </div>
  );
}
