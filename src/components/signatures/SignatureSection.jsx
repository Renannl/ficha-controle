import SignatureBlock from "./SignatureBlock";
import SignatureFinalize from "./SignatureFinalize";

const ROLES = [
  { key: "producao", label: "Produção" },
  { key: "tecnico", label: "Técnico Responsável" },
  { key: "supervisor", label: "Supervisor de Produção" },
  { key: "qualidade", label: "Responsável pela Qualidade" },
];

export default function SignatureSection({
  ficha,
  assinaturas,
  onSign,
  onNameChange,
  onFinalizar,
}) {
  return (
    <div className="signatures-section">
      <div
        className="card mb-3"
        style={{
          padding: 0,
          overflow: "visible",
          background: "transparent",
          border: "none",
          boxShadow: "none",
        }}
      >
        <div
          className="section-header"
          style={{
            padding: "0 0 12px",
            marginBottom: 16,
          }}
        >
          <div className="section-icon">✍️</div>

          <div>
            <h2>Assinaturas</h2>

            <p>Executante, Técnico, Supervisor e Responsável pela Qualidade</p>
          </div>
        </div>
      </div>

      {ROLES.filter((role) => !(ficha?.tafData && role.key === "producao")).map(
        (role) => (
          <SignatureBlock
            key={role.key}
            role={role}
            sig={assinaturas?.[role.key] ?? {}}
            onNameChange={onNameChange}
            onSign={onSign}
          />
        ),
      )}

      <SignatureFinalize onFinalizar={onFinalizar} />
    </div>
  );
}
