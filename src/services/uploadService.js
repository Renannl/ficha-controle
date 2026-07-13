import { authFetch } from "./apiClient";

const API_URL = "http://localhost:3001";

export async function uploadFoto(file, ficha) {
  if (!ficha?.dbId) {
    console.error("[Upload Foto] Tentativa de upload sem dbId válido:", ficha);
    alert("Erro: a ficha ainda não foi salva. Aguarde e tente novamente.");
    return null;
  }
  try {
    const formData = new FormData();
    formData.append("fichaId", ficha.dbId); // ✅ corrigido
    formData.append("file", file);

    const response = await authFetch(`${API_URL}/upload-foto`, {
      method: "POST",
      body: formData,
    });

    if (!response)
      throw new Error("Sessão expirada ou sem resposta do servidor");
    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`Erro ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return `${API_URL}/uploads/${data.caminho}`;
  } catch (err) {
    console.error("[Upload Foto]", err);
    alert("Erro ao enviar foto: " + err.message);
    return null;
  }
}

export async function uploadBook(pdfBlob, fichaIds) {
  try {
    const formData = new FormData();
    formData.append("file", pdfBlob, "BOOK.pdf");
    formData.append("fichaIds", JSON.stringify(fichaIds));

    const response = await authFetch(`${API_URL}/upload-book`, {
      method: "POST",
      body: formData,
    });

    if (!response)
      throw new Error("Sessão expirada ou sem resposta do servidor");
    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`Erro ${response.status}: ${errText}`);
    }

    return await response.json();
  } catch (err) {
    console.error("[uploadBook] Erro:", err);
    return null;
  }
}

export async function uploadPdf(pdfBlob, ficha) {
  if (!ficha?.dbId) {
    console.error("[Upload PDF] Tentativa de upload sem dbId válido:", ficha);
    alert("Erro: a ficha ainda não foi salva. Aguarde e tente novamente.");
    return null;
  }
  try {
    const formData = new FormData();
    formData.append("fichaId", ficha.dbId); // ✅ corrigido
    formData.append("file", pdfBlob, `${ficha.codigo}.pdf`);

    const response = await authFetch(`${API_URL}/upload-pdf`, {
      method: "POST",
      body: formData,
    });

    if (!response)
      throw new Error("Sessão expirada ou sem resposta do servidor");
    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`Erro ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return { ...data, url: `${API_URL}/uploads/${data.caminho}` };
  } catch (err) {
    console.error("[Upload PDF]", err);
    alert("Erro ao enviar PDF: " + err.message);
    return null;
  }
}
