"use client";

import ButtonNavigate from "@/src/components/ui/ButtonNavigate";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const NotFound = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    //desencorajar efeitos que só servem para “fixar hydration” Mas neste caso, é exatamente para isso que serve.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative flex flex-col items-center justify-center h-screen px-4 overflow-hidden">
      <img
        src={
          theme === "dark"
            ? "/drawns/curled_arrow_light.png"
            : "/drawns/curled_arrow_dark.png"
        }
        alt="Flecha-enrolada"
        className="absolute w-20 sm:w-24 md:w-28
                   bottom-[35%] sm:bottom-[33%] left-[17%] sm:left-[40%]
                   -translate-x-1/2 rotate-20
                   hover:scale-110 duration-250 active:scale-80"
      />
      <img
        src={
          theme === "dark"
            ? "/drawns/heart_light.png"
            : "/drawns/heart_dark.png"
        }
        alt="Coração"
        className="absolute w-12 sm:w-16 md:w-20
                   top-[10%] sm:top-[15%] left-[5%] sm:left-[10%]
                   hover:scale-110 duration-250 active:scale-80"
      />
      <img
        src={
          theme === "dark" ? "/drawns/star_light.png" : "/drawns/star_dark.png"
        }
        alt="Estrela"
        className="absolute w-10 sm:w-12 md:w-16
                   top-[5%] sm:top-[10%] right-[5%] sm:right-[10%]
                   hover:scale-110 duration-250 active:scale-80"
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
