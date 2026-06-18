import React from "react";

export default function PrintViewFotos({ ficha, isBook = false }) {
  const fotos = ficha?.fotoData?.fotos || [];

  const verificacoes = ficha?.fotoData?.verificacoes || [];

  const responsavelTecnico = ficha?.fotoData?.responsavelTecnico || "";

  const dataHoraInicio = ficha?.fotoData?.dataHoraInicio || "";

  const pages = [];

  for (let i = 0; i < fotos.length; i += 6) {
    pages.push({
      items: fotos.slice(i, i + 6),
    });
  }
  return (
    <div
      className={
        isBook
          ? "print-view-root fotos-pdf"
          : "print-view-root print-only fotos-pdf"
      }
    >
      {/* PRIMEIRA PÁGINA: CONSIDERAÇÕES */}
      <div style={{ marginBottom: "20mm" }}>
        <div className={`fotos-section-page `}>
          <div className="fotos-pdf-header">
            <div className="fotos-pdf-logo">
              <div className="fotos-pdf-brand">IndusPower</div>
              <div className="fotos-pdf-sub">Powering Solutions</div>
            </div>
            <div className="fotos-pdf-title">RELATÓRIO FOTOGRÁFICO</div>
            <div className="fotos-pdf-right">CONSIDERAÇÕES:</div>
          </div>
        </div>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1.5px solid #000",
            fontSize: "11px",
            marginTop: "4px",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  background: "#e2f0d9",
                  border: "1.5px solid #000",
                  padding: "6px",
                }}
              >
                FOTO
              </th>

              <th
                style={{
                  background: "#e2f0d9",
                  border: "1.5px solid #000",
                  padding: "6px",
                }}
              >
                DESCRIÇÃO
              </th>
            </tr>
          </thead>

          <tbody>
            {fotos.map((foto, i) => (
              <tr key={foto.id}>
                <td
                  style={{
                    border: "1.5px solid #000",
                    padding: "6px",
                    width: "80px",
                    textAlign: "center",
                  }}
                >
                  FOTO {i + 1}
                </td>

                <td
                  style={{
                    border: "1.5px solid #000",
                    padding: "6px",
                  }}
                >
                  {foto.descricao || ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div
          style={{
            border: "1.5px solid #000",
            borderTop: "none",
            padding: "6px",
            minHeight: "120px",
          }}
        >
          <strong>Observações:</strong>
          <div
            style={{
              whiteSpace: "pre-wrap",
              marginTop: "4px",
              fontSize: "12px",
            }}
          >
            {ficha.observacoes}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            border: "1.5px solid #000",
            borderTop: "none",
            fontSize: "12px",
          }}
        >
          <div
            style={{ flex: 1, padding: "6px", borderRight: "1.5px solid #000" }}
          >
            <strong>RESPONSÁVEL TÉCNICO:</strong> {responsavelTecnico}
          </div>
          <div
            style={{
              width: "250px",
              display: "flex",
              flexDirection: "column",
              textAlign: "center",
            }}
          >
            <div
              style={{
                padding: "2px",
                borderBottom: "1px solid #000",
                fontWeight: "bold",
              }}
            >
              DATA / HORA DE INÍCIO
            </div>
            <div style={{ padding: "2px" }}>{dataHoraInicio}</div>
          </div>
        </div>
      </div>

      <div
        style={{
          pageBreakBefore: "always",
          breakBefore: "page",
        }}
      >
        {pages.map((page, pageIdx) => {
          const title = "RELATÓRIO FOTOGRÁFICO";

          return (
            <div
              key={pageIdx}
              className={`fotos-section-page ${pageIdx > 0 ? "page-break" : ""}`}
            >
              <div className="fotos-pdf-header">
                <div className="fotos-pdf-logo">
                  <div className="fotos-pdf-brand">IndusPower</div>
                  <div className="fotos-pdf-sub">Powering Solutions</div>
                </div>
                <div className="fotos-pdf-title">{title}</div>
                <div className="fotos-pdf-right">{ficha.cliente || ""}</div>
              </div>

              <div className="fotos-grid">
                {page.items.map((foto, idx) => (
                  <div key={idx} className="foto-frame">
                    <div className="foto-frame-header">
                      <div className="foto-id">{idx + 1}</div>

                      <div className="foto-desc">
                        {foto.descricao || "Sem descrição"}
                      </div>
                    </div>

                    <div className="foto-content">
                      {foto.imagem ? (
                        <img src={foto.imagem} alt={foto.descricao} />
                      ) : (
                        <div className="foto-empty">[ SEM FOTO ]</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
