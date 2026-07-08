import { getFichaPhotos } from "../../utils/getFichasPhotos";

export default function PhotoBankColecoes({
  colecoes = [],
  fichas = [],
  onOpenColecao,
}) {
  return (
    <div className="photo-album-grid">
      {colecoes.map((colecao) => {
        const fichasDaColecao = fichas.filter(
          (f) => String(f.colecao_id) === String(colecao.id),
        );

        const totalFotos = fichasDaColecao.reduce(
          (acc, f) => acc + getFichaPhotos(f).length,
          0,
        );
        const capa = getFichaPhotos(fichasDaColecao[0])[0]?.foto;

        return (
          <div
            key={colecao.id}
            className="photo-album-card"
            onClick={() => onOpenColecao(colecao)}
          >
            <div className="album-cover">
              {capa ? (
                <img src={capa} alt="Cover" />
              ) : (
                <div className="album-placeholder">🗂️</div>
              )}
              <div className="album-badge">{totalFotos} fotos</div>
            </div>
            <div className="album-info">
              <div className="album-title">{colecao.nome}</div>
              <div className="album-sub">
                {fichasDaColecao.length} ficha(s) · {colecao.cliente}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
