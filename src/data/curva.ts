// Anotações da curva de contribuições (Figura 1). Cada uma aparece só enquanto a data
// estiver dentro da janela de 12 meses do snapshot; depois disso some sozinha.
// O sistema permite no máximo uma anotação em signal na curva (docs/design.md, cor).

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
