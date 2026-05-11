import React, { useState } from 'react';

export default function PhotoBank({ fichas }) {
  const [selectedFichaId, setSelectedFichaId] = useState(
    () => localStorage.getItem('photoBankSelectedId') || null
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Todas as fichas que possuem fotos
  const allFichasWithPhotos = fichas.filter(f =>
    f.items?.some(item => item.foto)
  );

  // Filtro da busca
  const fichasWithPhotos = allFichasWithPhotos.filter(f => {
    const term = searchTerm.toLowerCase();

    return (
      !searchTerm ||
      (f.nomeEquipamento || '').toLowerCase().includes(term) ||
      (f.id || '').toLowerCase().includes(term) ||
      (f.cliente || '').toLowerCase().includes(term)
    );
  });

  // VISUALIZAÇÃO DO ÁLBUM
  if (selectedFichaId) {
    const ficha = fichas.find(f => f.id === selectedFichaId);

    if (!ficha) {
      setSelectedFichaId(null);
      return null;
    }

    const photos = ficha.items.filter(i => i.foto) || [];

    return (
      <div className="photo-bank-detail animate-fadeIn" style={{ padding: '20px 16px 100px' }}>
        <div className="flex items-center gap-3 mb-4">
          <button
            className="btn-icon"
            onClick={() => setSelectedFichaId(null)}
          >
            ←
          </button>

          <div>
            <h3 className="text-lg font-bold">
              {ficha.nomeEquipamento || 'Sem Nome'}
            </h3>

            <p className="text-xs text-muted">
              Exibindo {photos.length} fotos · {ficha.cliente}
            </p>
          </div>
        </div>

        <div className="photo-bank-grid" style={{marginLeft: "5px", marginRight: "5px"}}>
          {photos.map((item, idx) => (
            <div
              key={idx}
              className="photo-bank-card card-glow"
            >
              <div className="photo-bank-img-wrap">
                <img
                  src={item.foto}
                  alt={item.descricao}
                />

                <a
                  href={item.foto}
                  download={`FOTO_${ficha.codigo}_${idx + 1}.jpg`}
                  className="photo-download-btn"
                  onClick={e => e.stopPropagation()}
                >
                  📥
                </a>
              </div>

              <div className="photo-bank-info">
                <span className="photo-bank-id">
                  {item.id}
                </span>

                <span className="photo-bank-desc">
                  {item.descricao || 'Sem descrição'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // LISTA DE ÁLBUNS
  return (
    <div
      className="photo-bank-list animate-fadeIn"
      style={{ padding: '20px 16px 100px' }}
    >
      {allFichasWithPhotos.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {!showSearch && (
                <div
                  className="home-list-title"
                  style={{ marginBottom: 0 }}
                >
                  Álbuns de Fotos
                </div>
              )}

              <div
                className={`search-container ${
                  showSearch ? 'active' : ''
                }`}
              >
                <button
                  className="search-toggle-btn"
                  onClick={() => {
                    setShowSearch(!showSearch);

                    if (showSearch) {
                      setSearchTerm('');
                    }
                  }}
                >
                  {showSearch ? '✕' : '🔍'}
                </button>

                {showSearch && (
                  <input
                    className="search-input animate-slideInRight"
                    type="text"
                    placeholder="Buscar álbum..."
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(e.target.value)
                    }
                    autoFocus
                  />
                )}
              </div>
            </div>
          </div>

          <div className="photo-album-grid">
            {fichasWithPhotos.length > 0 ? (
              fichasWithPhotos.map(ficha => {
                const photoCount =
                  ficha.items.filter(i => i.foto).length || 0;

                const coverPhoto =
                  ficha.items.find(i => i.foto)?.foto;

                return (
                  <div
                    key={ficha.id}
                    className="photo-album-card"
                    onClick={() =>
                      setSelectedFichaId(ficha.id)
                    }
                  >
                    <div className="album-cover">
                      {coverPhoto ? (
                        <img
                          src={coverPhoto}
                          alt="Cover"
                        />
                      ) : (
                        <div className="album-placeholder">
                          📸
                        </div>
                      )}

                      <div className="album-badge">
                        {photoCount} fotos
                      </div>
                    </div>

                    <div className="album-info">
                      <div className="album-title">
                        {ficha.nomeEquipamento ||
                          'Sem Nome'}
                      </div>

                      <div className="album-sub">
                        {ficha.cliente} ·{' '}
                        {ficha.createdAt
                          ? new Date(
                              ficha.createdAt
                            ).toLocaleDateString()
                          : '--'}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 opacity-60 text-sm card-glow-none" style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', padding: '50px 20px', textAlign: 'center', fontSize: '15px'}}>
                Nenhum álbum encontrado.
              </div>
            )}
          </div>
        </>
      ) : (
        <div
          className="home-empty"
          style={{
            paddingTop: '100px',
            paddingBottom: '160px'
          }}
        >
          <div className="empty-icon">🖼️</div>

          <p>
            Nenhuma foto enviada ainda. Toque no botão +
            para começar um relatório fotográfico.
          </p>
        </div>
      )}
    </div>
  );
}