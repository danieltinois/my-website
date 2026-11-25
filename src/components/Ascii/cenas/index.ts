// Registro das cenas: o AsciiCanvas (cliente) escolhe a cena pelo nome, porque funções não
// passam de componentes de servidor para os de cliente. Todas são densas (imagem de luz feita
// de caracteres), menos as brasas do fundo, que são partículas soltas.

import { MARCA } from "../../../data/curva.ts";
import { toWeeks, type Snapshot } from "../../../lib/contributions.ts";
import { brasas } from "./brasas.ts";
import { castelo, type DadosCastelo } from "./castelo.ts";
import { corvo } from "./corvo.ts";
import { escriba } from "./escriba.ts";
import { estrada } from "./estrada.ts";
import { porao } from "./porao.ts";
import { torre } from "./torre.ts";

export const CENAS = { castelo, porao, torre, escriba, estrada, corvo, brasas };

export type NomeCena = keyof typeof CENAS;

// as semanas do snapshot e o índice da semana marcada (fogueira)
export const dadosCastelo = (snapshot: Snapshot): DadosCastelo => {
  const weeks = toWeeks(snapshot.days);
  return {
    semanas: weeks.map((w) => w.count),
    marca: weeks.findIndex((w, i) => MARCA.de >= w.start && MARCA.de < (weeks[i + 1]?.start ?? "9999")),
  };
};
