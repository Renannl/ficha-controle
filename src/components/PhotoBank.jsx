import React, { useState, useEffect } from 'react';

export default function PhotoBank({ fichas }) {
  const [selectedFichaId, setSelectedFichaId] = useState(() => localStorage.getItem('photoBankSelectedId') || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  // Filtra apenas fichas que possuem pelo menos uma foto
  const fichasWithPhotos = fichas.filter(f => {
    const hasPhotos = f.items.some(item => item.foto);
    if (!hasPhotos) return false;

    const term = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
                         (f.nomeEquipamento || '').toLowerCase().includes(term) ||
                         (f.id || '').toLowerCase().includes(term) ||
                         (f.cliente || '').toLowerCase().includes(term);
    return matchesSearch;
  });

  if (selectedFichaId) {
    const ficha = fichas.find(f => f.id === selectedFichaId);
    const photos = ficha.items.filter(i => i.foto);

    return (
      <div className="photo-bank-detail animate-fadeIn">
        <div className="flex items-center gap-3 mb-4">
          <button className="btn-icon" onClick={() => setSelectedFichaId(null)}>←</button>
          <div>
            <h3 className="text-lg font-bold">{ficha.nomeEquipamento || 'Sem Nome'}</h3>
            <p className="text-xs text-muted">Exibindo {photos.length} fotos · {ficha.cliente}</p>
          </div>
        </div>

        <div className="photo-bank-grid">
          {photos.map((item, idx) => (
            <div key={idx} className="photo-bank-card card-glow">
              <div className="photo-bank-img-wrap">
                <img src={item.foto} alt={item.descricao} />
                <a 
                  href={item.foto} 
                  download={`FOTO_${ficha.codigo}_${idx+1}.jpg`}
                  className="photo-download-btn"
                  onClick={e => e.stopPropagation()}
                >
                  📥
                </a>
              </div>
              <div className="photo-bank-info">
                <span className="photo-bank-id">{item.id}</span>
                <span className="photo-bank-desc">{item.descricao || 'Sem descrição'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="photo-bank-list animate-fadeIn" style={{ padding: '0 16px 100px' }}>
      {fichasWithPhotos.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {!showSearch && <div className="home-list-title" style={{ marginBottom: 0 }}>Álbuns de Fotos</div>}
              
              <div className={`search-container ${showSearch ? 'active' : ''}`}>
                <button 
                  className="search-toggle-btn" 
                  onClick={() => {
                    setShowSearch(!showSearch)
                    if (showSearch) setSearchTerm('')
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
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                )}
              </div>
            </div>
          </div>

          <div className="photo-album-grid">
            {fichasWithPhotos.map(ficha => {
              const photoCount = ficha.items.filter(i => i.foto).length;
              const coverPhoto = ficha.items.find(i => i.foto)?.foto;

              return (
                <div 
                  key={ficha.id} 
                  className="photo-album-card" 
                  onClick={() => setSelectedFichaId(ficha.id)}
                >
                  <div className="album-cover">
                    {coverPhoto ? (
                      <img src={coverPhoto} alt="Cover" />
                    ) : (
                      <div className="album-placeholder">📸</div>
                    )}
                    <div className="album-badge">{photoCount} fotos</div>
                  </div>
                  <div className="album-info">
                    <div className="album-title">{ficha.nomeEquipamento || 'Sem Nome'}</div>
                    <div className="album-sub">{ficha.cliente} · {new Date(ficha.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="home-empty" style={{ paddingTop: '100px', paddingBottom: '160px' }}>
          <div className="empty-icon">🖼️</div>
          <p>Nenhuma foto enviada ainda. Toque no botão + para começar um relatório fotográfico.</p>
        </div>
      )}
    </div>
  );
}
