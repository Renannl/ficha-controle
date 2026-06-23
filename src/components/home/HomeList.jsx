import HomeFilters from "./HomeFilters";
import FichaCard from "./FichaCard";
import { useNavigate } from "react-router-dom";

export default function HomeList(props) {
  const navigate = useNavigate();
  const {
    mode = "fichas",
    colecoes = [],
    fichas = [],
    filteredFichas,
    showSearch,
    setShowSearch,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,
    user,
    listaUsuarios,
    onOpen,
    onDelete,
    onToggleOperador,
    podeGerenciarOperadores,
    activeDropdownFichaId,
    setActiveDropdownFichaId,
    selectedFichas,
    toggleFichaSelection,
  } = props;

  if (mode === "colecoes") {
    return (
      <div className="home-list animate-scaleIn">
        <HomeFilters
          showSearch={showSearch}
          setShowSearch={setShowSearch}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterType={filterType}
          setFilterType={setFilterType}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />

        <div className="colecoes-grid">
          {colecoes.map((colecao) => {
            const preview = fichas
              .filter((f) => f.colecao_id === colecao.id)
              .slice(0, 3);

            return (
              <div
                key={colecao.id}
                className="colecao-card"
                onClick={() => navigate(`/colecao/${colecao.id}`)}
              >
                <h3>{colecao.cliente}</h3>

                <p>{colecao.codigo_proposta}</p>

                <div className="colecao-preview">
                  {preview.map((ficha) => (
                    <div key={ficha.id} className="preview-ficha">
                      {ficha.codigo}
                    </div>
                  ))}
                </div>

                <small>
                  {fichas.filter((f) => f.colecao_id === colecao.id).length}{" "}
                  fichas
                </small>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="home-list animate-scaleIn">
      <HomeFilters
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      {filteredFichas.length === 0 ? (
        <div> Nenhuma ficha encontrada </div>
      ) : (
        filteredFichas.map((ficha, i) => (
          <FichaCard
            key={ficha.id}
            ficha={ficha}
            index={i}
            user={user}
            listaUsuarios={listaUsuarios}
            selected={selectedFichas.includes(ficha.id)}
            selectionOrder={selectedFichas.indexOf(ficha.id) + 1}
            onToggleSelection={toggleFichaSelection}
            onOpen={onOpen}
            onDelete={onDelete}
            onToggleOperador={onToggleOperador}
            podeGerenciarOperadores={podeGerenciarOperadores}
            activeDropdownFichaId={activeDropdownFichaId}
            setActiveDropdownFichaId={setActiveDropdownFichaId}
          />
        ))
      )}
    </div>
  );
}
