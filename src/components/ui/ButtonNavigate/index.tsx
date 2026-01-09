"use client";

import { ButtonProps } from "@/src/components/ui/ButtonNavigate/interface";
import useClickSound from "@/src/hooks/useClickSound";
import { useRouter } from "next/navigation";

const ButtonNavigate = ({ tittle, route }: ButtonProps) => {
  const router = useRouter();
  const { playClick } = useClickSound(false, 1.5);

  const handleGoHome = () => {
    playClick();
    router.push(route);
  };
  return (
    <div>
      <button
        className="button py-2 px-6 bg-blue-500 rounded-lg cursor-pointer select-none
    active:translate-y-2  active:[box-shadow:0_0px_0_0_#1b6ff8,0_0px_0_0_#1b70f841]
    active:border-b-[0px]
    transition-all [box-shadow:0_10px_0_0_#1b6ff8,0_15px_0_0_#1b70f841]
    border-b-[1px] border-blue-400
    hover:scale-110 duration-250
  "
        onClick={handleGoHome}
      >
        <span className="flex flex-col justify-center items-center h-full text-white ">
          {tittle}
        </span>
      </button>
    </div>
  );
};

export default ButtonNavigate;
