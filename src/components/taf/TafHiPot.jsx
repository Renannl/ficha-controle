import { HIPOT_FIELDS } from "./tafConstants";

export default function TafHiPot({ tafData, handleChange }) {
  return (
    <>
      <div className="taf-section-title flex justify-between items-center">
        <span>TESTE DE HI-POT (CIRCUITO PRINCIPAL)</span>

        <div className="flex gap-4">
          <label>
            <input
              type="checkbox"
              checked={!tafData.hiPotNotApplicable}
              onChange={(e) =>
                handleChange("hiPotNotApplicable", !e.target.checked)
              }
            />
            Aplicável
          </label>

          <label>
            <input
              type="checkbox"
              checked={tafData.hiPotNotApplicable}
              onChange={(e) =>
                handleChange("hiPotNotApplicable", e.target.checked)
              }
            />
            Não Aplicável
          </label>
        </div>
      </div>

      <div className="megger-table">
        {HIPOT_FIELDS.map(([label, key]) => (
          <div key={key} className="taf-input-group">
            <label>{label}</label>

            <input
              value={tafData.hiPot?.[key] || ""}
              placeholder="mA / kV"
              onChange={(e) => handleChange(`hiPot.${key}`, e.target.value)}
            />
          </div>
        ))}
      </div>
    </>
  );
}
