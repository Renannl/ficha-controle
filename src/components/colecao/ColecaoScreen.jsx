import { useParams } from "react-router-dom";

export default function ColecaoScreen({ fichas, criarFicha }) {
  const { id } = useParams();

  const fichasColecao = fichas.filter(
    (f) => String(f.colecao_id) === String(id),
  );

  return (
    <div>
      <h1>Coleção {id}</h1>

      <button onClick={() => criarFicha("50", id)}>Nova TAF</button>

      <button onClick={() => criarFicha("10", id)}>Nova Produção</button>

      {fichasColecao.map((ficha) => (
        <div key={ficha.id}>{ficha.codigo}</div>
      ))}
    </div>
  );
}
