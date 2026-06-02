export default function NotesFields({
  ficha,
  observacoes,
  onChange,
  onChangeAlteracoes,
}) {
  const showAlteracoes =
    ficha?.status === "finalizada" ||
    ficha?.statusAprovacao === "reprovado";

  return (
    <div
      className="notes-fields-container"
      style={{
        display: "flex",
        gap: "20px",
        flexDirection: showAlteracoes ? "row" : "column",
      }}
    >
      <div
        className="field"
        style={{ flex: 1 }}
      >
        <label>Observações Gerais</label>

        <textarea
          value={observacoes}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Adicione observações sobre a execução, pendências, ocorrências..."
          rows={6}
        />

        <p
          className="text-xs text-muted mt-2"
          style={{ fontStyle: "italic" }}
        >
          No mais anotar no verso.
        </p>
      </div>

      {showAlteracoes && (
        <div
          className="field"
          style={{ flex: 1 }}
        >
          <label>
            Alterações Feitas

            <span
              style={{
                color: "var(--amber)",
                marginLeft: "4px",
                fontStyle: "italic",
              }}
            >
              *Obrigatório
            </span>
          </label>

          <textarea
            value={ficha.alteracoesFeitas || ""}
            onChange={(e) =>
              onChangeAlteracoes(e.target.value)
            }
            placeholder="Exemplo: Corrigido número de série do instrumento X..."
            rows={6}
            style={{
              borderColor:
                !ficha.alteracoesFeitas?.trim()
                  ? "var(--amber)"
                  : "",
            }}
          />

          <p
            className="text-xs text-muted mt-2"
            style={{
              fontStyle: "italic",
              color: "var(--amber)",
            }}
          >
            Esta ficha já estava finalizada.
            Justifique as edições recentes.
          </p>
        </div>
      )}
    </div>
  );
}