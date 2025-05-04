import { useRef, useCallback } from "react";

/**
 * A custom hook that provides a debounced version of a function
 * @param {Function} fn The function to debounce
 * @param {number} delay The debounce delay in milliseconds
 * @returns {Function} The debounced function
 */
function useDebounceFunction(fn, delay = 500) {
  const timeoutRef = useRef(null);

  return useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        fn(...args);
      }, delay);
    },
    [fn, delay]
  );
}

export default useDebounceFunction;
