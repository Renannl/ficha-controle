import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FolderOpen,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Download,
  ExternalLink,
  Loader2,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

function formatarTamanho(bytes) {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function corrigirAcentos(str) {
  if (!str) return str;
  try {
    return decodeURIComponent(escape(str));
  } catch {
    return str;
  }
}

function IconeArquivo({ mimeType }) {
  if (mimeType?.includes("pdf")) return <FileText className="icone--pdf" />;
  if (mimeType?.includes("image")) return <ImageIcon className="icone--img" />;
  if (mimeType?.includes("sheet") || mimeType?.includes("excel"))
    return <FileSpreadsheet className="icone--xls" />;
  if (mimeType?.includes("word")) return <FileText className="icone--doc" />;
  return <FileText />;
}

export default function PainelPublicoView() {
  const { token } = useParams();
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [processandoId, setProcessandoId] = useState(null);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/publico/painel/${token}/arquivos`);
        if (!res.ok) throw new Error("Painel não encontrado ou link inválido.");
        const json = await res.json();
        if (ativo) setDados(json);
      } catch (e) {
        if (ativo) setErro(e.message);
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [token]);

  async function baixar(arquivo, forcarDownload = true) {
    setProcessandoId(arquivo.id);
    try {
      const res = await fetch(
        `${API_URL}/publico/arquivo/${arquivo.downloadToken}`,
      );
      if (!res.ok) throw new Error("Falha ao baixar o arquivo.");
      const blob = await res.blob();

      if (forcarDownload) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = corrigirAcentos(arquivo.nome);
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setProcessandoId(null);
    }
  }

  if (carregando) {
    return (
      <div className="publico-loading">
        <Loader2 className="spin" size={24} />
        <span>Carregando documentação...</span>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="publico-erro">
        <div>⚠️ {erro}</div>
        <p>Verifique o QR Code ou entre em contato com a IndusPower.</p>
      </div>
    );
  }

  const { colecao, arquivos } = dados;

  return (
    <div className="publico-painel">
      <header className="publico-header">
        <FolderOpen size={30} />
        <div>
          <h1>{colecao?.cliente || "Documentação"}</h1>
          <p>{colecao?.descricao || "Arquivos do painel"}</p>
        </div>
      </header>

      <div className="publico-contagem">
        <strong>{arquivos.length}</strong>{" "}
        {arquivos.length === 1 ? "arquivo disponível" : "arquivos disponíveis"}
      </div>

      {arquivos.length === 0 ? (
        <div className="publico-vazio">Nenhum arquivo disponível ainda.</div>
      ) : (
        <table className="publico-tabela">
          <thead>
            <tr>
              <th>Arquivo</th>
              <th>Pasta</th>
              <th>Tamanho</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {arquivos.map((a) => (
              <tr key={a.id}>
                <td className="publico-nome">
                  <IconeArquivo mimeType={a.mimeType} />
                  <span title={corrigirAcentos(a.nome)}>
                    {corrigirAcentos(a.nome)}
                  </span>
                </td>
                <td className="publico-pasta">
                  {corrigirAcentos(a.caminho?.split("/").slice(0, -1).join(" / "))}
                </td>
                <td>{formatarTamanho(a.tamanho)}</td>
                <td className="publico-acoes">
                  <button
                    onClick={() => baixar(a, false)}
                    disabled={processandoId === a.id}
                    title="Visualizar"
                  >
                    {processandoId === a.id ? (
                      <Loader2 className="spin" size={14} />
                    ) : (
                      <ExternalLink size={14} />
                    )}
                  </button>
                  <button
                    onClick={() => baixar(a, true)}
                    disabled={processandoId === a.id}
                    title="Baixar"
                  >
                    <Download size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <footer className="publico-footer">
        Documentação fornecida por IndusPower · Acesso seguro via QR Code
      </footer>
    </div>
  );
}
