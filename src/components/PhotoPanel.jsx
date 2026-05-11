import React from 'react';
import { uploadFoto } from '../services/uploadService'

export default function PhotoPanel({ ficha, items, onUpdate }) {
  const handlePhotoUpload = async (idx, file) => {
  if (!file) return;

  try {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = async () => {
        const canvas = document.createElement('canvas');

        let { width, height } = img;

        const maxSize = 600;

        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(async (blob) => {
          if (!blob) return;

          const compressedFile = new File(
            [blob],
            file.name,
            { type: 'image/jpeg' }
          );

          const url = await uploadFoto(
            compressedFile,
            ficha
          );

          if (!url) {
            alert('Erro ao enviar foto');
            return;
          }

          onUpdate(idx, 'foto', url);
        }, 'image/jpeg', 0.6);
      };

      img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
  } catch (err) {
    console.error(err);
    alert('Erro ao processar imagem');
  }
};

  const removePhoto = (idx) => {
    if (confirm('Remover esta foto?')) {
      onUpdate(idx, 'foto', '');
    }
  };

  return (
    <div className="photo-panel bg-card card-glow" style={{ padding: '16px', borderRadius: '12px' }}>
      <h2 style={{ color: 'var(--blue-light)', marginBottom: '16px', fontSize: '20px' }}>Relatório Fotográfico</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', flex: 1, margin: 0 }}>
          Tire fotos direto da câmera com seu celular ou carregue imagens da galeria. Você pode modificar a descrição de cada foto, se necessário.
        </p>
        <label style={{ 
          cursor: 'pointer', background: 'var(--blue-glow)', color: 'var(--blue-primary)', padding: '8px 16px', 
          borderRadius: '8px', fontSize: '12px', fontWeight: '700', border: '1px solid var(--blue-accent)',
          display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', whiteSpace: 'nowrap'
        }}>
          <span>📂</span> Carregar Vários Arquivos
          <input 
            type="file" 
            accept="image/*" 
            multiple 
            style={{ display: 'none' }} 
            onChange={(e) => {
              const files = Array.from(e.target.files);
              let slotIdx = 0;
              files.forEach(file => {
                // Encontra o próximo slot vazio
                while (slotIdx < items.length && items[slotIdx].foto) {
                  slotIdx++;
                }
                if (slotIdx < items.length) {
                  handlePhotoUpload(slotIdx, file);
                  slotIdx++;
                }
              });
            }} 
          />
        </label>
      </div>
      
      <div className="photo-grid" style={{
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
        gap: '16px'
      }}>
        {items.map((item, idx) => (
          <div key={item.id} className="photo-card" style={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px'
          }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ 
                background: 'var(--blue)', color: '#fff', borderRadius: '4px', width: '24px', height: '24px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold' 
              }}>
                {item.id}
              </span>
              <input
                type="text"
                value={item.descricao || ''}
                onChange={(e) => onUpdate(idx, 'descricao', e.target.value)}
                style={{ 
                  flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', 
                  padding: '6px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase'
                }}
                placeholder="Descrição da foto"
              />
            </div>
            
            {item.foto ? (
              <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <img src={item.foto} alt="Evidência" style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#000' }} />
                <button onClick={() => removePhoto(idx)} style={{ 
                  position: 'absolute', top: 8, right: 8, background: 'rgba(255,0,0,0.85)', color: '#fff', 
                  border: '1px solid #ff4444', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'
                }}>
                  Remover
                </button>
              </div>
            ) : (
              <div style={{ 
                width: '100%', aspectRatio: '1/1', border: '2px dashed var(--border)', borderRadius: '6px', 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', background: 'var(--bg-card)' 
              }}>
                <div style={{ fontSize: '32px', opacity: 0.5, marginBottom: '4px' }}>📸</div>
                <label style={{ 
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <div style={{ 
                    background: 'var(--blue)', color: '#fff', padding: '10px 24px', 
                    borderRadius: '8px', fontSize: '13px', fontWeight: '700', transition: 'all 0.2s', 
                    boxShadow: '0 4px 12px rgba(0, 163, 255, 0.3)',
                    textAlign: 'center'
                  }}>
                    Tirar / Carregar Foto
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600', opacity: 0.8 }}>
                    Câmera ou Galeria de Arquivos
                  </span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={(e) => handlePhotoUpload(idx, e.target.files[0])} 
                  />
                </label>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
