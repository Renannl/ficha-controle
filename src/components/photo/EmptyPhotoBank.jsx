export default function EmptyPhotoBank() {
  return (
    <div
      className="home-empty"
      style={{
        paddingTop: "100px",
        paddingBottom: "160px",
      }}
    >
      <div className="empty-icon">🖼️</div>

      <p>
        Nenhuma foto enviada ainda. Toque no botão + para começar um relatório
        fotográfico.
      </p>
    </div>
  );
}
