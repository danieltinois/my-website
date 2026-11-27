import type { Metadata } from "next";
import { IDIOMAS, idioma, NOME, SITE_URL, TEXTOS, type Idioma } from "@/src/data/site";

// Metadados de uma página num idioma: título, descrição, canonical, as versões nos outros idiomas
// (hreflang) e o Open Graph com o locale certo. A imagem de compartilhamento é a mesma para todos
// (src/app/opengraph-image.tsx).
export const metadados = (lang: Idioma): Metadata => {
  const { titulo, descricao } = TEXTOS[lang].meta;
  const { caminho, og } = idioma(lang);
  return {
    metadataBase: new URL(SITE_URL),
    title: titulo,
    description: descricao,
    alternates: {
      canonical: caminho,
      languages: { ...Object.fromEntries(IDIOMAS.map((i) => [i.html, i.caminho])), "x-default": "/" },
    },
    openGraph: {
      title: titulo,
      description: descricao,
      url: caminho,
      siteName: NOME,
      locale: og,
      alternateLocale: IDIOMAS.filter((i) => i.id !== lang).map((i) => i.og),
      type: "website",
    },
    twitter: { card: "summary_large_image", title: titulo, description: descricao },
  };
};
