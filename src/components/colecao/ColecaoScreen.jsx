// ColecaoScreen.jsx
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import FichaCard from "../home/FichaCard";

export default function ColecaoScreen({
  fichas,
  colecoes,
  user,
  listaUsuarios,
  onDelete,
  onNova, // ← adiciona essa prop no App.jsx também
}) {
  const { id } = useParams();
  const navigate = useNavigate();

  const colecao = colecoes.find((c) => String(c.id) === String(id));
  const fichasColecao = fichas.filter(
    (f) => String(f.colecao_id) === String(id)
  );

  function handleOpen(fichaId) {
    navigate(`/colecao/${id}/ficha/${fichaId}`);
  }

  return (
    <div className="home-list">
      {/* ── HEADER COM VOLTAR ── */}
      <div className="colecao-header">
        <button
          className="btn btn-ghost"
          onClick={() => navigate("/")}
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <ArrowLeft size={18} />
          Voltar
        </button>

        <div>
          <h2>{colecao?.cliente}</h2>
          <p>{colecao?.codigo_proposta}</p>
          {colecao?.descricao && <small>{colecao.descricao}</small>}
          <small>{fichasColecao.length} fichas</small>
        </div>

        {/* Botão para criar nova ficha dentro da coleção */}
        {onNova && (
          <button
            className="btn btn-primary"
            onClick={() => onNova("taf", id)} // ajuste o tipo padrão se quiser
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Plus size={18} />
            Nova Ficha
          </button>
        )}
      </div>

      {/* ── FICHAS ── */}
      {fichasColecao.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px", color: "var(--text-secondary)" }}>
          Nenhuma ficha nesta coleção ainda.
        </div>
      ) : (
        fichasColecao.map((ficha, index) => (
          <FichaCard
            key={ficha.dbId ?? ficha.id}
            ficha={ficha}
            index={index}
            user={user}
            listaUsuarios={listaUsuarios}
            onOpen={handleOpen}
            onDelete={onDelete}
            selected={false}
            selectionOrder={0}
            onToggleSelection={() => {}}
            onToggleOperador={() => {}}
            podeGerenciarOperadores={false}
            activeDropdownFichaId={null}
            setActiveDropdownFichaId={() => {}}
          />
        ))
      )}
    </div>
  );
}
