import AsciiCanvas from "@/src/components/Ascii/AsciiCanvas";
import Dica from "@/src/components/Ascii/Dica";
import EmailCta from "@/src/components/EmailCta";
import Hero from "@/src/components/Hero";
import Project from "@/src/components/Project";
import Section from "@/src/components/Section";
import SiteHeader, { SECOES } from "@/src/components/SiteHeader";
import Trajetoria from "@/src/components/Trajetoria";
import { LINKS, PERFIL, PROJETOS } from "@/src/data/site";

const [projetos, trajetoria, contato] = SECOES;

// colunas máximas de cada cena; as linhas seguem a proporção do contêiner e a cena ganha
// detalhe conforme sobe pela tela
const GRADE_CORVO = [
  { mq: "(min-width: 640px)", cols: 220, rows: 0 },
  { mq: "all", cols: 130, rows: 0 },
];
const CELULA_BRASAS = { w: 14, h: 24 };
const FIGURAS_CORVO = { corvo: "/cenas/figuras/corvo.webp" };

export default function Home() {
  return (
    <div className="mx-auto max-w-page px-6 lg:px-12">
      {/* brasas subindo atrás de tudo; só no tema escuro */}
      <div className="brasas pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
        <AsciiCanvas cena="brasas" celula={CELULA_BRASAS} rolagem global />
      </div>

      <SiteHeader />

      <main id="conteudo" tabIndex={-1} className="outline-none">
        <Hero />

        <Section id={projetos.id} n={projetos.n} title={projetos.titulo}>
          <div className="space-y-8">
            {PROJETOS.map((p, i) => (
              <Project key={p.id} projeto={p} n={`${Number(projetos.n)}.${i + 1}`} />
            ))}
          </div>
        </Section>

        <Section id={trajetoria.id} n={trajetoria.n} title={trajetoria.titulo}>
          <Trajetoria />
        </Section>

        <Section id={contato.id} n={contato.n} title={contato.titulo}>
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <p className="max-w-measure text-lead">O caminho mais rápido é o e-mail.</p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <EmailCta />
                <a href={LINKS.github}>github</a>
                <a href={LINKS.linkedin}>linkedin</a>
              </div>
            </div>
            <div
              data-revelar
              className="noite relative aspect-[11/5] border"
            >
              <div
                className="h-full"
                role="img"
                aria-label="Ilustração: sob uma lua cheia enorme, um corvo-mensageiro cruza o céu batendo as asas com uma carta no bico, pousa num poste com lampião, solta a carta na caixa de correio, olha em volta e vai embora."
              >
                <AsciiCanvas cena="corvo" imagem="/cenas/corvo.webp" grades={GRADE_CORVO} figuras={FIGURAS_CORVO} fps={30} revelar={0.3} interativa />
              </div>
              <p className="pointer-events-none absolute right-3 bottom-2">
                <Dica texto="clique para soltar o corvo" />
              </p>
            </div>
          </div>
        </Section>
      </main>

      <footer className="flex flex-wrap justify-between gap-4 border-t py-6 text-caption text-muted">
        <span>{PERFIL.nome.toLowerCase()}, são paulo</span>
        <a href="#" className="no-underline hover:underline">
          voltar ao topo
        </a>
      </footer>
    </div>
  );
}
