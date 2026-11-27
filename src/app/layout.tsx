import type { Metadata, Viewport } from "next";
import "./globals.css";
import { metadados } from "@/src/lib/metadados";
import { mono } from "./fonts";

// metadados do português (a raiz); as páginas de app/[lang] trocam pelos do idioma delas
export const metadata: Metadata = metadados("pt");

export const viewport: Viewport = {
  themeColor: "#0b0c0e",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // o idioma de cada página vai no contêiner dela (src/components/Pagina)
    <html lang="pt-BR" className={mono.variable}>
      <body>{children}</body>
    </html>
  );
}
