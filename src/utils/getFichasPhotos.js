export function getFichaPhotos(ficha) {
  return (
    ficha.fotoData?.fotos
      ?.filter((f) => f.imagem || f.foto)
      .map((f) => ({
        id: f.id,
        foto: f.imagem || f.foto,
        descricao: f.descricao,
      })) || []
  );
}
