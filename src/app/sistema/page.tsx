import type { Metadata } from "next";
import ContributionCurve from "@/src/components/ContributionCurve";

// amostra do sistema de design (docs/design.md). Página de trabalho: não indexa.
export const metadata: Metadata = {
  title: "Sistema · Daniel Tinois",
  robots: { index: false, follow: false },
};

const TYPE = [
  { token: "text-display", sample: "Daniel Tinois", cls: "text-display font-stretch-extra-condensed" },
  { token: "text-display-sm", sample: "Daniel Tinois", cls: "text-display-sm font-stretch-extra-condensed" },
  { token: "text-h2", sample: "Projetos", cls: "text-h2 font-stretch-semi-condensed" },
  { token: "text-h3", sample: "DevClean", cls: "text-h3" },
  {
    token: "text-lead",
    sample: "Escrevo software que não perde evento, não inventa dado e não apaga o que não deve.",
    cls: "text-lead",
  },
  {
    token: "text-body",
    sample:
      "O mesmo motor em TypeScript roda na CLI e dentro do app SwiftUI, no macOS e no iPhone, via JavaScriptCore.",
    cls: "text-body",
  },
  { token: "text-caption", sample: "Figura 1. Contribuições por semana nos últimos 12 meses.", cls: "text-caption" },
];

const COLORS = [
  { token: "paper", cls: "bg-paper", light: "#FFFFFF", dark: "#1B1E22" },
  { token: "plate", cls: "bg-plate", light: "#F1F2F3", dark: "#24282D" },
  { token: "rule", cls: "bg-rule", light: "#C9CDD2", dark: "#454B53" },
  { token: "muted", cls: "bg-muted", light: "#575D66", dark: "#A2A8B0" },
  { token: "ink", cls: "bg-ink", light: "#15181C", dark: "#ECEEF0" },
  { token: "signal", cls: "bg-signal", light: "#F25400", dark: "#FF6A13" },
];

// classes escritas por extenso para o Tailwind gerar cada uma
const SPACING = [
  { step: "1", px: 4, cls: "w-1" },
  { step: "2", px: 8, cls: "w-2" },
  { step: "3", px: 12, cls: "w-3" },
  { step: "4", px: 16, cls: "w-4" },
  { step: "6", px: 24, cls: "w-6" },
  { step: "8", px: 32, cls: "w-8" },
  { step: "12", px: 48, cls: "w-12" },
  { step: "16", px: 64, cls: "w-16" },
  { step: "24", px: 96, cls: "w-24" },
  { step: "32", px: 128, cls: "w-32" },
];

const PARAMS = [
  { k: "Problema", v: "Caches de ferramentas de dev somam dezenas de GB e limpadores genéricos não sabem o que dá pra recriar." },
  { k: "Papel", v: "Projeto solo." },
  { k: "Estado", v: "Em uso no meu Mac." },
  { k: "Stack", v: "TypeScript, Bun, Swift, SwiftUI, JavaScriptCore" },
  { k: "Código", v: "github.com/danieltinois/dev-macos-clean" },
];

const Section = ({ n, title, children }: { n: string; title: string; children: React.ReactNode }) => (
  <section className="grid gap-4 border-t py-16 lg:grid-cols-12 lg:gap-8">
    <p className="text-caption font-stretch-condensed tabular-nums text-muted lg:col-span-3">{n}</p>
    <div className="lg:col-span-9">
      <h2 className="text-h2 font-stretch-semi-condensed">{title}</h2>
      <div className="mt-8">{children}</div>
    </div>
  </section>
);

export default function Sistema() {
  return (
    <main className="mx-auto max-w-page px-6 pb-24 lg:px-12">
      <header className="flex items-baseline justify-between gap-4 py-6 text-caption">
        <span>Daniel Tinois, dev full stack</span>
        <span className="font-stretch-condensed tabular-nums text-muted">Sistema, rev. nov 2026</span>
      </header>

      <Section n="1" title="Tipografia">
        <dl className="divide-y border-y">
          {TYPE.map((t) => (
            <div key={t.token} className="grid gap-2 py-6 md:grid-cols-[10rem_1fr] md:gap-8">
              <dt className="text-caption font-stretch-condensed text-muted">{t.token}</dt>
              <dd className={`${t.cls} max-w-measure`}>{t.sample}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 max-w-measure text-caption text-muted">
          Archivo, pesos 400 e 600. Larguras: 62,5% no nome, 75% em rótulos e números, 87,5% em títulos de seção, 100% no resto.
        </p>
      </Section>

      <Section n="2" title="Cor">
        <ul className="grid grid-cols-2 gap-6 md:grid-cols-3">
          {COLORS.map((c) => (
            <li key={c.token}>
              <div className={`${c.cls} h-16 border`} />
              <p className="mt-2 text-caption">{c.token}</p>
              <p className="text-caption font-stretch-condensed tabular-nums text-muted">
                claro {c.light}, escuro {c.dark}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-12 flex flex-wrap items-center gap-6">
          <a
            href="mailto:me@danieltinois.dev"
            className="inline-block bg-signal px-6 py-3 text-lead font-semibold text-on-signal no-underline"
          >
            me@danieltinois.dev
          </a>
          <a href="https://github.com/danieltinois">GitHub</a>
          <a href="https://www.linkedin.com/in/danieltinois">LinkedIn</a>
        </div>
        <p className="mt-6 max-w-measure text-caption text-muted">
          O laranja só aparece no CTA de e-mail e em no máximo dois dados, como marca gráfica. Nunca como texto, hover ou foco.
        </p>
      </Section>

      <Section n="3" title="Espaço, linha, raio, sombra">
        <ul className="space-y-3">
          {SPACING.map((s) => (
            <li key={s.step} className="flex items-center gap-4 text-caption tabular-nums">
              <span className="w-12 font-stretch-condensed text-muted">{s.step}</span>
              <span className={`${s.cls} h-3 bg-ink`} />
              <span className="font-stretch-condensed text-muted">{s.px}px</span>
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-measure text-caption text-muted">
          Uma espessura de linha: 1px em rule. Raio 0. Sem sombra. Foco: contorno de 2px em ink.
        </p>
      </Section>

      <Section n="4" title="Motivos">
        <h3 className="text-h3">
          <span className="mr-4 font-stretch-condensed font-regular tabular-nums text-muted">2.1</span>
          DevClean
        </h3>
        <p className="mt-3 max-w-measure text-lead">
          Descobre quais ferramentas de dev estão enchendo o disco do Mac e limpa só o que é seguro.
        </p>

        <table className="mt-8 w-full max-w-measure border-collapse text-left">
          <caption className="sr-only">Parâmetros do DevClean</caption>
          <tbody>
            {PARAMS.map((p) => (
              <tr key={p.k} className="border-t last:border-b">
                <th scope="row" className="w-32 py-3 pr-6 align-top text-caption font-regular font-stretch-condensed text-muted">
                  {p.k}
                </th>
                <td className="py-3 align-top">{p.v}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <figure className="mt-12">
          <div className="border bg-plate">
            <svg viewBox="0 0 520 160" className="block h-auto w-full" aria-hidden="true">
              {[32, 64, 96, 128].map((y) => (
                <line key={y} x1="0" x2="520" y1={y} y2={y} className="stroke-rule" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              ))}
              <polyline
                points="0,120 40,112 80,124 120,96 160,104 200,88 240,100 280,72 320,84 360,40 400,56 440,64 480,48 520,60"
                fill="none"
                className="stroke-ink"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
              <circle cx="360" cy="40" r="4" className="fill-signal" />
            </svg>
          </div>
          <figcaption className="mt-3 text-caption text-muted">
            Figura 1. Exemplo de figura: curva de dados em ink, grade em rule, um marcador em signal.
          </figcaption>
        </figure>
      </Section>

      <Section n="5" title="Peça-assinatura">
        <ContributionCurve />
      </Section>
    </main>
  );
}
