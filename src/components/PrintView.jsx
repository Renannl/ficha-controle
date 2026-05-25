import { Fragment } from 'react'
import { OPERACOES, NOTA_DOCUMENTOS, INSTRUMENTOS_TAF } from '../data/fichaTemplate'

export default function PrintView({ ficha }) {
  const op = OPERACOES[ficha.operacao]

  if (ficha.tafData) {
    return <PrintViewTaf ficha={ficha} op={op} />
  }

  if (ficha.operacao === '80') {
    return <PrintViewFotos ficha={ficha} />
  }

  return (
    <div id="print-view-root" className="print-only">
      {/* CABEÇALHO DA FICHA */}
      <table className="print-header-table">
        <tbody>
          <tr>
            <td rowSpan="3" className="logo-cell">
              <div className="brand-name">IndusPower</div>
            </td>
            <td colSpan="3" className="title-cell">
              <h1>FICHA DE CONTROLE DE OPERAÇÃO</h1>
            </td>
          </tr>
          <tr>
            <td className="info-cell"><strong>Código:</strong> {ficha.codigo}</td>
            <td className="info-cell"><strong>Folha:</strong> {ficha.folha}</td>
            <td className="info-cell"><strong>Revisão:</strong> {ficha.revisao}</td>
          </tr>
        </tbody>
      </table>

      {/* DADOS DO EQUIPAMENTO */}
      <div className="print-section-title">DADOS DO EQUIPAMENTO</div>
      <table className="print-info-table">
        <tbody>
          <tr>
            <td colSpan="2"><strong>Nome do Equipamento:</strong> {ficha.nomeEquipamento}</td>
            <td><strong>Nº do Ind.:</strong> {ficha.nrInd}</td>
            <td><strong>QTD:</strong> {ficha.qtd}</td>
          </tr>
          <tr>
            <td><strong>Obra:</strong> {ficha.obra}</td>
            <td><strong>TAG:</strong> {ficha.tag}</td>
            <td colSpan="2"><strong>Cliente:</strong> {ficha.cliente}</td>
          </tr>
        </tbody>
      </table>

      {/* PLANEJAMENTO */}
      <div className="print-section-title">PLANEJAMENTO</div>
      <table className="print-info-table">
        <tbody>
          <tr>
            <td colSpan="2"><strong>Operação:</strong> {op?.label || 'Operação não definida'}</td>
            <td colSpan="2"><strong>Equipe:</strong> {op?.equipe || '—'}</td>
          </tr>
          <tr>
            <td><strong>Data Início:</strong> {ficha.dataInicio}</td>
            <td><strong>Data Término:</strong> {ficha.dataTermino}</td>
            <td><strong>Tempo Previsto:</strong> {ficha.tempoPrevisto}</td>
            <td><strong>Recurso:</strong> {ficha.recurso}</td>
          </tr>
          <tr>
            <td colSpan="4"><strong>Colaboradores:</strong> {ficha.colaboradores}</td>
          </tr>
        </tbody>
      </table>

      {/* CHECKLIST TABLE */}
      <div className="print-checklist-container">
        <table className="print-checklist-table">
          <thead>
            <tr className="main-header">
              <th rowSpan="2" className="col-it">IT</th>
              <th rowSpan="2" className="col-desc">DESCRIÇÃO</th>
              <th colSpan="15" className="col-sessions">SESSÕES DE TRABALHO</th>
              <th colSpan="2" className="col-result">OK/NA</th>
            </tr>
            <tr className="session-header">
              {[...Array(15)].map((_, i) => (
                <th key={i} className="mark-cell">{i + 1}º</th>
              ))}
              <th className="res-cell">OK</th>
              <th className="res-cell">NA</th>
            </tr>
          </thead>
          <tbody>
            {op?.items.map((item, idx) => {
              const fichaItem = ficha.items[idx] || { sessionMarks: [], resultado: '' }
              // Garante exatamente 15 células — sem isso a tabela desalinha
              const marks = Array(15).fill('').map((_, i) => fichaItem.sessionMarks[i] || '')
              return (
                <tr key={item.id}>
                  <td className="text-center">{item.id}</td>
                  <td className="item-desc">{item.descricao}</td>
                  {marks.map((mark, i) => (
                    <td key={i} className="text-center mark-cell">
                      {mark === 'feito' ? '✓' : mark === 'na' ? '—' : ''}
                    </td>
                  ))}
                  <td className="text-center res-mark">{fichaItem.resultado === 'ok' ? 'X' : ''}</td>
                  <td className="text-center res-mark">{fichaItem.resultado === 'na' ? 'X' : ''}</td>
                </tr>
              )
            })}
            <tr className="goal-row">
              <td colSpan="2"><strong>Objetivo:</strong> {op?.objetivo}</td>
              {/* 15 sessões + OK + NA = 17 células restantes */}
              <td colSpan="17"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* SESSÕES DETALHADAS */}
      <div className="print-section-title">REGISTRO DE SESSÕES (DATA/HORÁRIO)</div>
      <table className="print-sessions-table">
        <thead>
          <tr>
            <th>SES</th>
            <th>DATA</th>
            <th>H. INI</th>
            <th>H. FIM</th>
            <th>SES</th>
            <th>DATA</th>
            <th>H. INI</th>
            <th>H. FIM</th>
            <th>SES</th>
            <th>DATA</th>
            <th>H. INI</th>
            <th>H. FIM</th>
          </tr>
        </thead>
        <tbody>
          {[0, 1, 2, 3, 4].map(row => (
            <tr key={row}>
              {[0, 5, 10].map(col => {
                const s = ficha.sessions[row + col]
                return (
                  <Fragment key={col}>
                    <td className="bg-muted">{s.numero}</td>
                    <td>{s.data}</td>
                    <td>{s.hIni}</td>
                    <td>{s.hFim}</td>
                  </Fragment>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* OBSERVAÇÕES */}
      <div className="print-section-title">OBSERVAÇÕES</div>
      <div className="print-notes">
        {ficha.observacoes || 'Nenhuma observação registrada.'}
      </div>

      {/* DOCUMENTOS ADICIONAIS */}
      <div className="print-docs-note">
        <strong>Nota:</strong> {NOTA_DOCUMENTOS}
      </div>

      {/* ALTERAÇÕES FEITAS (SE APLICÁVEL) */}
      {ficha.alteracoesFeitas && (
        <div style={{ marginTop: '10px' }}>
          <div className="print-section-title">ALTERAÇÕES FEITAS APÓS FINALIZAÇÃO</div>
          <div className="print-notes">
            {ficha.alteracoesFeitas}
          </div>
        </div>
      )}

      {/* ASSINATURAS */}
      <table className="print-signatures-table" style={{ width: '100%', marginTop: '10px', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
          {ficha.operacao !== '50' && (
            <td className="sig-box" style={{ width: '33.33%', padding: '5px', overflow: 'hidden' }}>
              <div className="sig-line">
                {ficha.assinaturas.producao.dataUrl ? (
                  <img src={ficha.assinaturas.producao.dataUrl} alt="Assinatura" />
                ) : (
                  <div style={{ height: '35px' }}></div>
                )}
              </div>

              <div className="sig-label">Produção</div>

              <div className="sig-name">
                {ficha.assinaturas.producao.nome || '____________________'}
              </div>

              <div className="sig-date">
                Data: {ficha.assinaturas.producao.data || '__/__/____'}
              </div>
            </td>
          )}
            <td className="sig-box" style={{ width: '33.33%', padding: '5px', overflow: 'hidden' }}>
              <div className="sig-line">
                {ficha.assinaturas.tecnico.dataUrl ? <img src={ficha.assinaturas.tecnico.dataUrl} alt="Assinatura" /> : <div style={{ height: '35px' }}></div>}
              </div>
              <div className="sig-label">Técnico Responsável</div>
              <div className="sig-name">{ficha.assinaturas.tecnico.nome || '____________________'}</div>
              <div className="sig-date">Data: {ficha.assinaturas.tecnico.data || '__/__/____'}</div>
            </td>
            <td className="sig-box" style={{ width: '33.33%', padding: '5px', overflow: 'hidden' }}>
              <div className="sig-line">
                {ficha.assinaturas.supervisor.dataUrl ? <img src={ficha.assinaturas.supervisor.dataUrl} alt="Assinatura" /> : <div style={{ height: '35px' }}></div>}
              </div>
              <div className="sig-label">Supervisor IndusPower</div>
              <div className="sig-name">{ficha.assinaturas.supervisor.nome || '____________________'}</div>
              <div className="sig-date">Data: {ficha.assinaturas.supervisor.data || '__/__/____'}</div>
            </td>
            <td className="sig-box" style={{ width: '33.33%', padding: '5px', overflow: 'hidden' }}>
              <div className="sig-line">
                {ficha.assinaturas.qualidade.dataUrl ? <img src={ficha.assinaturas.qualidade.dataUrl} alt="Assinatura" /> : <div style={{ height: '35px' }}></div>}
              </div>
              <div className="sig-label">Qualidade</div>
              <div className="sig-name">{ficha.assinaturas.qualidade.nome || '____________________'}</div>
              <div className="sig-date">Data: {ficha.assinaturas.qualidade.data || '__/__/____'}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function PrintViewTaf({ ficha, op }) {
  const { tafData } = ficha
  return (
    <div id="print-view-root" className="print-only taf-pdf">
      {/* HEADER TAF */}
      <div className="taf-pdf-header">
        <div className="taf-pdf-logo">
          <div className="brand">IndusPower <br /><span>Powering Solutions</span></div>
        </div>
        <div className="taf-pdf-title">
          <h1>FORMULÁRIO</h1>
          <p>Versão 1.3</p>
        </div>
        <div className="taf-pdf-id">
          ( ID: <span>{ficha.id.slice(0, 8).toUpperCase()}</span> )
        </div>
      </div>

      {/* TEST EXECUTION TYPE */}
      <table className="taf-pdf-table compact no-border">
        <tbody>
          <tr>
            <td className="w-50 border">
              <div className="flex items-center gap-2">
                <div className={`check-box ${tafData.testExecutedWithClient ? 'checked' : ''}`}></div>
                TESTE EXECUTADO COM O CLIENTE
              </div>
            </td>
            <td className="w-50 border">
              <div className="flex items-center gap-2">
                <div className={`check-box ${tafData.testExecutedWithoutClient ? 'checked' : ''}`}></div>
                TESTE EXECUTADO SEM O CLIENTE
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* DADOS GERAIS */}
      <table className="taf-pdf-table" style={{ tableLayout: 'fixed', width: '100%' }}>
        <tbody>
          <tr>
            <td colSpan="2" className="w-66"><strong>Nome do quadro/painel:</strong> {ficha.nomeEquipamento || '____________________'}</td>
            <td colSpan="1" className="w-33"><strong>Identificador:</strong> {tafData.identificador || '____________________'}</td>
          </tr>
          <tr>
            <td className="w-33"><strong>IND:</strong> {ficha.nrInd || '____________________'}</td>
            <td className="w-33"><strong>TAG:</strong> {ficha.tag || '____________________'}</td>
            <td className="w-33"><strong>Tensão:</strong> {tafData.tensao || '____________________'}</td>
          </tr>
          <tr>
            <td className="w-33"><strong>Obra:</strong> {ficha.obra || '____________________'}</td>
            <td className="w-33"><strong>Cubículo:</strong> {tafData.cubiculo || '____________________'}</td>
            <td className="w-33"><strong>Cliente:</strong> {ficha.cliente || '____________________'}</td>
          </tr>
          <tr>
            <td colSpan="2" className="w-66"><strong>Testadores:</strong> {tafData.testadores || '____________________'}</td>
            <td colSpan="1" className="w-33"><strong>Data do teste:</strong> {tafData.dataTeste || '__/__/____'}</td>
          </tr>
          <tr>
            <td className="w-33"><strong>Prazo de entrega:</strong> {tafData.prazoEntrega || '__/__/____'}</td>
            <td className="w-33"><strong>Quem fez a proposta:</strong> {tafData.quemFezProposta || '____________________'}</td>
            <td className="w-33"><strong>Data de fechamento:</strong> {tafData.dataFechamentoProposta || '__/__/____'}</td>
          </tr>
        </tbody>
      </table>

      {/* EQUIPAMENTOS */}
      <div className="taf-pdf-section-header">EQUIPAMENTOS UTILIZADOS NOS ENSAIOS</div>
      <table className="taf-pdf-table">
        <tbody>
          {(() => {
            const selecionados = (tafData.instrumentosSelecionados || [])
              .map(id => INSTRUMENTOS_TAF.find(i => i.id === id))
              .filter(Boolean)
            
            const rows = []
            for (let i = 0; i < selecionados.length; i += 2) {
              rows.push(selecionados.slice(i, i + 2))
            }

            if (rows.length === 0) {
              return <tr><td colSpan="2" className="opacity-50" style={{ textAlign: 'center' }}>Nenhum equipamento selecionado.</td></tr>
            }

            return rows.map((row, idx) => (
              <tr key={idx}>
                <td className="w-50">{row[0] ? `${row[0].nome} (Série: ${row[0].serie})` : ''}</td>
                <td className="w-50">{row[1] ? `${row[1].nome} (Série: ${row[1].serie})` : ''}</td>
              </tr>
            ))
          })()}
        </tbody>
      </table>

      {/* MEGGER TABLE */}
      <div className="taf-pdf-section-header flex justify-between items-center">
        <span>TESTE DE ISOLAÇÃO MEGGER - CIRCUITO PRINCIPAL</span>
        <div className="flex gap-4 font-normal text-[10px] items-center">
          <div className="flex items-center gap-1">
            <div className={`check-box ${!tafData.isNotApplicable ? 'checked' : ''}`}></div> APLICÁVEL
          </div>
          <div className="flex items-center gap-1">
            <div className={`check-box ${tafData.isNotApplicable ? 'checked' : ''}`}></div> NÃO APLICÁVEL
          </div>
        </div>
      </div>
      <div className="taf-pdf-megger-grid">
        <div className="megger-rows">
          <div className="megger-cell">FASE R x S: <span>{tafData.megger?.rs}</span></div>
          <div className="megger-cell">FASE S x T: <span>{tafData.megger?.st}</span></div>
          <div className="megger-cell">FASE R x T: <span>{tafData.megger?.rt}</span></div>
          <div className="megger-cell">FASE R x N: <span>{tafData.megger?.rn}</span></div>
          <div className="megger-cell">FASE S x N: <span>{tafData.megger?.sn}</span></div>
          <div className="megger-cell">FASE T x N: <span>{tafData.megger?.tn}</span></div>
          <div className="megger-cell">FASE R x GND: <span>{tafData.megger?.rgnd}</span></div>
          <div className="megger-cell">FASE S x GND: <span>{tafData.megger?.sgnd}</span></div>
          <div className="megger-cell">FASE T x GND: <span>{tafData.megger?.tgnd}</span></div>
          <div className="megger-cell">N x GND: <span>{tafData.megger?.ngnd}</span></div>
          <div className="megger-cell full">TENSÃO APLICADA: <span>{tafData.megger?.tensaoAplicada}</span></div>
        </div>
      </div>

      {/* HI-POT */}
      <div className="taf-pdf-section-header flex justify-between items-center">
        <span>TESTE DE HI-POT - CIRCUITO PRINCIPAL</span>
        <div className="flex gap-4 font-normal text-[10px] items-center">
          <div className="flex items-center gap-1">
            <div className={`check-box ${!tafData.hiPotNotApplicable ? 'checked' : ''}`}></div> APLICÁVEL
          </div>
          <div className="flex items-center gap-1">
            <div className={`check-box ${tafData.hiPotNotApplicable ? 'checked' : ''}`}></div> NÃO APLICÁVEL
          </div>
        </div>
      </div>
      <table className="taf-pdf-table">
        <tbody>
          <tr>
            <td>TENSÃO APLICADA: <strong>{tafData.hiPot?.tensaoAplicada}</strong></td>
            <td>CORRENTE DE FUGA R: <strong>{tafData.hiPot?.leakageR}</strong></td>
          </tr>
          <tr>
            <td>CORRENTE DE FUGA S: <strong>{tafData.hiPot?.leakageS}</strong></td>
            <td>CORRENTE DE FUGA T: <strong>{tafData.hiPot?.leakageT}</strong></td>
          </tr>
        </tbody>
      </table>

      {/* CHECKLIST */}
      <div className="taf-pdf-section-header flex justify-between items-center">
        <span>TESTES FUNCIONAIS E VISUAIS</span>
        <div className="flex gap-4 font-normal text-[10px] items-center">
          <div className="flex items-center gap-1">
            <div className={`check-box ${!tafData.functionalNotApplicable ? 'checked' : ''}`}></div> APLICÁVEL
          </div>
          <div className="flex items-center gap-1">
            <div className={`check-box ${tafData.functionalNotApplicable ? 'checked' : ''}`}></div> NÃO APLICÁVEL
          </div>
        </div>
      </div>
      <table className="taf-pdf-checklist">
        <thead>
          <tr>
            <th className="text-left p-left">ÍTEM DE INSPEÇÃO</th>
            <th className="w-10">NC</th>
            <th className="w-10">C</th>
          </tr>
        </thead>
        <tbody>
          {op.items.map((item, idx) => {
            const res = ficha.items[idx]?.resultado
            return (
              <tr key={item.id}>
                <td className="p-left">&gt;&gt; {item.descricao}</td>
                <td className="text-center">{res === 'na' ? 'X' : ''}</td>
                <td className="text-center">{res === 'ok' ? 'X' : ''}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="taf-pdf-section-header">OBSERVAÇÕES FINAIS</div>
      <div className="taf-pdf-notes">{ficha.observacoes || 'Sem observações.'}</div>

      {/* ALTERAÇÕES FEITAS (SE APLICÁVEL) */}
      {ficha.alteracoesFeitas && (
        <div style={{ marginTop: '10px' }}>
          <div className="taf-pdf-section-header">ALTERAÇÕES FEITAS APÓS FINALIZAÇÃO</div>
          <div className="taf-pdf-notes">{ficha.alteracoesFeitas}</div>
        </div>
      )}

      {/* SIGNATURES */}
      <table className="taf-pdf-signatures-table" style={{ width: '100%', marginTop: '20px', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td className="taf-sig-box" style={{ width: '33.33%', padding: '5px', overflow: 'hidden' }}>
              <div className="sig-line">
                {ficha.assinaturas.tecnico.dataUrl ? <img src={ficha.assinaturas.tecnico.dataUrl} alt="Assinatura" /> : <div style={{ height: '70px' }}></div>}
              </div>
              <p>TÉCNICO</p>
            </td>
            <td className="taf-sig-box" style={{ width: '33.33%', padding: '5px', overflow: 'hidden' }}>
              <div className="sig-line">
                {ficha.assinaturas.supervisor.dataUrl ? <img src={ficha.assinaturas.supervisor.dataUrl} alt="Assinatura" /> : <div style={{ height: '70px' }}></div>}
              </div>
              <p>SUPERVISOR</p>
            </td>
            <td className="taf-sig-box" style={{ width: '33.33%', padding: '5px', overflow: 'hidden' }}>
              <div className="sig-line">
                {ficha.assinaturas.qualidade.dataUrl ? <img src={ficha.assinaturas.qualidade.dataUrl} alt="Assinatura" /> : <div style={{ height: '70px' }}></div>}
              </div>
              <p>RESP. QUALIDADE</p>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="taf-pdf-footer">
        Rua Idalino Carvalho S/N (Condomínio LOGMEX) – Parque Industrial - Viana/ES - CEP: 29.136-519<br />
      </div>
    </div>
  )
}

function PrintViewFotos({ ficha }) {
  const bySession = {};
  (ficha.items || []).forEach(item => {
    if (!item) return;
    const s = item.sessao || ficha.nomeEquipamento || 'GERAL';
    if (!bySession[s]) bySession[s] = [];
    bySession[s].push(item);
  });

  const pages = [];
  Object.entries(bySession).forEach(([sessaoName, sItems]) => {
    for (let i = 0; i < sItems.length; i += 6) {
      pages.push({
        sessaoName,
        items: sItems.slice(i, i + 6)
      });
    }
  });

  return (
    <div id="print-view-root" className="print-only fotos-pdf">
      {/* PRIMEIRA PÁGINA: CONSIDERAÇÕES */}
      <div style={{ marginBottom: '20mm', pageBreakAfter: 'always' }}>
        <div className="fotos-pdf-header">
          <div className="fotos-pdf-logo">
            <div className="fotos-pdf-brand">IndusPower</div>
            <div className="fotos-pdf-sub">Powering Solutions</div>
          </div>
          <div className="fotos-pdf-title" style={{ flexDirection: 'column', padding: '10px' }}>
             <div>RELATÓRIO FOTOGRÁFICO</div>
             <div>CONSIDERAÇÕES {ficha.cliente ? ficha.cliente.toUpperCase() : ''}</div>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000', fontSize: '11px', marginTop: '4px' }}>
          <thead>
            <tr>
              <th style={{ background: '#fff2cc', border: '1.5px solid #000', padding: '6px' }}></th>
              <th rowSpan="2" style={{ background: '#e2f0d9', border: '1.5px solid #000', padding: '6px', width: '20%', textAlign: 'center' }}>IMAGEM</th>
              <th rowSpan="2" style={{ background: '#e2f0d9', border: '1.5px solid #000', padding: '6px', width: '20%', textAlign: 'center' }}>STATUS DA VERIFICAÇÃO</th>
            </tr>
            <tr>
              <th style={{ background: '#e2f0d9', border: '1.5px solid #000', padding: '6px', textAlign: 'center' }}>ÍTENS DE VERIFICAÇÃO</th>
            </tr>
          </thead>
          <tbody>
            {(ficha.fotoData?.verificacoes || []).map((v, i) => (
              <tr key={i}>
                 <td style={{ border: '1.5px solid #000', padding: '6px', height: '22px' }}>{v.descricao}</td>
                 <td style={{ border: '1.5px solid #000', padding: '6px', textAlign: 'center', height: '22px' }}>{v.imagemRef}</td>
                 <td style={{ border: '1.5px solid #000', padding: '6px', textAlign: 'center', height: '22px' }}>{v.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div style={{ border: '1.5px solid #000', borderTop: 'none', padding: '6px', minHeight: '120px' }}>
           <strong>Observações:</strong>
           <div style={{ whiteSpace: 'pre-wrap', marginTop: '4px', fontSize: '12px' }}>{ficha.observacoes}</div>
        </div>

        <div style={{ display: 'flex', border: '1.5px solid #000', borderTop: 'none', fontSize: '12px' }}>
           <div style={{ flex: 1, padding: '6px', borderRight: '1.5px solid #000' }}>
              <strong>RESPONSÁVEL TÉCNICO:</strong> {ficha.fotoData?.responsavelTecnico}
           </div>
           <div style={{ width: '250px', display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
              <div style={{ padding: '2px', borderBottom: '1px solid #000', fontWeight: 'bold' }}>DATA / HORA DE INÍCIO</div>
              <div style={{ padding: '2px' }}>{ficha.fotoData?.dataHoraInicio}</div>
           </div>
        </div>
      </div>

      {pages.map((page, pageIdx) => {
        let title = "RELATÓRIO FOTOGRÁFICO";
        if (page.sessaoName && page.sessaoName !== 'GERAL') {
          title += ` - ${page.sessaoName.toUpperCase()}`;
        }
        
        const sessionClass = page.sessaoName ? `session-${page.sessaoName.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : '';

        return (
          <div key={pageIdx} className={`fotos-section-page ${pageIdx > 0 ? "page-break" : ""} ${sessionClass}`} style={{ marginBottom: '20mm' }}>
            <div className="fotos-pdf-header">
              <div className="fotos-pdf-logo">
                <div className="fotos-pdf-brand">IndusPower</div>
                <div className="fotos-pdf-sub">Powering Solutions</div>
              </div>
              <div className="fotos-pdf-title">
                {title}
              </div>
              <div className="fotos-pdf-right">
                {ficha.cliente || ''}
              </div>
            </div>

            <div className="fotos-grid">
              {page.items.map(item => (
                <div key={item.id} className="foto-frame">
                  <div className="foto-frame-header">
                    <div className="foto-id">{item.id}</div>
                    <div className="foto-desc">{item.descricao || '—'}</div>
                  </div>
                  <div className="foto-content">
                    {item.foto ? (
                      <img src={item.foto} alt={`Foto ${item.id}`} />
                    ) : (
                       <div className="foto-empty">[ SEM FOTO ]</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
