import { notFound } from "next/navigation";
import Pagina from "@/src/components/Pagina";
import { ehIdioma, IDIOMAS } from "@/src/data/site";
import { metadados } from "@/src/lib/metadados";

// as páginas em inglês, espanhol e japonês (/en, /es, /ja), geradas na build; o português fica
// na raiz (src/app/page.tsx). Qualquer outro segmento é 404.
export const dynamicParams = false;

export const generateStaticParams = () => IDIOMAS.filter((i) => i.id !== "pt").map((i) => ({ lang: i.id }));

export const generateMetadata = async ({ params }: PageProps<"/[lang]">) => {
  const { lang } = await params;
  return ehIdioma(lang) ? metadados(lang) : {};
};

export default async function PaginaIdioma({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!ehIdioma(lang) || lang === "pt") notFound();
  return <Pagina lang={lang} />;
}
