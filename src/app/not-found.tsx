import type { Metadata } from "next";
import Link from "next/link";
import { NOME } from "@/src/data/site";

export const metadata: Metadata = {
  title: "Página não encontrada",
};

const NotFound = () => (
  <main id="conteudo" className="mx-auto max-w-page px-6 py-24 lg:px-12">
    <p className="text-caption font-stretch-condensed tabular-nums text-muted">erro 404</p>
    <h1 className="mt-4 text-h2 font-stretch-semi-condensed">Esta página não existe.</h1>
    <p className="mt-4 max-w-measure text-lead">
      O endereço pode ter mudado com o redesenho do site. Tudo o que havia aqui está na página inicial.
    </p>
    <p className="mt-8">
      <Link href="/">Ir para a página de {NOME}</Link>
    </p>
  </main>
);

export default NotFound;
