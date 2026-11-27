import CopiarEmail from "@/src/components/CopiarEmail";
import EmailCta from "@/src/components/EmailCta";
import Hero from "@/src/components/Hero";
import Project from "@/src/components/Project";
import Section from "@/src/components/Section";
import SiteHeader, { SECOES } from "@/src/components/SiteHeader";
import Trajetoria from "@/src/components/Trajetoria";
import { idioma, LINKS, NOME, TEXTOS, type Idioma } from "@/src/data/site";

const [projetos, trajetoria, contato] = SECOES;

// A página inteira num idioma. O <html> é o mesmo para todos (pt-BR, no layout raiz), então o
// idioma da página vai no atributo lang deste contêiner, que leitores de tela e buscadores seguem.
const Pagina = ({ lang }: { lang: Idioma }) => {
  const t = TEXTOS[lang];

  return (
    <div lang={idioma(lang).html} className="mx-auto max-w-page px-6 lg:px-12">
      <a
        href="#conteudo"
        className="sr-only bg-ink px-4 py-2 text-paper focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-40"
      >
        {t.ui.pular}
      </a>

      <SiteHeader lang={lang} />

      <main id="conteudo" tabIndex={-1} className="outline-none">
        <Hero lang={lang} />

        <Section id={projetos.id} n={projetos.n} title={t.ui.titulos.projetos}>
          <div className="space-y-8">
            {t.projetos.map((p, i) => (
              <Project key={p.id} projeto={p} n={`${Number(projetos.n)}.${i + 1}`} rotulos={t.ui.projeto} />
            ))}
          </div>
        </Section>

        <Section id={trajetoria.id} n={trajetoria.n} title={t.ui.titulos.trajetoria}>
          <Trajetoria lang={lang} />
        </Section>

        <Section id={contato.id} n={contato.n} title={t.ui.titulos.contato}>
          {/* o fechamento: uma frase, um botão (o único em signal) e os atalhos */}
          <div className="surgir border p-6 sm:p-12 lg:p-16">
            <p className="text-h2">{t.contato.titulo}</p>
            <p className="mt-3 max-w-measure text-lead text-muted">{t.contato.texto}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <EmailCta />
              <CopiarEmail textos={t.ui.copiar} />
              <a href={LINKS.github}>github</a>
              <a href={LINKS.linkedin}>linkedin</a>
            </div>
          </div>
        </Section>
      </main>

      <footer className="flex flex-wrap justify-between gap-4 border-t py-6 text-caption text-muted">
        <span>
          {NOME.toLowerCase()}, {t.ui.cidade}
        </span>
        <a href="#" className="no-underline hover:underline">
          {t.ui.voltarTopo}
        </a>
      </footer>
    </div>
  );
};

export default Pagina;
