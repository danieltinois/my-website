// A anotação do campo de contribuições da home. Aparece só enquanto a data estiver dentro
// da janela de 12 meses do snapshot; depois disso some sozinha.
// O sistema permite uma única marca em signal no campo (docs/design.md, cor).

export interface Marca {
  de: string; // YYYY-MM-DD
  ate: string;
  texto: string;
}

export const MARCA: Marca = {
  de: "2026-09-24",
  ate: "2026-09-29",
  texto: "Começam DevClean, Pato Commit e resume-tailor.",
};
