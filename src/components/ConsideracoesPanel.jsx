import React from 'react'

export default function ConsideracoesPanel({ ficha, onUpdateHeader, onUpdateFotoData }) {
  const { fotoData } = ficha;
  
  if (!fotoData) return null;

  const handleVerificacaoChange = (index, field, value) => {
    const novasVerif = [...fotoData.verificacoes];
    novasVerif[index] = { ...novasVerif[index], [field]: value };
    onUpdateFotoData({ verificacoes: novasVerif });
  };

  return (
    <div className="info-section bg-card card-glow" style={{ padding: '20px', borderRadius: '12px' }}>
      <h2 style={{ color: 'var(--blue-light)', marginBottom: '16px', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>📋</span> Considerações e Verificações
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="field">
          <label className="text-xs font-bold text-muted uppercase">Nome do Equipamento / Título</label>
          <input
            type="text"
            value={ficha.nomeEquipamento || ''}
            onChange={e => onUpdateHeader('nomeEquipamento', e.target.value)}
            placeholder="Ex: Transformador T1"
            style={{ width: '100%', padding: '10px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)' }}
          />
        </div>
        <div className="field">
          <label className="text-xs font-bold text-muted uppercase">Cliente (Referência)</label>
          <input
            type="text"
            value={ficha.cliente || ''}
            onChange={e => onUpdateHeader('cliente', e.target.value)}
            placeholder="Ex: ADCOS"
            style={{ width: '100%', padding: '10px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      <div className="table-responsive-container" style={{ marginBottom: '24px', border: '1px solid var(--border)', borderRadius: '8px', overflowX: 'auto' }}>
        <table className="verificacoes-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr>
              <th className="th-item" style={{ background: 'var(--blue-glow)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '10px 12px', color: 'var(--text-primary)', fontSize: '11px', fontWeight: 700 }}>ÍTENS DE VERIFICAÇÃO</th>
              <th className="th-img" style={{ background: 'var(--blue-glow)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '10px', width: '80px', textAlign: 'center', color: 'var(--text-primary)', fontSize: '11px', fontWeight: 700 }}>IMG</th>
              <th className="th-status" style={{ background: 'var(--blue-glow)', borderBottom: '1px solid var(--border)', padding: '10px', width: '100px', textAlign: 'center', color: 'var(--text-primary)', fontSize: '11px', fontWeight: 700 }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {(fotoData.verificacoes || []).map((v, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0', borderRight: '1px solid var(--border)' }}>
                  <input
                    type="text"
                    value={v.descricao}
                    onChange={e => handleVerificacaoChange(i, 'descricao', e.target.value)}
                    placeholder="Descrição..."
                    style={{ width: '100%', padding: '10px', border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none', fontSize: '13px' }}
                  />
                </td>
                <td style={{ padding: '0', borderRight: '1px solid var(--border)' }}>
                  <input
                    type="text"
                    value={v.imagemRef}
                    onChange={e => handleVerificacaoChange(i, 'imagemRef', e.target.value)}
                    placeholder="Ref"
                    style={{ width: '100%', padding: '10px', border: 'none', background: 'transparent', textAlign: 'center', color: 'var(--text-primary)', outline: 'none', fontSize: '13px' }}
                  />
                </td>
                <td style={{ padding: '0' }}>
                  <input
                    type="text"
                    value={v.status}
                    onChange={e => handleVerificacaoChange(i, 'status', e.target.value)}
                    placeholder="OK/..."
                    style={{ width: '100%', padding: '10px', border: 'none', background: 'transparent', textAlign: 'center', color: 'var(--text-primary)', outline: 'none', fontSize: '13px' }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label className="text-xs font-bold text-muted uppercase mb-2 block">Observações (Também aparece na capa)</label>
        <textarea
          value={ficha.observacoes || ''}
          onChange={e => onUpdateHeader('observacoes', e.target.value)}
          rows="4"
          style={{ width: '100%', padding: '12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', resize: 'vertical' }}
          placeholder="Anotações gerais..."
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '16px' }}>
        <div className="field">
          <label className="text-xs font-bold text-muted uppercase">Responsável Técnico</label>
          <input
            type="text"
            value={fotoData.responsavelTecnico || ''}
            onChange={e => onUpdateFotoData({ responsavelTecnico: e.target.value })}
            style={{ width: '100%', padding: '10px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)' }}
          />
        </div>
        <div className="field">
          <label className="text-xs font-bold text-muted uppercase">Data / Hora de Início</label>
          <input
            type="text"
            value={fotoData.dataHoraInicio || ''}
            onChange={e => onUpdateFotoData({ dataHoraInicio: e.target.value })}
            placeholder="Ex: 21/08/2023 | 07:00h"
            style={{ width: '100%', padding: '10px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)' }}
          />
        </div>
      </div>
    </div>
  )
}
