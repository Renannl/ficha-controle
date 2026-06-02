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
            <th>ÍTENS DE VERIFICAÇÃO</th>
            <th>IMG</th>
            <th>STATUS</th>
          </tr>
        </thead>

        <tbody>
          {verificacoes.map((v, i) => (
            <tr key={i}>
              <td>
                <input
                  type="text"
                  value={v.descricao}
                  onChange={(e) =>
                    handleVerificacaoChange(i, "descricao", e.target.value)
                  }
                  placeholder="Descrição..."
                />
              </td>

              <td>
                <input
                  type="text"
                  value={v.imagemRef}
                  onChange={(e) =>
                    handleVerificacaoChange(i, "imagemRef", e.target.value)
                  }
                  placeholder="Ref"
                />
              </td>

              <td>
                <input
                  type="text"
                  value={v.status}
                  onChange={(e) =>
                    handleVerificacaoChange(i, "status", e.target.value)
                  }
                  placeholder="OK..."
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
