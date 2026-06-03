export default function PrintHeader({ ficha }) {
  return (
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
          <td className="info-cell">
            <strong>Código:</strong> {ficha.codigo}
          </td>
          <td className="info-cell">
            <strong>Folha:</strong> {ficha.folha}
          </td>
          <td className="info-cell">
            <strong>Revisão:</strong> {ficha.revisao}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
