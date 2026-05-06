import React from 'react'
import { INSTRUMENTOS_TAF } from '../data/fichaTemplate'

export default function TafPanel({ ficha, onUpdate }) {
  if (!ficha.tafData) return null

  const { tafData } = ficha

  const handleChange = (path, value) => {
    const keys = path.split('.')
    const newData = { ...tafData }
    let current = newData
    for (let i = 0; i < keys.length - 1; i++) {
       current = current[keys[i]]
    }
    current[keys[keys.length - 1]] = value
    onUpdate({ tafData: newData })
  }

  const toggleInstrumento = (id) => {
    const atual = tafData.instrumentosSelecionados || []
    const novaLista = atual.includes(id)
      ? atual.filter(x => x !== id)
      : [...atual, id]
    onUpdate({ tafData: { ...tafData, instrumentosSelecionados: novaLista } })
  }

  const renderMeggerRow = (label, path) => (
    <div className="taf-input-group">
      <label>{label}</label>
      <input 
        type="text" 
        value={tafData.megger?.[path] || ''} 
        onChange={e => handleChange(`megger.${path}`, e.target.value)}
        placeholder="MΩ"
      />
    </div>
  )

  const renderHiPotRow = (label, path) => (
    <div className="taf-input-group">
      <label>{label}</label>
      <input 
        type="text" 
        value={tafData.hiPot?.[path] || ''} 
        onChange={e => handleChange(`hiPot.${path}`, e.target.value)}
        placeholder="mA / kV"
      />
    </div>
  )

  return (
    <div className="taf-panel animate-fadeIn">
      <div className="card-header-simple">
        <h2>Relatório de Ensaios TAF</h2>
        <p>Versão 1.3</p>
      </div>

      <div className="taf-grid">
        <div className="taf-check-options">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={tafData.testExecutedWithClient} 
              onChange={e => handleChange('testExecutedWithClient', e.target.checked)}
            />
            <span>Executado COM o cliente</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={tafData.testExecutedWithoutClient} 
              onChange={e => handleChange('testExecutedWithoutClient', e.target.checked)}
            />
            <span>Executado SEM o cliente</span>
          </label>
        </div>

        <div className="taf-form-row">
          <div className="taf-input-group">
            <label>Nome do Quadro/Painel</label>
            <input type="text" value={ficha.nomeEquipamento || ''} onChange={e => onUpdate({ nomeEquipamento: e.target.value })} />
          </div>
          <div className="taf-input-group">
            <label>Identificador</label>
            <input type="text" value={tafData.identificador || ''} onChange={e => handleChange('identificador', e.target.value)} />
          </div>
        </div>

        <div className="taf-form-row">
          <div className="taf-input-group">
            <label>IND</label>
            <input type="text" value={ficha.nrInd || ''} onChange={e => onUpdate({ nrInd: e.target.value })} />
          </div>
          <div className="taf-input-group">
            <label>Tag do Produto</label>
            <input type="text" value={ficha.tag || ''} onChange={e => onUpdate({ tag: e.target.value })} />
          </div>
        </div>

        <div className="taf-form-row">
          <div className="taf-input-group">
            <label>Tensão</label>
            <input type="text" value={tafData.tensao || ''} onChange={e => handleChange('tensao', e.target.value)} />
          </div>
          <div className="taf-input-group">
            <label>Obra</label>
            <input type="text" value={ficha.obra || ''} onChange={e => onUpdate({ obra: e.target.value })} />
          </div>
        </div>

        <div className="taf-form-row">
          <div className="taf-input-group">
            <label>Cubículo</label>
            <input type="text" value={tafData.cubiculo || ''} onChange={e => handleChange('cubiculo', e.target.value)} />
          </div>
          <div className="taf-input-group">
            <label>Cliente</label>
            <input type="text" value={ficha.cliente || ''} onChange={e => onUpdate({ cliente: e.target.value })} />
          </div>
        </div>

        <div className="taf-form-row">
           <div className="taf-input-group">
            <label>Testadores</label>
            <input type="text" value={tafData.testadores || ''} onChange={e => handleChange('testadores', e.target.value)} />
          </div>
          <div className="taf-input-group">
            <label>Data do Teste</label>
            <input type="date" value={tafData.dataTeste || ''} onChange={e => handleChange('dataTeste', e.target.value)} />
          </div>
        </div>

        <div className="taf-form-row">
          <div className="taf-input-group">
            <label>Prazo de Entrega</label>
            <input type="date" value={tafData.prazoEntrega || ''} onChange={e => handleChange('prazoEntrega', e.target.value)} />
          </div>
          <div className="taf-input-group">
            <label>Quem fez a Proposta</label>
            <input type="text" value={tafData.quemFezProposta || ''} onChange={e => handleChange('quemFezProposta', e.target.value)} />
          </div>
        </div>

        <div className="taf-form-row">
          <div className="taf-input-group">
            <label>Data de Fechamento da Proposta</label>
            <input type="date" value={tafData.dataFechamentoProposta || ''} onChange={e => handleChange('dataFechamentoProposta', e.target.value)} />
          </div>
          <div className="taf-input-group">
            {/* Espaçador vazio para manter o grid alinhado ou outro campo se necessário */}
          </div>
        </div>
      </div>

      <div className="taf-section-title">EQUIPAMENTOS UTILIZADOS</div>
      <div className="taf-equipamentos-selector">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4">
          {INSTRUMENTOS_TAF.map(inst => (
            <label key={inst.id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg cursor-pointer hover:border-blue transition-colors">
              <input 
                type="checkbox" 
                checked={(tafData.instrumentosSelecionados || []).includes(inst.id)}
                onChange={() => toggleInstrumento(inst.id)}
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold">{inst.nome}</span>
                <span className="text-[10px] opacity-60">Nº Série: {inst.serie}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="taf-section-title flex justify-between items-center">
        <span>TESTE DE ISOLAÇÃO MEGGER (CIRCUITO PRINCIPAL)</span>
        <div className="flex gap-4">
          <label className="flex items-center gap-1 font-bold text-[10px] cursor-pointer">
            <input type="checkbox" checked={!tafData.isNotApplicable} onChange={e => handleChange('isNotApplicable', !e.target.checked)} /> Aplicável
          </label>
          <label className="flex items-center gap-1 font-bold text-[10px] cursor-pointer">
            <input type="checkbox" checked={tafData.isNotApplicable} onChange={e => handleChange('isNotApplicable', e.target.checked)} /> Não Aplicável
          </label>
        </div>
      </div>
      <div className="megger-table">
        {renderMeggerRow('FASE R x S', 'rs')}
        {renderMeggerRow('FASE S x T', 'st')}
        {renderMeggerRow('FASE R x T', 'rt')}
        {renderMeggerRow('FASE R x N', 'rn')}
        {renderMeggerRow('FASE S x N', 'sn')}
        {renderMeggerRow('FASE T x N', 'tn')}
        {renderMeggerRow('FASE R x GND', 'rgnd')}
        {renderMeggerRow('FASE S x GND', 'sgnd')}
        {renderMeggerRow('FASE T x GND', 'tgnd')}
        {renderMeggerRow('N x GND', 'ngnd')}
        <div className="taf-input-group span-2">
          <label>TENSÃO APLICADA</label>
          <input type="text" value={tafData.megger?.tensaoAplicada || ''} onChange={e => handleChange('megger.tensaoAplicada', e.target.value)} />
        </div>
      </div>

      <div className="taf-section-title flex justify-between items-center">
        <span>TESTE DE HI-POT (CIRCUITO PRINCIPAL)</span>
        <div className="flex gap-4">
          <label className="flex items-center gap-1 font-bold text-[10px] cursor-pointer">
            <input type="checkbox" checked={!tafData.hiPotNotApplicable} onChange={e => handleChange('hiPotNotApplicable', !e.target.checked)} /> Aplicável
          </label>
          <label className="flex items-center gap-1 font-bold text-[10px] cursor-pointer">
            <input type="checkbox" checked={tafData.hiPotNotApplicable} onChange={e => handleChange('hiPotNotApplicable', e.target.checked)} /> Não Aplicável
          </label>
        </div>
      </div>
      <div className="megger-table">
        {renderHiPotRow('TENSÃO APLICADA', 'tensaoAplicada')}
        {renderHiPotRow('CORRENTE FUGA R', 'leakageR')}
        {renderHiPotRow('CORRENTE FUGA S', 'leakageS')}
        {renderHiPotRow('CORRENTE FUGA T', 'leakageT')}
      </div>

      <div className="taf-section-title">OBSERVAÇÕES FINAIS</div>
      <div className="taf-input-group" style={{ padding: '0 16px' }}>
        <textarea 
          style={{ width: '100%', minHeight: '80px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px', color: 'var(--text-primary)', fontFamily: 'inherit' }}
          value={ficha.observacoes} 
          onChange={e => onUpdate({ observacoes: e.target.value })}
          placeholder="Registre aqui qualquer detalhe relevante dos ensaios..."
        />
      </div>
    </div>
  )
}
