import { useMemo } from "react";

export default function useFilteredFichas(
  fichaProgress,
  searchTerm,
) {
  return useMemo(() => {
    if (!searchTerm) return fichaProgress;

    const lower = searchTerm.toLowerCase();

    return fichaProgress.filter(
      (f) =>
        f.id.toLowerCase().includes(lower) ||
        f.nrInd.toLowerCase().includes(lower) ||
        f.nome.toLowerCase().includes(lower),
    );
  }, [fichaProgress, searchTerm]);
}