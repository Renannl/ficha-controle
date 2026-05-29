import { useEffect } from "react";
import { useLocalStorageState } from "./useLocalStorageState";

const VALID_STATUS = new Set([
  "all",
  "progress",
  "done",
  "waiting",
  "approved",
  "rejected",
  "empty",
]);

const VALID_TYPES = new Set([
  "all",
  "taf",
  "controle",
  "foto",
]);

export function useHomeFilters() {
  const [filterStatus, setFilterStatus] = useLocalStorageState(
    "homeFilterStatus",
    "all",
  );

  const [filterType, setFilterType] = useLocalStorageState(
    "homeFilterType",
    "all",
  );

  useEffect(() => {
    if (!VALID_STATUS.has(filterStatus)) {
      setFilterStatus("all");
    }

    if (!VALID_TYPES.has(filterType)) {
      setFilterType("all");
    }
  }, [filterStatus, filterType, setFilterStatus, setFilterType]);

  return {
    filterStatus,
    setFilterStatus,
    filterType,
    setFilterType,
  };
}