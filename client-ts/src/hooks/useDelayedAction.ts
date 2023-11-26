import { useEffect, useState, useRef } from "react";

type DelayedActionType<V, S extends (...args: any) => any> = [
  V,
  (...args: Parameters<S>) => Promise<ReturnType<S>>
];

const useDelayedAction = <T extends (...args: any[]) => any>(
  delay: number,
  action: T
): DelayedActionType<number, T> => {
  const [timeRemaining, setTimeRemaining] = useState<number>(delay);
  const timerIdRef = useRef<NodeJS.Timer | null>(null);

  const startCountdown = (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve) => {
      clearInterval(timerIdRef.current!);
      setTimeRemaining(delay);
      timerIdRef.current = setInterval(() => {
        setTimeRemaining((prevTimeRemaining) => {
          const newTimeRemaining = prevTimeRemaining - 1000;
          if (newTimeRemaining <= 0) {
            clearInterval(timerIdRef.current!);
            const result = action(args);
            resolve(result);
          }
          return newTimeRemaining;
        });
      }, 1000);
    });
  };

  useEffect(() => {
    return () => {
      if (!timerIdRef.current) return;
      clearInterval(timerIdRef.current);
    };
  }, []);

  return [Math.floor(timeRemaining / 1000), startCountdown];
};

export default useDelayedAction;
