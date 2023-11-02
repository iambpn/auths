import { useEffect, useState } from "react";

export function useDebouncedValue<T>(initialValue: T, delay: number = 300) {
  const [debouncedValue, setDebouncedValue] = useState(initialValue);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedValue(initialValue);
    }, delay);

    return () => {
      clearTimeout(timerId);
    };
  }, [initialValue, delay]);

  return debouncedValue;
}
