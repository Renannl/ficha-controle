import { useState, useEffect, useMemo } from "react";
import { ROLES } from "../../data/users";
import PhotoBank from "../PhotoBank";
import Dashboard from "../Dashboard";
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

import { Moon, Sun, Settings, LogOut, Plus, ClipboardList } from "lucide-react";

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
      <div className="user-bar">
        <div className="user-info">
          <div className="user-avatar">
            {(user?.nome || "?")[0].toUpperCase()}
          </div>
          <div>
            <div className="user-name">{user?.nome || "Usuário"}</div>
            <div className="user-role">
              {user?.role ? ROLES[user.role] : ""}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="logout-btn" onClick={onToggleTheme}>
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {user?.role === "admin" && (
            <button className="logout-btn" onClick={onOpenAdmin}>
              <Settings size={18} />
            </button>
          )}

          <button className="logout-btn" onClick={onLogout}>
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* HEADER */}
      <div className="home-header">
        <div className="home-brand">
          <img src="/ip.png" alt="Logo" className="home-logo-img" />
          <h1>Ficha de Controle</h1>
        </div>

        <div className="home-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{stats.emAndamento}</div>
            <div className="stat-label">Em Andamento</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{stats.concluidas}</div>
            <div className="stat-label">Concluídas</div>
          </div>
        </div>
      </div>

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
      {viewMode === "dashboard" ? (
        <div style={{ padding: "16px", paddingBottom: "100px" }}>
          <Dashboard fichas={fichas} user={user} onApprove={onApprove} />
        </div>
      ) : viewMode === "gallery" ? (
        <PhotoBank fichas={fichas} />
      ) : (
        <>
          {/* Lista */}
          {fichas.length === 0 && !showNewMenu ? (
            <div className="home-empty" style={{ paddingBottom: 120 }}>
              <div className="empty-icon">
                <ClipboardList size={42} strokeWidth={1.8} />
              </div>

              <p>Nenhuma ficha criada ainda. Toque no botão + para começar.</p>
            </div>
          ) : (
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
                    onOpen={onOpen}
                    onDelete={handleDelete}
                    onToggleOperador={handleToggleOperadorFicha}
                    podeGerenciarOperadores={podeGerenciarOperadores}
                    activeDropdownFichaId={activeDropdownFichaId}
                    setActiveDropdownFichaId={setActiveDropdownFichaId}
                  />
                ))
              )}
            </div>
          )}
        </>
      )}

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
