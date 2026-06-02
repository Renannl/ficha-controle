import { useState } from "react";

import PhotoBankList from "./PhotoBankList";
import PhotoBankDetail from "./PhotoBankDetail";
import EmptyPhotoBank from "./EmptyPhotoBank";

export default function PhotoBank({ fichas }) {
  const [selectedFichaId, setSelectedFichaId] = useState(
    () => localStorage.getItem("photoBankSelectedId") || null,
  );

  const allFichasWithPhotos = fichas.filter((f) =>
    f.items?.some((item) => item.foto),
  );

  if (selectedFichaId) {
    const ficha = fichas.find((f) => f.id === selectedFichaId);

    if (!ficha) {
      setSelectedFichaId(null);
      return null;
    }

    return (
      <PhotoBankDetail ficha={ficha} onBack={() => setSelectedFichaId(null)} />
    );
  }

  return (
    <div
      className="photo-bank-list animate-scaleIn"
      style={{
        padding: "20px 24px 100px",
      }}
    >
      {allFichasWithPhotos.length > 0 ? (
        <PhotoBankList fichas={fichas} onOpenAlbum={setSelectedFichaId} />
      ) : (
        <EmptyPhotoBank />
      )}
    </div>
  );
}
