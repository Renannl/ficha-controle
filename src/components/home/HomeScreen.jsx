import { useState, useEffect, useMemo } from "react";
import ConfirmModal from "../ConfirmModal";
import FichaCard from "./FichaCard";
import { useFichasFilter } from "../../hooks/useFichasFilter";
import { useLocalStorageState } from "../../hooks/useLocalStorageState";
import { useViewModeDrag } from "../../hooks/useViewModeDrag";
import { useOperators } from "../../hooks/useOperators";
import { canManageOperators } from "../../utils/operators";
import { getAvailableOperations } from "../../utils/operations";
import HomeFilters from "./HomeFilters";
import NewFichaMenu from "./NewFichaMenu";
import HomeViewToggle from "./HomeViewToggle";
import HomeHeader from "./HomeHeader";
import HomeEmptyState from "./HomeEmptyState";
import { Plus } from "lucide-react";
import HomeList from "./HomeList";
import HomeContent from "./HomeContent";

export default function HomeScreen({
  fichas,
  onNova,
  onOpen,
  onDelete,
  user,
  onLogout,
  theme,
  onToggleTheme,
  onOpenAdmin,
  onApprove,
  listaUsuarios = [],
  onAtualizarOperadores,
}) {
  // STATE

  const [viewMode, setViewMode] = useLocalStorageState("homeViewMode", "list");

  const [showNewMenu, setShowNewMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [activeDropdownFichaId, setActiveDropdownFichaId] = useState(null);

  // PERMISSIONS
  const podeGerenciar = canManageOperators(user);

  // HOOKS
  const { toggleRef, handleTouchStart, handleTouchMove, handleTouchEnd } =
    useViewModeDrag(setViewMode);

  const { handleToggleOperadorFicha, podeGerenciarOperadores } = useOperators({
    user,
    onAtualizarOperadores,
    podeGerenciar,
  });

  // LOCAL STORAGE SYNC
  const [filterStatus, setFilterStatus] = useLocalStorageState(
    "homeFilterStatus",
    "all",
  );

  const [filterType, setFilterType] = useLocalStorageState(
    "homeFilterType",
    "all",
  );

  useEffect(() => {
    const validStatus = new Set([
      "all",
      "progress",
      "done",
      "waiting",
      "approved",
      "rejected",
      "empty",
    ]);

    const validTypes = new Set(["all", "taf", "controle", "foto"]);

    if (!validStatus.has(filterStatus)) {
      setFilterStatus("all");
    }

    if (!validTypes.has(filterType)) {
      setFilterType("all");
    }
  }, [filterStatus, filterType, setFilterStatus, setFilterType]);

  // DATA
  const availableOps = useMemo(() => getAvailableOperations(user), [user]);

  const { filteredFichas, stats } = useFichasFilter({
    fichas,
    filterStatus,
    filterType,
    searchTerm,
  });

  // ACTIONS
  function handleDelete(e, id) {
    e.stopPropagation();
    setDeleteId(id);
  }

  const confirmDelete = () => {
    if (!deleteId) return;
    onDelete(deleteId);
    setDeleteId(null);
  };

  const handleCreateNew = (code) => {
    setShowNewMenu(false);
    onNova(code);
  };

  // RENDER
  return (
    <div className="home">
      <div className="home-bg-decoration">
        <div className="login-bg-circle login-bg-circle-1" />
        <div className="login-bg-circle login-bg-circle-2" />
        <div className="login-bg-circle login-bg-circle-3" />
      </div>

      {/* USER BAR */}
      <HomeHeader
        user={user}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onOpenAdmin={onOpenAdmin}
        onLogout={onLogout}
        stats={stats}
      />

      {/* VIEW TOGGLE */}
      <HomeViewToggle
        viewMode={viewMode}
        setViewMode={setViewMode}
        toggleRef={toggleRef}
        handleTouchStart={handleTouchStart}
        handleTouchMove={handleTouchMove}
        handleTouchEnd={handleTouchEnd}
      />

      {/* CONTENT */}
      <HomeContent
        viewMode={viewMode}
        fichas={fichas}
        user={user}
        onApprove={onApprove}
        showNewMenu={showNewMenu}
        filteredFichas={filteredFichas}
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        listaUsuarios={listaUsuarios}
        onOpen={onOpen}
        onDelete={handleDelete}
        onToggleOperador={handleToggleOperadorFicha}
        podeGerenciarOperadores={podeGerenciarOperadores}
        activeDropdownFichaId={activeDropdownFichaId}
        setActiveDropdownFichaId={setActiveDropdownFichaId}
      />

      {/* MODAL */}
      <ConfirmModal
        isOpen={!!deleteId}
        title="Excluir Ficha?"
        message="Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* FAB */}
      <button className="fab" onClick={() => setShowNewMenu(true)}>
        <Plus size={26} />
      </button>

      <NewFichaMenu
        show={showNewMenu}
        onClose={() => setShowNewMenu(false)}
        availableOps={availableOps}
        onCreate={handleCreateNew}
      />
    </div>
  );
}
