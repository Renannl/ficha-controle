import Dashboard from "../dashboard/Dashboard";
import PhotoBank from "../photobank/PhotoBank";
import HomeEmptyState from "./HomeEmptyState";
import HomeList from "./HomeList";

export default function HomeContent({
  viewMode,
  fichas,
  user,
  onApprove,
  showNewMenu,

  filteredFichas,

  showSearch,
  setShowSearch,
  searchTerm,
  setSearchTerm,

  filterType,
  setFilterType,

  filterStatus,
  setFilterStatus,

  listaUsuarios,

  onOpen,
  onDelete,

  onToggleOperador,
  podeGerenciarOperadores,

  activeDropdownFichaId,
  setActiveDropdownFichaId,
}) {
  if (viewMode === "dashboard") {
    return (
      <div style={{ padding: "16px", paddingBottom: "100px" }}>
        <Dashboard fichas={fichas} user={user} onApprove={onApprove} />
      </div>
    );
  }

  if (viewMode === "gallery") {
    return <PhotoBank fichas={fichas} />;
  }

  if (fichas.length === 0 && !showNewMenu) {
    return <HomeEmptyState />;
  }

  return (
    <HomeList
      filteredFichas={filteredFichas}
      showSearch={showSearch}
      setShowSearch={setShowSearch}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      filterType={filterType}
      setFilterType={setFilterType}
      filterStatus={filterStatus}
      setFilterStatus={setFilterStatus}
      user={user}
      listaUsuarios={listaUsuarios}
      onOpen={onOpen}
      onDelete={onDelete}
      onToggleOperador={onToggleOperador}
      podeGerenciarOperadores={podeGerenciarOperadores}
      activeDropdownFichaId={activeDropdownFichaId}
      setActiveDropdownFichaId={setActiveDropdownFichaId}
    />
  );
}
