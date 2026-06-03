import { INSTRUMENTOS_TAF } from "../../data/fichaTemplate";

export default function TafEquipamentos({ selecionados, onToggle }) {
  return (
    <>
      <div className="taf-section-title">EQUIPAMENTOS UTILIZADOS</div>

      <div className="taf-equipamentos-selector">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4">
          {INSTRUMENTOS_TAF.map((inst) => (
            <label
              key={inst.id}
              className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg cursor-pointer hover:border-blue transition-colors"
            >
              <input
                type="checkbox"
                checked={selecionados.includes(inst.id)}
                onChange={() => onToggle(inst.id)}
              />

              <div className="flex flex-col">
                <span className="text-sm font-bold">{inst.nome}</span>

                <span className="text-[10px] opacity-60">
                  Nº Série: {inst.serie}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </>
  );
}
