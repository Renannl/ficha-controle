// utils/getFichaPhotos.js
export function getFichaPhotos(ficha) {
  return (
    ficha.fotoData?.fotos
      ?.filter((f) => f.imagem)
      .map((f) => ({
        id: f.id,
        foto: f.imagem,
        descricao: f.descricao,
      })) || []
  );
}
