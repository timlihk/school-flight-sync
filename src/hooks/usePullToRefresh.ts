import { useCallback, useRef, useState } from "react";

const INTERACTIVE_SELECTOR = '[data-nav-touch="true"],button,[role="button"],input,select,textarea,a';
const EDGE_THRESHOLD = 80;

interface PullToRefreshOptions {
  isEnabled: boolean;
  onRefresh: () => void | Promise<void>;
  onSwipe?: (direction: "next" | "prev") => void;
}

export function usePullToRefresh({ isEnabled, onRefresh, onSwipe }: PullToRefreshOptions) {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const skipGesture = useRef(false);
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!isEnabled) return;
    const target = e.target as HTMLElement;
    const interactive = !!target.closest(INTERACTIVE_SELECTOR);
    skipGesture.current = interactive;
    if (interactive) return;

    const touch = e.touches[0];
    if (touch.clientY > EDGE_THRESHOLD || window.scrollY > 0) {
      skipGesture.current = true;
      return;
    }
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    setIsPulling(window.scrollY <= 0);
  }, [isEnabled]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!isEnabled || !isPulling || skipGesture.current) return;
    const touch = e.touches[0];
    if (window.scrollY > 2) return;
    const deltaY = touch.clientY - (touchStartY.current ?? touch.clientY);
    if (deltaY > 0) {
      setPullDistance(Math.min(deltaY, 90));
    }
  }, [isEnabled, isPulling]);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!isEnabled) return;
    const touch = e.changedTouches[0];
    if (skipGesture.current) {
      skipGesture.current = false;
      touchStartX.current = null;
      touchStartY.current = null;
      setIsPulling(false);
      setPullDistance(0);
      return;
    }

    const deltaX = touchStartX.current !== null ? touch.clientX - touchStartX.current : 0;
    const deltaY = touchStartY.current !== null ? touch.clientY - touchStartY.current : 0;

    if (isPulling && pullDistance > 60) {
      onRefresh();
    }

    if (Math.abs(deltaX) > 60 && Math.abs(deltaY) < 40 && onSwipe) {
      onSwipe(deltaX < 0 ? "next" : "prev");
    }

    touchStartX.current = null;
    touchStartY.current = null;
    setIsPulling(false);
    setPullDistance(0);
  }, [isEnabled, isPulling, onRefresh, pullDistance, onSwipe]);

  return {
    bind: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    isPulling,
    pullDistance,
  };
}
