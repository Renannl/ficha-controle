import { LOGO_BASE64 } from "./logoBase64";

export default function PrintHeader({ ficha }) {
  return (
    <table className="print-header-table">
      <tbody>
        <tr>
          <td className="logo-cell">
            <img
              src={LOGO_BASE64}
              alt="IndusPower"
              style={{
                height: "70px",
                width: "auto",
                display: "block",
                margin: "0 auto",
              }}
            />
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
            <strong>Revisão:</strong> {ficha.revisao}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
