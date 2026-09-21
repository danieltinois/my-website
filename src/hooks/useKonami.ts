import { useEffect } from "react";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

const useKonami = (onDone: () => void) => {
  useEffect(() => {
    let i = 0;

    const handler = (e: KeyboardEvent) => {
      if (e.key === KONAMI[i]) {
        i += 1;
        if (i === KONAMI.length) {
          i = 0;
          onDone();
        }
      } else {
        i = 0;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onDone]);
};

export default useKonami;