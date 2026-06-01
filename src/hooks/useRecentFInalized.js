import { useMemo } from "react";

export default function useRecentFinalized(fichas) {
  return useMemo(
    () =>
      fichas.filter((f) => ["done", "approved"].includes(f.status)).slice(0, 5),
    [fichas],
  );
}
