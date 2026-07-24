import HomeFilters from "./HomeFilters";
import FichaCard from "./FichaCard";
import { ImportarColecaoExcel } from "../../hooks/ImportarColecaoExcel";
import { FolderOpen, Plus, Calendar, Search, X, Trash2 } from "lucide-react"; // ✅ Trash2

export default function HomeList({
  mode = "fichas",
  colecoes = [],
  fichas = [],
  filteredFichas = [],
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
  onDeleteColecao,
  onToggleOperador,
  podeGerenciarOperadores,
  activeDropdownFichaId,
  setActiveDropdownFichaId,
  selectedFichas = [],
  toggleFichaSelection,
  onOpenColecao,
  onColecaoImportada,
}) {
  if (mode === "colecoes") {
    return (
      <div className="home-list animate-scaleIn">
        <div className="home-list-header">
          <div className="flex items-center gap-2">
            {!showSearch && (
              <h2 className="home-list-title" style={{ marginBottom: 0 }}>
                Coleções Recentes
              </h2>
            )}

            <div className={`search-container ${showSearch ? "active" : ""}`}>
              <button
                className="search-toggle-btn"
                onClick={() => {
                  setShowSearch((prev) => !prev);
                  if (showSearch) setSearchTerm("");
                }}
              >
                {showSearch ? <X size={18} /> : <Search size={18} />}
              </button>

              {showSearch && (
                <input
                  className="search-input animate-slideInRight"
                  type="text"
                  placeholder="Buscar coleção por cliente ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              )}

              {!showSearch && (
                <ImportarColecaoExcel
                  onImportado={(resultado) => {
                    onColecaoImportada?.(resultado); 
                  }}
                />
              )}
            </div>
          </div>
        </div>
        {colecoes.length === 0 ? (
          <div className="colecoes-empty">
            <p>Nenhuma coleção encontrada.</p>
            <small>Use o botão + para criar uma coleção para um cliente.</small>
          </div>
        ) : (
          <div className="colecoes-grid">
            {colecoes.map((col) => {
              const fichasDaCol = fichas.filter((f) => f.colecao_id === col.id);
              const preview = fichasDaCol.slice(0, 2);
              const resto = fichasDaCol.length - preview.length;

              const dataCriacao = col.created_at
                ? new Date(col.created_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : null;

              return (
                <div
                  key={col.id}
                  className="colecao-card"
                  onClick={() => onOpenColecao(col)}
                >
                  <div className="colecao-card-top">
                    <div className="colecao-card-icon">
                      <FolderOpen size={18} />
                    </div>
                    <div className="colecao-card-info">
                      <div className="colecao-card-title">
                        {col.cliente ?? "Sem nome"}
                      </div>
                      <div className="colecao-card-sub">
                        {col.descricao ?? "Sem descrição"}{" "}
                      </div>
                    </div>

                    {/* ✅ Badge + botão de excluir juntos, à direita */}
                    <div className="colecao-card-actions">
                      <div className="colecao-card-badge">
                        {fichasDaCol.length}{" "}
                        {fichasDaCol.length === 1 ? "ficha" : "fichas"}
                      </div>

                      {onDeleteColecao && (
                        <button
                          className="colecao-card-delete-btn"
                          title={
                            fichasDaCol.length > 0
                              ? "Não é possível excluir: coleção possui fichas"
                              : "Excluir coleção"
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteColecao(e, col.id);
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="colecao-preview">
                    {fichasDaCol.length === 0 ? (
                      <div className="colecao-card-empty">
                        <Plus size={13} /> Nenhuma ficha ainda
                      </div>
                    ) : (
                      <>
                        {preview.map((f) => (
                          <div key={f.dbId} className="preview-ficha">
                            {" "}
                            <span className="preview-ficha-dot" />
                            {f.nomeEquipamento ?? f.tipo ?? "Ficha"}
                          </div>
                        ))}
                        {resto > 0 && (
                          <div className="preview-ficha-more">
                            +{resto} ficha{resto > 1 ? "s" : ""}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {dataCriacao && (
                    <div className="colecao-card-date">
                      <Calendar size={11} />
                      Criada em {dataCriacao}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // MODO FICHAS — sem alterações
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
        <div className="fichas-empty">
          Nenhuma ficha encontrada nesta coleção.
        </div>
      ) : (
        filteredFichas.map((ficha, i) => (
          <FichaCard
            key={ficha.dbId}
            ficha={ficha}
            index={i}
            user={user}
            listaUsuarios={listaUsuarios}
            selected={selectedFichas.includes(ficha.dbId)}
            selectionOrder={selectedFichas.indexOf(ficha.dbId) + 1}
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
