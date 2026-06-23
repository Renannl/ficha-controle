import { useNavigate } from "react-router-dom";

export default function ColecoesList({
  colecoes,
  fichas,
}) {
  const navigate = useNavigate();

  return (
    <div className="colecoes-grid">
      {colecoes.map((colecao) => {
        const preview = fichas
          .filter((f) => f.colecao_id === colecao.id)
          .slice(0, 3);

        const total = fichas.filter(
          (f) => f.colecao_id === colecao.id,
        ).length;

        return (
          <div
            key={colecao.id}
            className="colecao-card"
            onClick={() =>
              navigate(`/colecao/${colecao.id}`)
            }
          >
            <h3>{colecao.cliente}</h3>

            <p>{colecao.codigo_proposta}</p>

            <div className="colecao-preview">
              {preview.map((ficha) => (
                <div
                  key={ficha.id}
                  className="preview-ficha"
                >
                  {ficha.codigo}
                </div>
              ))}
            </div>

            <small>
              {total} fichas
            </small>
          </div>
        );
      })}
    </div>
  );
}