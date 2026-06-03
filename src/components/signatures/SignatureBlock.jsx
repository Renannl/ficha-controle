import SignatureCanvas from "./SignatureCanvas";

export default function SignatureBlock({ role, sig, onNameChange, onSign }) {
  return (
    <div className="signature-block animate-fadeIn">
      <div className="signature-block-header">
        <span className="signature-role">{role.label}</span>

        {sig.data && (
          <span className="signature-date">Assinado em {sig.data}</span>
        )}
      </div>

      <input
        className="signature-name-input"
        value={sig.nome || ""}
        onChange={(e) => onNameChange(role.key, e.target.value)}
        placeholder={`Nome do ${role.label.toLowerCase()}`}
      />

      <SignatureCanvas
        dataUrl={sig.dataUrl}
        onSave={(url) => onSign(role.key, url)}
        onClear={() => onSign(role.key, "")}
      />
    </div>
  );
}
