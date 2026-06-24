// ColecaoScreen.jsx
import { useParams, useNavigate } from "react-router-dom";
import FichaCard from "../home/FichaCard";

export default function ColecaoScreen({
  fichas,
  colecoes,
  user,
  listaUsuarios,
  onDelete,
}) {
  const { id } = useParams();
  const navigate = useNavigate(); // ← agora ela própria navega

  const colecao = colecoes.find((c) => String(c.id) === String(id));
  const fichasColecao = fichas.filter((f) => String(f.colecao_id) === String(id));

  // ← Navega para a rota da ficha dentro da coleção
  function handleOpen(fichaId) {
    navigate(`/colecao/${id}/ficha/${fichaId}`);
  }

  return (
    <div className="home-list">
      <div className="colecao-header">
        <h2>{colecao?.cliente}</h2>
        <p>{colecao?.codigo_proposta}</p>
        <small>{fichasColecao.length} fichas</small>
      </div>

      {fichasColecao.map((ficha, index) => (
        <FichaCard
          key={ficha.id}
          ficha={ficha}
          index={index}
          user={user}
          listaUsuarios={listaUsuarios}
          onOpen={handleOpen} // ← usa o local agora
          onDelete={onDelete}
          selected={false}
          selectionOrder={0}
          onToggleSelection={() => {}}
          onToggleOperador={() => {}}
          podeGerenciarOperadores={false}
          activeDropdownFichaId={null}
          setActiveDropdownFichaId={() => {}}
        />
      ))}
    </div>
  );
}
