import { useRef, useState } from "react";

export function useViewModeDrag(setViewMode) {
  const toggleRef = useRef(null);
  const [dragOffset, setDragOffset] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const updateDragPosition = (clientX) => {
    if (!toggleRef.current) return;

    const rect = toggleRef.current.getBoundingClientRect();
    let x = (clientX - rect.left) / rect.width;
    x = Math.max(0.16, Math.min(0.84, x));

    setDragOffset(x);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    updateDragPosition(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    updateDragPosition(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    if (dragOffset !== null) {
      if (dragOffset < 0.33) setViewMode("list");
      else if (dragOffset < 0.66) setViewMode("gallery");
      else setViewMode("dashboard");
    }

    setIsDragging(false);
    setDragOffset(null);
  };

  return {
    toggleRef,
    dragOffset,
    isDragging,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}