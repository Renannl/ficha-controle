export async function uploadFoto(file, ficha) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fichaId", ficha.dbId);

    const response = await fetch("http://localhost:3001/upload-foto", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    return data;
  } catch (err) {
    console.error("[Upload Foto]", err);
    return null;
  }
}

// ======================================
// PDF
// ======================================

export async function uploadPdf(pdfBlob, ficha) {
  try {
    const formData = new FormData();

    formData.append("file", pdfBlob, `${ficha.codigo}.pdf`);
    formData.append("fichaId", ficha.dbId);

    const response = await fetch("http://localhost:3001/upload-pdf", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    return data;
  } catch (err) {
    console.error("[Upload PDF]", err);
    return null;
  }
}
