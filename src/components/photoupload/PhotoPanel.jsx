import PhotoPanelHeader from "./PhotoPanelHeader";
import PhotoGrid from "./PhotoGrid";
import { usePhotoUpload } from "../../hooks/usePhotoUpload";

export default function PhotoPanel({ ficha, onUpdateFotoData }) {
  const { handlePhotoUpload } = usePhotoUpload(ficha);

  const fotos = ficha.fotoData?.fotos || [];

  function atualizarFotos(novasFotos) {
    onUpdateFotoData({
      fotos: novasFotos,
    });
  }

  async function adicionarFoto(file) {
    const url = await handlePhotoUpload(file);

    if (!url) return;

    atualizarFotos([
      ...fotos,
      {
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        descricao: "",
        imagem: url,
      },
    ]);
  }

  function atualizarDescricao(id, descricao) {
    atualizarFotos(fotos.map((f) => (f.id === id ? { ...f, descricao } : f)));
  }

  async function atualizarImagem(id, file) {
    const url = await handlePhotoUpload(file);

    if (!url) return;

    atualizarFotos(fotos.map((f) => (f.id === id ? { ...f, imagem: url } : f)));
  }

  async function handleMultiUpload(e) {
    const files = Array.from(e.target.files);

    for (const file of files) {
      await adicionarFoto(file);
    }
  }

  function removerFoto(id) {
    atualizarFotos(fotos.filter((f) => f.id !== id));
  }

  return (
    <>
      <PhotoPanelHeader handleMultiUpload={handleMultiUpload} />

      <button
        onClick={() =>
          atualizarFotos([
            ...fotos,
            {
              id: Date.now().toString() + Math.random().toString(36).slice(2),
              descricao: "",
              imagem: "",
            },
          ])
        }
      >
        + Adicionar Foto
      </button>

      <PhotoGrid
        fotos={fotos}
        onRemove={removerFoto}
        onDescricaoChange={atualizarDescricao}
        onUpload={atualizarImagem}
      />
    </>
  );
}
