import HomeFilters from "./HomeFilters";
import FichaCard from "./FichaCard";

export default function HomeList({
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
}) {
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
        <div
          className="text-center py-12 opacity-60 text-sm card-glow-none"
          style={{
            padding: "20px 20px",
            background: "var(--bg-card)",
            borderRadius: "var(--radius-md)",
          }}
        >
          Nenhuma ficha encontrada para estes filtros.
        </div>
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
