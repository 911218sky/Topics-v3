import { useState, SetStateAction, Dispatch } from "react";

const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>] => {
  const localStorageAvailable =
    typeof window !== "undefined" && window.localStorage;

  const [storedValue, setStoredValue] = useState<T>(() => {
    if (localStorageAvailable) {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } else {
      console.error("localStorage not available, using initial value");
      return initialValue;
    }
  });

  const setValue: Dispatch<SetStateAction<T>> = (value) => {
    if (localStorageAvailable) {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } else {
      console.error("localStorage not available, value not set");
    }
  };

  return [storedValue, setValue];
};

export default useLocalStorage;
