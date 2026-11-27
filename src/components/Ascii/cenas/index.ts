// Registro das cenas: o AsciiCanvas (cliente) escolhe a cena pelo nome, porque funções não
// passam de componentes de servidor para os de cliente. Hoje o site tem uma cena só, o castelo do
// hero (imagem de luz feita de caracteres).

import { castelo } from "./castelo.ts";

export const CENAS = { castelo };

export type NomeCena = keyof typeof CENAS;
