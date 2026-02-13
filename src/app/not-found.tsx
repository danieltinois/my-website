"use client";

import ButtonNavigate from "@/src/components/ui/ButtonNavigate";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";

const NotFound = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative flex flex-col items-center justify-center h-screen px-4 overflow-hidden">
      <Image
        src={
          theme === "dark"
            ? "/drawns/curled_arrow_light.png"
            : "/drawns/curled_arrow_dark.png"
        }
        alt="Flecha-enrolada"
        width={150}
        height={150}
        priority
        className="absolute w-20 sm:w-24 md:w-28
                   bottom-[35%] sm:bottom-[33%] left-[17%] sm:left-[40%]
                   -translate-x-1/2 rotate-20
                   hover:scale-110 duration-250 active:scale-80 select-none"
      />

      <div className="max-w-xl mx-auto text-center z-10">
        <span className="text-blue-500 font-semibold text-sm mb-2">Oops!</span>

        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
          Parece que você se perdeu..
        </h1>

        <p className="text-gray-500 mb-8 text-base sm:text-lg">
          A página que você está procurando não existe ou talvez esteja
          escondida em algum lugar secreto da internet. Não se preocupe, vamos
          te levar de volta para casa!
        </p>

        {/* Botão */}
        <div className="relative z-10">
          <ButtonNavigate tittle="De volta para casa." route="/" />
        </div>
      </div>
    </div>
  );
};

export default NotFound;
