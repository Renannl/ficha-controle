import PrintView from "./PrintView";

export default function BookPrintView({ fichas }) {
  return (
    <div id="book-print-root">
      {fichas.map((ficha, index) => (
        <div
          key={ficha.id}
          style={{
            pageBreakAfter: index !== fichas.length - 1 ? "always" : "auto",
          }}
        >
          <PrintView ficha={ficha} isBook={true} />
        </div>
      ))}
    </div>
  );
}
