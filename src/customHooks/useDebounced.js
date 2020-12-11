import { useEffect, useState } from "react";

export function useDebounced (value, timeout) {
  const [state, setState] = useState(value);

  useEffect(() => {
    console.log('Effect called');
    const handler = setTimeout(() => setState(value), timeout);

    return () => clearTimeout(handler);
  }, [value, timeout]);

  return state;
}