import { MEGGER_FIELDS } from "./tafConstants";

export default function TafMegger({ tafData, handleChange }) {
  return (
    <>
      <div className="taf-section-title flex justify-between items-center">
        <span>TESTE DE ISOLAÇÃO MEGGER (CIRCUITO PRINCIPAL)</span>

        <div className="flex gap-4">
          <label>
            <input
              type="checkbox"
              checked={!tafData.isNotApplicable}
              onChange={(e) =>
                handleChange("isNotApplicable", !e.target.checked)
              }
            />
            Aplicável
          </label>

          <label>
            <input
              type="checkbox"
              checked={tafData.isNotApplicable}
              onChange={(e) =>
                handleChange("isNotApplicable", e.target.checked)
              }
            />
            Não Aplicável
          </label>
        </div>
      </div>

      <div className="megger-table">
        {MEGGER_FIELDS.map(([label, key]) => (
          <div key={key} className="taf-input-group">
            <label>{label}</label>

            <input
              value={tafData.megger?.[key] || ""}
              placeholder="MΩ"
              onChange={(e) => handleChange(`megger.${key}`, e.target.value)}
            />
          </div>
        ))}

        <div className="taf-input-group span-2">
          <label>TENSÃO APLICADA</label>

          <input
            value={tafData.megger?.tensaoAplicada || ""}
            onChange={(e) =>
              handleChange("megger.tensaoAplicada", e.target.value)
            }
          />
        </div>
      </div>
    </>
  );
}
