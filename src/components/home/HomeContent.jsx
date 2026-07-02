import Dashboard from "../dashboard/Dashboard";
import PhotoBank from "../photobank/PhotoBank";
import HomeEmptyState from "./HomeEmptyState";
import HomeList from "./HomeList";

export default function HomeContent({
  viewMode,
  fichas,
  fichasDaColecao,
  user,
  onApprove,
  showNewMenu,
  filteredFichas,
  mode = "colecoes",
  colecoes = [],
  showSearch,
  setShowSearch,
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterStatus,
  setFilterStatus,
  listaUsuarios, // ← sem default aqui
  onOpen,
  onDelete,
  onToggleOperador,
  podeGerenciarOperadores,
  activeDropdownFichaId,
  setActiveDropdownFichaId,
  selectedFichas,
  toggleFichaSelection,
  onOpenColecao,
}) {
  // ✅ Garante array mesmo se vier null/undefined/objeto
  const usuarios = Array.isArray(listaUsuarios) ? listaUsuarios : [];

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

  if (mode === "colecoes") {
    return (
      <HomeList
        mode="colecoes"
        colecoes={colecoes}
        fichas={fichas}
        filteredFichas={[]}
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onOpenColecao={onOpenColecao}
        user={user}
        listaUsuarios={usuarios}
      />
    );
  }

  if (fichasDaColecao.length === 0 && !showNewMenu) {
    return <HomeEmptyState />;
  }

  return (
    <HomeList
      mode="fichas"
      colecoes={colecoes}
      fichas={fichasDaColecao}
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
      listaUsuarios={usuarios}
      onOpen={onOpen}
      onDelete={onDelete}
      onToggleOperador={onToggleOperador}
      podeGerenciarOperadores={podeGerenciarOperadores}
      activeDropdownFichaId={activeDropdownFichaId}
      setActiveDropdownFichaId={setActiveDropdownFichaId}
      selectedFichas={selectedFichas}
      toggleFichaSelection={toggleFichaSelection}
      onOpenColecao={onOpenColecao}
    />
  );
}
