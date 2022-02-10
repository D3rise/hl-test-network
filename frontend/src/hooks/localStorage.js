import { useState } from "react";

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

  const setStoredState = (newState) => {
    try {
      setState(newState);

      const valueToStore =
        typeof newState === "object" ? JSON.stringify(newState) : newState;
      localStorage.setItem(key, valueToStore);
    } catch (e) {
      console.error(e);
    }
  };

  return [state, setStoredState];
};
