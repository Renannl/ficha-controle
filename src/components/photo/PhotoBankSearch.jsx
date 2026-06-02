import { Search, X } from "lucide-react";

export default function PhotoBankSearch({
  showSearch,
  setShowSearch,
  searchTerm,
  setSearchTerm,
}) {
  return (
    <div className="flex items-center gap-2">
      <div className={`search-container ${showSearch ? "active" : ""}`}>
        <button
          className="search-toggle-btn"
          onClick={() => {
            setShowSearch(!showSearch);

            if (showSearch) {
              setSearchTerm("");
            }
          }}
        >
          {showSearch ? <X size={18} /> : <Search size={18} />}
        </button>

        {showSearch && (
          <input
            className="search-input animate-slideInRight"
            type="text"
            placeholder="Buscar álbum..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        )}
      </div>
    </div>
  );
}
