import { uploadFoto } from "../services/uploadService";

export function usePhotoUpload(ficha, onUpdate) {
  async function handlePhotoUpload(idx, file) {
    if (!file) return;

    try {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();

        img.onload = async () => {
          const canvas = document.createElement("canvas");

          let { width, height } = img;

          const maxSize = 600;

          if (width > height && width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            async (blob) => {
              if (!blob) return;

              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
              });

              const url = await uploadFoto(compressedFile, ficha);

              if (!url) {
                alert("Erro ao enviar foto");
                return;
              }

              onUpdate(idx, "foto", url);
            },
            "image/jpeg",
            0.6,
          );
        };

        img.src = e.target.result;
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      alert("Erro ao processar imagem");
    }
  }

  return { handlePhotoUpload };
}
