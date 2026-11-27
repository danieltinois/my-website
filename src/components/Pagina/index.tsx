import AsciiCanvas from "@/src/components/Ascii/AsciiCanvas";
import Dica from "@/src/components/Ascii/Dica";
import Faiscas from "@/src/components/Aconchego/Faiscas";
import Lampiao from "@/src/components/Aconchego/Lampiao";
import VagaLumes from "@/src/components/Aconchego/VagaLumes";
import CopiarEmail from "@/src/components/CopiarEmail";
import Decifrar from "@/src/components/Decifrar";
import EmailCta from "@/src/components/EmailCta";
import Hero from "@/src/components/Hero";
import Navegacao from "@/src/components/Navegacao";
import Project from "@/src/components/Project";
import Section from "@/src/components/Section";
import SiteHeader, { SECOES } from "@/src/components/SiteHeader";
import Trajetoria from "@/src/components/Trajetoria";
import VoltarTopo from "@/src/components/VoltarTopo";
import { idioma, LINKS, NOME, TEXTOS, type Idioma } from "@/src/data/site";

const [projetos, trajetoria, contato] = SECOES;

// colunas máximas da vela por tamanho de tela; a revelação começa em 25% delas
const GRADE_VELA = [
  { mq: "(min-width: 640px)", cols: 220 },
  { mq: "all", cols: 130 },
];

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

      {/* aconchego: vaga-lumes atrás de tudo; o lampião e as faíscas do cursor por cima */}
      <VagaLumes />
      <Lampiao />
      <Faiscas />

      {/* navegação animada dentro da página e o botão flutuante de voltar ao topo */}
      <Navegacao />
      <VoltarTopo rotulo={t.ui.topo} />

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
          {/* o fechamento: uma frase, um botão (o único em signal) e os atalhos, ao lado da vela acesa
              (no celular, a vela vem embaixo) */}
          <div className="surgir grid items-center gap-8 border p-6 sm:p-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12 lg:p-16">
            <div>
              <p className="text-h2">
                <Decifrar texto={t.contato.titulo} />
              </p>
              <p className="mt-3 max-w-measure text-lead text-muted">{t.contato.texto}</p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <EmailCta />
                <CopiarEmail textos={t.ui.copiar} />
                <a href={LINKS.github}>github</a>
                <a href={LINKS.linkedin}>linkedin</a>
              </div>
            </div>
            <div data-cena className="relative aspect-[4/3]">
              <div className="vinheta h-full" role="img" aria-label={t.ui.vela.cena}>
                <AsciiCanvas cena="vela" imagem="/cenas/vela.webp" grades={GRADE_VELA} revelar={0.25} interativa />
              </div>
              <p className="pointer-events-none absolute right-0 bottom-0 text-caption">
                <Dica texto={t.ui.vela.dica} className="hidden motion-safe:sm:inline" />
              </p>
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
