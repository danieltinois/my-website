// Registro das cenas: o AsciiCanvas (cliente) escolhe a cena pelo nome, porque funções não
// passam de componentes de servidor para os de cliente. São duas, ambas imagens de luz feitas de
// caracteres: o castelo do hero e a vela do fechamento.

import { castelo } from "./castelo.ts";
import { vela } from "./vela.ts";

export const CENAS = { castelo, vela };

export type NomeCena = keyof typeof CENAS;
