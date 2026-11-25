"use client";

import { useRef } from "react";
import AsciiCanvas from "@/src/components/Ascii/AsciiCanvas";
import { TRAJETORIA } from "@/src/data/site";

// A estrada da trajetória e a lista dos marcos. Passar o cursor (ou o foco do teclado) por uma
// linha escreve data-foco no bloco da estrada, e a cena acende o poste daquele ano com um rastro
// de luz até ele. A lista vem da mais nova para a mais antiga; os postes, da mais antiga.

// colunas máximas de cada tamanho de tela; as linhas seguem a proporção do bloco (3:1 no
// desktop, 2:1 no celular) e a cena ganha detalhe conforme sobe pela tela
const GRADE_ESTRADA = [
  { mq: "(min-width: 1024px)", cols: 340, rows: 0 },
  { mq: "all", cols: 160, rows: 0 },
];
// a folha do viajante (objeto fixo do módulo: o AsciiCanvas recarrega quando ele muda)
const FIGURAS = { viajante: "/cenas/figuras/viajante.webp" };

const Trajetoria = () => {
  const estrada = useRef<HTMLDivElement>(null);
  const focar = (i: number | null) => {
    const bloco = estrada.current;
    if (!bloco) return;
    if (i === null) bloco.removeAttribute("data-foco");
    else bloco.setAttribute("data-foco", String(TRAJETORIA.length - 1 - i));
  };

  return (
    <>
      <div
        ref={estrada}
        data-revelar
        className="noite relative mb-8 aspect-[2/1] border lg:aspect-[3/1]"
        role="img"
        aria-label="Ilustração: sob a Via Láctea, um viajante de capa e capuz, com cajado e uma lanterna acesa balançando na mão, anda por uma estrada de 2020 a 2026 conforme a página rola, acendendo o lampião de cada marco da trajetória listada abaixo, rumo a um castelo no fim do caminho."
      >
        <AsciiCanvas cena="estrada" imagem="/cenas/estrada.webp" grades={GRADE_ESTRADA} figuras={FIGURAS} fps={30} revelar={0.3} rolagem interativa />
        <span className="dica pointer-events-none absolute right-3 bottom-2 text-caption text-muted">role a página</span>
      </div>
      <ol className="border-t border-l">
        {TRAJETORIA.map((t, i) => (
          <li
            key={`${t.quando}-${t.titulo}`}
            tabIndex={0}
            onPointerEnter={() => focar(i)}
            onPointerLeave={() => focar(null)}
            onFocus={() => focar(i)}
            onBlur={() => focar(null)}
            className="surgir grid items-baseline gap-2 border-r border-b bg-paper p-4 md:grid-cols-[10rem_1fr] md:gap-6"
          >
            <span className="text-caption font-stretch-condensed tabular-nums text-muted">{t.quando}</span>
            <p>
              <span className="font-semibold">{t.titulo}.</span> <span className="text-muted">{t.texto}</span>
            </p>
          </li>
        ))}
      </ol>
    </>
  );
};

export default Trajetoria;
