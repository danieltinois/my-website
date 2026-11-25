// Registro das cenas: o AsciiCanvas (cliente) escolhe a cena pelo nome, porque funções não
// passam de componentes de servidor para os de cliente. Todas são densas (imagem de luz feita
// de caracteres), menos as brasas do fundo, que são partículas soltas.

import { brasas } from "./brasas.ts";
import { castelo } from "./castelo.ts";
import { corvo } from "./corvo.ts";
import { escriba } from "./escriba.ts";
import { estrada } from "./estrada.ts";
import { porao } from "./porao.ts";
import { torre } from "./torre.ts";

export const CENAS = { castelo, porao, torre, escriba, estrada, corvo, brasas };

export type NomeCena = keyof typeof CENAS;
