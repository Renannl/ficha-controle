import { Capacitor } from "@capacitor/core";

const TIPOS = {
  pdf: "application/pdf",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  dwg: "application/acad",
  zip: "application/zip",
  txt: "text/plain",
  csv: "text/csv",
};

function tipoDoArquivo(blob, nome) {
  if (blob?.type && blob.type !== "application/octet-stream") return blob.type;
  const ext = (nome || "").split(".").pop().toLowerCase();
  return TIPOS[ext] || "application/octet-stream";
}

function blobParaBase64(blob) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(String(leitor.result).split(",")[1] || "");
    leitor.onerror = () => reject(leitor.error);
    leitor.readAsDataURL(blob);
  });
}

export async function entregarDataUrl(dataUrl, nome) {
  if (!Capacitor.isNativePlatform()) return false;
  const [cabecalho, dados] = String(dataUrl).split(",");
  const tipo = (cabecalho.match(/data:([^;]+)/) || [])[1] || "image/png";
  const bytes = Uint8Array.from(atob(dados), (c) => c.charCodeAt(0));
  return entregarArquivo(new Blob([bytes], { type: tipo }), nome);
}

export async function entregarArquivo(blob, nome = "arquivo") {
  if (!Capacitor.isNativePlatform()) return false;

  const [{ Filesystem, Directory }, { FileOpener }, { Share }] =
    await Promise.all([
      import("@capacitor/filesystem"),
      import("@capacitor-community/file-opener"),
      import("@capacitor/share"),
    ]);

  const nomeSeguro = String(nome).replace(/[\\/:*?"<>|]/g, "-") || "arquivo";
  const { uri } = await Filesystem.writeFile({
    path: nomeSeguro,
    data: await blobParaBase64(blob),
    directory: Directory.Cache,
  });

  try {
    await FileOpener.open({
      filePath: uri,
      contentType: tipoDoArquivo(blob, nomeSeguro),
      openWithDefault: true,
    });
  } catch {
    await Share.share({ title: nomeSeguro, files: [uri] });
  }
  return true;
}
