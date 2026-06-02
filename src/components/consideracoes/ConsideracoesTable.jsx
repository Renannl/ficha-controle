export default function ConsideracoesTable({
  verificacoes = [],
  onUpdateFotoData,
}) {
  function handleVerificacaoChange(index, field, value) {
    const novasVerificacoes = [...verificacoes];

    novasVerificacoes[index] = {
      ...novasVerificacoes[index],
      [field]: value,
    };

    onUpdateFotoData({
      verificacoes: novasVerificacoes,
    });
  }

  return (
    <div className="table-responsive-container">
      <table className="verificacoes-table">
        <thead>
          <tr>
            <th className="th-item">ÍTENS DE VERIFICAÇÃO</th>

            <th className="th-img">IMG</th>

            <th className="th-status">STATUS</th>
          </tr>
        </thead>

        <tbody>
          {verificacoes.map((v, i) => (
            <tr key={i} className="verificacao-row">
              <td className="verificacao-cell-bordered">
                <input
                  className="verificacao-input"
                  type="text"
                  value={v.descricao}
                  onChange={(e) =>
                    handleVerificacaoChange(i, "descricao", e.target.value)
                  }
                  placeholder="Descrição..."
                />
              </td>

              <td className="verificacao-cell-bordered">
                <input
                  className="verificacao-input verificacao-input-center"
                  type="text"
                  value={v.imagemRef}
                  onChange={(e) =>
                    handleVerificacaoChange(i, "imagemRef", e.target.value)
                  }
                  placeholder="Ref"
                />
              </td>

              <td className="verificacao-cell">
                <input
                  className="verificacao-input verificacao-input-center"
                  type="text"
                  value={v.status}
                  onChange={(e) =>
                    handleVerificacaoChange(i, "status", e.target.value)
                  }
                  placeholder="OK/..."
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
