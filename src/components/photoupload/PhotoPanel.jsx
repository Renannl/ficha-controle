// PhotoPanel.jsx
import { memo, useCallback } from "react";
import PhotoPanelHeader from "./PhotoPanelHeader";
import PhotoGrid from "./PhotoGrid";
import { usePhotoUpload } from "../../hooks/usePhotoUpload";

const PhotoPanel = memo(function PhotoPanel({ ficha, onUpdateFotoData }) {
  const { handlePhotoUpload } = usePhotoUpload(ficha);

  const fotos = ficha.fotoData?.fotos || [];

  const atualizarFotos = useCallback(
    (novasFotos) => onUpdateFotoData({ fotos: novasFotos }),
    [onUpdateFotoData]
  );

  const adicionarFoto = useCallback(async (file) => {
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
  }, [fotos, handlePhotoUpload, atualizarFotos]);

  const atualizarDescricao = useCallback(
    (id, descricao) =>
      atualizarFotos(fotos.map((f) => (f.id === id ? { ...f, descricao } : f))),
    [fotos, atualizarFotos]
  );

  const atualizarImagem = useCallback(
    async (id, file) => {
      const url = await handlePhotoUpload(file);
      if (!url) return;
      atualizarFotos(fotos.map((f) => (f.id === id ? { ...f, imagem: url } : f)));
    },
    [fotos, handlePhotoUpload, atualizarFotos]
  );

  const handleMultiUpload = useCallback(
    async (e) => {
      for (const file of Array.from(e.target.files)) {
        await adicionarFoto(file);
      }
    },
    [adicionarFoto]
  );

  const removerFoto = useCallback(
    (id) => atualizarFotos(fotos.filter((f) => f.id !== id)),
    [fotos, atualizarFotos]
  );

  const handleAdicionarVazio = useCallback(() => {
    atualizarFotos([
      ...fotos,
      {
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        descricao: "",
        imagem: "",
      },
    ]);
  }, [fotos, atualizarFotos]);

  return (
    <>
      <PhotoPanelHeader handleMultiUpload={handleMultiUpload} />

      <button onClick={handleAdicionarVazio}>+ Adicionar Foto</button>

      <PhotoGrid
        fotos={fotos}
        onRemove={removerFoto}
        onDescricaoChange={atualizarDescricao}
        onUpload={atualizarImagem}
      />
    </>
  );
});

export default PhotoPanel;
