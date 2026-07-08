import { useState } from "react";
import PhotoBankSearch from "./PhotoBankSearch";
import PhotoAlbumCard from "./PhotoAlbumCard";

export default function PhotoBankList({ fichas, onOpenAlbum }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const allFichasWithPhotos = fichas.filter(
    (f) => (f.fotoData?.fotos?.length ?? 0) > 0,
  );

  const fichasWithPhotos = allFichasWithPhotos.filter((f) => {
    const term = searchTerm.toLowerCase();
    return (
      !searchTerm ||
      (f.nomeEquipamento || "").toLowerCase().includes(term) ||
      (f.id || "").toLowerCase().includes(term) ||
      (f.cliente || "").toLowerCase().includes(term)
    );
  });

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {!showSearch && (
            <div className="home-list-title" style={{ marginBottom: 0 }}>
              Álbuns de Fotos
            </div>
          )}
          <PhotoBankSearch
            showSearch={showSearch}
            setShowSearch={setShowSearch}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </div>
      </div>

      <div className="photo-album-grid">
        {fichasWithPhotos.length > 0 ? (
          fichasWithPhotos.map((ficha) => (
            <PhotoAlbumCard
              key={ficha.id}
              ficha={ficha}
              onClick={() => onOpenAlbum(ficha.id)}
            />
          ))
        ) : (
          <div
            className="text-center py-12 opacity-60 text-sm card-glow-none"
            style={{
              background: "var(--bg-card)",
              borderRadius: "var(--radius-md)",
              padding: "50px 20px",
              textAlign: "center",
              fontSize: "15px",
            }}
          >
            Nenhum álbum encontrado.
          </div>
        )}
      </div>
    </>
  );
}
