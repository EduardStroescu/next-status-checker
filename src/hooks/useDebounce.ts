import { useRef, useCallback } from "react";

export function useDebounce<Args extends unknown[]>(
  func: (...args: Args) => void,
  delay: number
): (...args: Args) => void {
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debounced = useCallback(
    (...args: Args) => {
      if (timeoutId.current) clearTimeout(timeoutId.current);
      timeoutId.current = setTimeout(() => {
        timeoutId.current = null;
        func(...args);
      }, delay);
    },
    [func, delay]
  );

  return debounced;
}
