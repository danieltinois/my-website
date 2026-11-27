"use client";

import { useEffect, useRef, useState } from "react";
import { EMAIL, type Textos } from "@/src/data/site";

// Copiar o e-mail, ao lado do botão dele: a palavra vira uma carta em ASCII que se dobra (três
// quadros, ~450 ms) e então "copiado", por 1,5 s. O aviso vai também para o leitor de tela
// (aria-live), e o nome do botão fica o rótulo ("copiar e-mail") enquanto a palavra muda. Sem a área de
// transferência (permissão negada, página fora de https), diz que não deu; o link mailto ao lado
// continua valendo. Com movimento reduzido, sem a dobra: direto "copiado".
const DOBRA = ["[==]", "[--]", "[\\/]"];
const QUADRO = 150; // ms de cada quadro da dobra
const AVISO = 1500;

type Estado = { quadro: number } | { aviso: string } | null;

const CopiarEmail = ({ textos }: { textos: Textos["ui"]["copiar"] }) => {
  const [estado, setEstado] = useState<Estado>(null);
  const relogios = useRef<number[]>([]);
  const limpar = () => {
    relogios.current.forEach(clearTimeout);
    relogios.current = [];
  };
  useEffect(() => limpar, []);
  const depois = (ms: number, f: () => void) => relogios.current.push(window.setTimeout(f, ms));

  const copiar = async () => {
    limpar();
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      setEstado({ aviso: textos.falhou });
      depois(AVISO * 2, () => setEstado(null));
      return;
    }
    const n = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : DOBRA.length;
    for (let k = 0; k < n; k++) depois(k * QUADRO, () => setEstado({ quadro: k }));
    depois(n * QUADRO, () => setEstado({ aviso: textos.copiado }));
    depois(n * QUADRO + AVISO, () => setEstado(null));
  };

  const texto = estado === null ? textos.acao : "quadro" in estado ? DOBRA[estado.quadro] : estado.aviso;
  return (
    <>
      {/* largura mínima: a palavra muda sem empurrar os links ao lado */}
      <button type="button" onClick={copiar} aria-label={textos.rotulo} className={`min-w-[7ch] text-left ${estado ? "cursor-pointer" : "link"}`}>
        <span aria-hidden="true">{texto}</span>
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {estado && "aviso" in estado ? estado.aviso : ""}
      </span>
    </>
  );
};

export default CopiarEmail;
