import localFont from "next/font/local";

// Martian Mono variável (peso 100–800, largura 75–112,5%), servida pelo next/font: preload no
// <head> e uma fonte de fallback com métricas ajustadas, para a troca não mover o layout (CLS).
export const mono = localFont({
  src: "../../node_modules/@fontsource-variable/martian-mono/files/martian-mono-latin-wdth-normal.woff2",
  weight: "100 800",
  style: "normal",
  display: "swap",
  variable: "--font-martian",
  declarations: [{ prop: "font-stretch", value: "75% 112.5%" }],
  fallback: ["ui-monospace", "Menlo", "monospace"],
});
