import PrintView from "./PrintView";

export default function BookPrintView({ fichas }) {
  return (
    <div id="book-print-root">
      {fichas.map((ficha) => (
        <div key={ficha.id} className="book-report-wrapper">
          <PrintView ficha={ficha} isBook={true} />
        </div>
      ))}
    </div>
  );
}
