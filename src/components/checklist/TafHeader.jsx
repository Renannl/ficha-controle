export default function TafHeader({ tafData, onUpdateTaf }) {
  return (
    <div
      className="taf-section-title flex justify-between items-center"
      style={{ margin: "0 0 16px" }}
    >
      <span>TESTES FUNCIONAIS E VISUAIS</span>

      <div className="flex gap-4">
        <label className="flex items-center gap-1 font-bold text-[10px] cursor-pointer">
          <input
            type="checkbox"
            checked={!tafData.functionalNotApplicable}
            onChange={(e) =>
              onUpdateTaf({
                functionalNotApplicable: !e.target.checked,
              })
            }
          />
          Aplicável
        </label>

        <label className="flex items-center gap-1 font-bold text-[10px] cursor-pointer">
          <input
            type="checkbox"
            checked={tafData.functionalNotApplicable}
            onChange={(e) =>
              onUpdateTaf({
                functionalNotApplicable: e.target.checked,
              })
            }
          />
          Não Aplicável
        </label>
      </div>
    </div>
  );
}
