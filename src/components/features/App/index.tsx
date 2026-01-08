"use client";

import useClickSound from "@/src/hooks/useClickSound";
import { HugeiconsIcon } from "@hugeicons/react";
import { AppProps } from "./interface";

const App = ({ title, icon }: AppProps) => {
  const { playClick } = useClickSound(false, 1.5);

  const handleClick = () => {
    playClick();
  };

  return (
    <button
      className="flex flex-col items-center cursor-pointer hover:scale-110 duration-250 active:scale-90"
      onClick={handleClick}
    >
      <div>
        <HugeiconsIcon
          icon={icon}
          size={70}
          color="color-text"
          strokeWidth={1.5}
        />
      </div>
      <span>{title}</span>
    </button>
  );
};

export default App;
