import { useCallback, useState } from "react";

export const useLocalStorage = (key, initialValue) => {
  const [state, setState] = useState(() => {
    try {
      const currentValue = localStorage.getItem(key);
      if (currentValue) {
        return typeof currentValue === "object"
          ? JSON.parse(currentValue)
          : currentValue;
      }
      return initialValue;
    } catch (e) {
      console.error(e);
      return initialValue;
    }
  });

  const setStoredValue = useCallback(
    (newValue) => {
      if (!newValue) {
        setState(null);
        return localStorage.removeItem(key);
      }
      const valueToStore =
        typeof newValue === "object" ? JSON.stringify(newValue) : newValue;
      setState(newValue);
      localStorage.setItem(key, valueToStore);
    },
    [key]
  );
  return [state, setStoredValue];
};
