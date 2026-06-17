import { useState, useMemo, useEffect } from "react";
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
import HomeList from "./HomeList";
import HomeContent from "./HomeContent";
import HomeFab from "./HomeFab";
import { useHomeFilters } from "../../hooks/useHomeFilters";
import BookPrintView from "../print/BookPrintView";
import { exportBook } from "../../services/sharepointService";

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
  const [bookFichas, setBookFichas] = useState([]);
  const [selectedFichas, setSelectedFichas] = useState([]);

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

  useEffect(() => {
    const handler = async (e) => {
      setBookFichas(e.detail);

      setTimeout(async () => {
        await exportBook();
      }, 1000);
    };

    window.addEventListener("abrir-book-pdf", handler);

    return () => window.removeEventListener("abrir-book-pdf", handler);
  }, []);

  // LOCAL STORAGE SYNC
  const { filterStatus, setFilterStatus, filterType, setFilterType } =
    useHomeFilters();

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

  const toggleFichaSelection = (id) => {
    setSelectedFichas((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
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
        selectedFichas={selectedFichas}
        toggleFichaSelection={toggleFichaSelection}
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

      {selectedFichas.length > 0 && (
        <button
          onClick={() => {
            const fichasBook = fichas.filter((f) =>
              selectedFichas.includes(f.id),
            );

            window.dispatchEvent(
              new CustomEvent("abrir-book-pdf", {
                detail: fichasBook,
              }),
            );
          }}
          style={{
            position: "fixed",
            bottom: "100px",
            right: "20px",
            zIndex: 999999,
            background: "#1565C0",
            color: "#fff",
            border: "none",
            padding: "12px 18px",
            borderRadius: "10px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Gerar Book PDF ({selectedFichas.length})
        </button>
      )}

      <div
        style={{
          position: "absolute",
          left: "-99999px",
          top: 0,
        }}
      >
        <BookPrintView fichas={bookFichas} />
      </div>

      {/* FAB */}
      <HomeFab onClick={() => setShowNewMenu(true)} />

      <NewFichaMenu
        show={showNewMenu}
        onClose={() => setShowNewMenu(false)}
        availableOps={availableOps}
        onCreate={handleCreateNew}
      />
    </div>
  );
}
