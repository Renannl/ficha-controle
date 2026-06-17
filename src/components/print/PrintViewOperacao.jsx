import { Fragment } from "react";
import PrintHeader from "./PrintHeader";
import { OPERACOES, NOTA_DOCUMENTOS } from "../../data/fichaTemplate";

export default function PrintViewOperacao({ ficha, isBook = false }) {
  const op = OPERACOES[ficha.operacao];

  return (
    <div className={`print-view-root ${isBook ? "book-mode" : "print-only"}`}>
      {/* CABEÇALHO DA FICHA */}
      <PrintHeader ficha={ficha} />

      {/* DADOS DO EQUIPAMENTO */}
      <div className="print-section-title">DADOS DO EQUIPAMENTO</div>
      <table className="print-info-table">
        <tbody>
          <tr>
            <td colSpan="2">
              <strong>Nome do Equipamento:</strong> {ficha.nomeEquipamento}
            </td>
            <td>
              <strong>Nº do Ind.:</strong> {ficha.nrInd}
            </td>
            <td>
              <strong>QTD:</strong> {ficha.qtd}
            </td>
          </tr>
          <tr>
            <td>
              <strong>Obra:</strong> {ficha.obra}
            </td>
            <td>
              <strong>TAG:</strong> {ficha.tag}
            </td>
            <td colSpan="2">
              <strong>Cliente:</strong> {ficha.cliente}
            </td>
          </tr>
        </tbody>
      </table>

      {/* PLANEJAMENTO */}
      <div className="print-section-title">PLANEJAMENTO</div>
      <table className="print-info-table">
        <tbody>
          <tr>
            <td colSpan="2">
              <strong>Operação:</strong> {op?.label || "Operação não definida"}
            </td>
            <td colSpan="2">
              <strong>Equipe:</strong> {op?.equipe || "—"}
            </td>
          </tr>
          <tr>
            <td>
              <strong>Data Início:</strong> {ficha.dataInicio}
            </td>
            <td>
              <strong>Data Término:</strong> {ficha.dataTermino}
            </td>
            <td>
              <strong>Tempo Previsto:</strong> {ficha.tempoPrevisto}
            </td>
            <td>
              <strong>Recurso:</strong> {ficha.recurso}
            </td>
          </tr>
          <tr>
            <td colSpan="4">
              <strong>Colaboradores:</strong> {ficha.colaboradores}
            </td>
          </tr>
        </tbody>
      </table>

      {/* CHECKLIST TABLE */}
      <div className="print-checklist-container">
        <table className="print-checklist-table">
          <thead>
            <tr className="main-header">
              <th rowSpan="2" className="col-it">
                IT
              </th>
              <th rowSpan="2" className="col-desc">
                DESCRIÇÃO
              </th>
              <th colSpan="15" className="col-sessions">
                SESSÕES DE TRABALHO
              </th>
              <th colSpan="2" className="col-result">
                OK/NA
              </th>
            </tr>
            <tr className="session-header">
              {[...Array(15)].map((_, i) => (
                <th key={i} className="mark-cell">
                  {i + 1}º
                </th>
              ))}
              <th className="res-cell">OK</th>
              <th className="res-cell">NA</th>
            </tr>
          </thead>
          <tbody>
            {op?.items.map((item, idx) => {
              const fichaItem = ficha.items[idx] || {
                sessionMarks: [],
                resultado: "",
              };
              // Garante exatamente 15 células — sem isso a tabela desalinha
              const marks = Array(15)
                .fill("")
                .map((_, i) => fichaItem.sessionMarks[i] || "");
              return (
                <tr key={item.id}>
                  <td className="text-center">{item.id}</td>
                  <td className="item-desc">{item.descricao}</td>
                  {marks.map((mark, i) => (
                    <td key={i} className="text-center mark-cell">
                      {mark === "feito" ? "✓" : mark === "na" ? "—" : ""}
                    </td>
                  ))}
                  <td className="text-center res-mark">
                    {fichaItem.resultado === "ok" ? "X" : ""}
                  </td>
                  <td className="text-center res-mark">
                    {fichaItem.resultado === "na" ? "X" : ""}
                  </td>
                </tr>
              );
            })}
            <tr className="goal-row">
              <td colSpan="2">
                <strong>Objetivo:</strong> {op?.objetivo}
              </td>
              {/* 15 sessões + OK + NA = 17 células restantes */}
              <td colSpan="17"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* SESSÕES DETALHADAS */}
      <div className="print-section-title">
        REGISTRO DE SESSÕES (DATA/HORÁRIO)
      </div>
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
          {[0, 1, 2, 3, 4].map((row) => (
            <tr key={row}>
              {[0, 5, 10].map((col) => {
                const s = ficha.sessions[row + col];
                return (
                  <Fragment key={col}>
                    <td className="bg-muted">{s.numero}</td>
                    <td>{s.data}</td>
                    <td>{s.hIni}</td>
                    <td>{s.hFim}</td>
                  </Fragment>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* OBSERVAÇÕES */}
      <div className="print-section-title">OBSERVAÇÕES</div>
      <div className="print-notes">
        {ficha.observacoes || "Nenhuma observação registrada."}
      </div>

      {/* DOCUMENTOS ADICIONAIS */}
      <div className="print-docs-note">
        <strong>Nota:</strong> {NOTA_DOCUMENTOS}
      </div>

      {/* ALTERAÇÕES FEITAS (SE APLICÁVEL) */}
      {ficha.alteracoesFeitas && (
        <div style={{ marginTop: "10px" }}>
          <div className="print-section-title">
            ALTERAÇÕES FEITAS APÓS FINALIZAÇÃO
          </div>
          <div className="print-notes">{ficha.alteracoesFeitas}</div>
        </div>
      )}

      {/* ASSINATURAS */}
      <table
        className="print-signatures-table"
        style={{
          width: "100%",
          marginTop: "10px",
          tableLayout: "fixed",
          borderCollapse: "collapse",
        }}
      >
        <tbody>
          <tr>
            {ficha.operacao !== "50" && (
              <td
                className="sig-box"
                style={{ width: "33.33%", padding: "5px", overflow: "hidden" }}
              >
                <div className="sig-line">
                  {ficha.assinaturas.producao.dataUrl ? (
                    <img
                      src={ficha.assinaturas.producao.dataUrl}
                      alt="Assinatura"
                    />
                  ) : (
                    <div style={{ height: "35px" }}></div>
                  )}
                </div>

                <div className="sig-label">Produção</div>

                <div className="sig-name">
                  {ficha.assinaturas.producao.nome || "____________________"}
                </div>

                <div className="sig-date">
                  Data: {ficha.assinaturas.producao.data || "__/__/____"}
                </div>
              </td>
            )}
            <td
              className="sig-box"
              style={{ width: "33.33%", padding: "5px", overflow: "hidden" }}
            >
              <div className="sig-line">
                {ficha.assinaturas.tecnico.dataUrl ? (
                  <img
                    src={ficha.assinaturas.tecnico.dataUrl}
                    alt="Assinatura"
                  />
                ) : (
                  <div style={{ height: "35px" }}></div>
                )}
              </div>
              <div className="sig-label">Técnico Responsável</div>
              <div className="sig-name">
                {ficha.assinaturas.tecnico.nome || "____________________"}
              </div>
              <div className="sig-date">
                Data: {ficha.assinaturas.tecnico.data || "__/__/____"}
              </div>
            </td>
            <td
              className="sig-box"
              style={{ width: "33.33%", padding: "5px", overflow: "hidden" }}
            >
              <div className="sig-line">
                {ficha.assinaturas.supervisor.dataUrl ? (
                  <img
                    src={ficha.assinaturas.supervisor.dataUrl}
                    alt="Assinatura"
                  />
                ) : (
                  <div style={{ height: "35px" }}></div>
                )}
              </div>
              <div className="sig-label">Supervisor IndusPower</div>
              <div className="sig-name">
                {ficha.assinaturas.supervisor.nome || "____________________"}
              </div>
              <div className="sig-date">
                Data: {ficha.assinaturas.supervisor.data || "__/__/____"}
              </div>
            </td>
            <td
              className="sig-box"
              style={{ width: "33.33%", padding: "5px", overflow: "hidden" }}
            >
              <div className="sig-line">
                {ficha.assinaturas.qualidade.dataUrl ? (
                  <img
                    src={ficha.assinaturas.qualidade.dataUrl}
                    alt="Assinatura"
                  />
                ) : (
                  <div style={{ height: "35px" }}></div>
                )}
              </div>
              <div className="sig-label">Qualidade</div>
              <div className="sig-name">
                {ficha.assinaturas.qualidade.nome || "____________________"}
              </div>
              <div className="sig-date">
                Data: {ficha.assinaturas.qualidade.data || "__/__/____"}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
