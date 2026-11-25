import AsciiCanvas from "@/src/components/Ascii/AsciiCanvas";
import EmailCta from "@/src/components/EmailCta";
import Hero from "@/src/components/Hero";
import Project from "@/src/components/Project";
import Section from "@/src/components/Section";
import SiteHeader, { SECOES } from "@/src/components/SiteHeader";
import { LINKS, PERFIL, PROJETOS, TRAJETORIA } from "@/src/data/site";

const [projetos, trajetoria, contato] = SECOES;

// modo denso: a proporção de cada grade bate com o aspect-ratio do contêiner
const GRADE_ESTRADA = [
  { mq: "(min-width: 1024px)", cols: 280, rows: 32 },
  { mq: "all", cols: 120, rows: 22 },
];
const GRADE_CORVO = [
  { mq: "(min-width: 640px)", cols: 150, rows: 37 },
  { mq: "all", cols: 100, rows: 25 },
];
const CELULA_BRASAS = { w: 14, h: 24 };

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
          <div
            className="noite relative mb-8 aspect-[3/1] border lg:aspect-[19/4]"
            role="img"
            aria-label="Ilustração: um viajante anda por uma estrada de 2020 a 2026 conforme a página rola, acendendo o lampião de cada marco da trajetória listada abaixo."
          >
            <AsciiCanvas cena="estrada" grades={GRADE_ESTRADA} rolagem interativa />
            <span className="pointer-events-none absolute right-3 bottom-2 text-caption text-muted">role a página</span>
          </div>
          <ol className="border-t border-l">
            {TRAJETORIA.map((t) => (
              <li
                key={`${t.quando}-${t.titulo}`}
                className="grid items-baseline gap-2 border-r border-b bg-paper p-4 md:grid-cols-[10rem_1fr] md:gap-6"
              >
                <span className="text-caption font-stretch-condensed tabular-nums text-muted">{t.quando}</span>
                <p>
                  <span className="font-semibold">{t.titulo}.</span> <span className="text-muted">{t.texto}</span>
                </p>
              </li>
            ))}
          </ol>
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
              className="noite relative aspect-[11/5] border"
              role="img"
              aria-label="Ilustração: um corvo-mensageiro chega voando com uma carta e a deixa num poste com a placa mail."
            >
              <AsciiCanvas cena="corvo" grades={GRADE_CORVO} interativa />
              <span className="pointer-events-none absolute right-3 bottom-2 text-caption text-muted">clique para soltar o corvo</span>
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
