import type { CSSProperties } from "react";
import s from "./art.module.css";

// Uma arte por projeto, feita do próprio assunto dele. São ilustrações: o que cada projeto
// faz está escrito no card ao lado, e o leitor de tela ouve só a descrição curta.

const v = (vars: Record<string, string | number>) => vars as CSSProperties;

// saída no formato do DevClean; valores do exemplo do README do projeto
const CACHES = [
  { nome: "DerivedData  ", cheio: 11, tam: "18.7 GB", risco: "safe", varre: true },
  { nome: "gradle/caches", cheio: 4, tam: " 6.1 GB", risco: "safe", varre: true },
  { nome: "node_modules ", cheio: 2, tam: " 2.4 GB", risco: "safe", varre: true },
  { nome: "Pixel_8.avd  ", cheio: 6, tam: " 9.8 GB", risco: "review", varre: false },
];
const LARGURA = 12;

const DevCleanArt = () => (
  <div className={s.panel} aria-hidden="true">
    <div className={s.muted}>$ devclean scan --global</div>
    <div>{" "}</div>
    {CACHES.map((c, i) => (
      <div key={c.nome}>
        {c.nome}
        {"  "}
        <span className={s.bar}>
          <span className={s.faint}>{".".repeat(LARGURA)}</span>
          <span className={`${s.barFill} ${c.varre ? s.sweep : ""}`} style={v({ "--d": `${i * 0.5}s` })}>
            {"#".repeat(c.cheio)}
          </span>
        </span>
        {"  "}
        {c.tam}
        {"  "}
        <span className={s.muted}>{c.risco}</span>
      </div>
    ))}
    <div>{" "}</div>
    <div className={s.muted}>
      → só o que é safe vai para a Lixeira<span className={s.caret}>_</span>
    </div>
  </div>
);

const PIPELINE = "github ── webhook ── fila ── worker ── inbox";
const EVENTOS = [
  { d: "0s", x: "4%" },
  { d: "-1.6s", x: "38%" },
  { d: "-3.2s", x: "72%" },
];

const PatoArt = () => (
  <div className={s.panel} aria-hidden="true">
    {/* a caixa de entrada ainda não existe: o "?" marca o próximo marco */}
    <div className={s.muted}>{PIPELINE}?</div>
    <div className={s.track}>
      {EVENTOS.map((e) => (
        <span key={e.d} className={s.lane} style={v({ "--d": e.d, "--x": e.x })}>
          <span>●</span>
        </span>
      ))}
      <span className={`${s.lane} ${s.dup}`} style={v({ "--d": "-0.8s", "--x": "26%" })}>
        <span>○ dup</span>
      </span>
    </div>
    <div>{" "}</div>
    <div>
      7f3a1c  push          <span className={s.muted}>ok</span>
    </div>
    <div>
      7f3a1c  push          <span className={s.muted}>dup, descartada</span>
    </div>
    <div>
      91c2e0  pull_request  <span className={s.muted}>ok</span>
    </div>
    <div>
      b44d09  workflow_run  <span className={s.muted}>ok</span>
      <span className={s.caret}>_</span>
    </div>
  </div>
);

// de cima para baixo na ordem do perfil (from) e depois na ordem de aderência à vaga (to)
const EXPERIENCIAS = [
  { linha: "plugins minecraft   java                 0/3", from: 0, to: 2, fora: true },
  { linha: "swift, integrações  react flutter        2/3", from: 1, to: 1, fora: false },
  { linha: "verzel, pleno       react node flutter   3/3", from: 2, to: 0, fora: false },
];

const ResumeArt = () => (
  <div className={s.panel} aria-hidden="true">
    <div className={s.muted}>vaga: react, node, flutter</div>
    <div className={s.faint}>{"─".repeat(44)}</div>
    <div className={s.rows}>
      {EXPERIENCIAS.map((e) => (
        <div
          key={e.linha}
          className={s.row}
          style={v({ "--from": e.from, "--to": e.to, "--dim": e.fora ? 0.35 : 1 })}
        >
          {e.linha}
        </div>
      ))}
    </div>
    <div className={s.faint}>{"─".repeat(44)}</div>
    <div className={s.muted}>
      → curriculo-react.pdf  A4, legível por ATS<span className={s.caret}>_</span>
    </div>
  </div>
);

const ARTES: Record<string, React.ReactNode> = {
  devclean: <DevCleanArt />,
  "pato-commit": <PatoArt />,
  "resume-tailor": <ResumeArt />,
};

// descrição para leitor de tela; role="img" também tira os caracteres decorativos da checagem de contraste
const DESCRICOES: Record<string, string> = {
  devclean: "Ilustração: o DevClean lista caches de ferramentas de dev e move para a Lixeira só os que são seguros.",
  "pato-commit": "Ilustração: eventos do GitHub passam por webhook, fila e worker; a entrega repetida é descartada no webhook.",
  "resume-tailor": "Ilustração: experiências reordenadas pela aderência a uma vaga de React, Node e Flutter.",
};

export const ProjectArt = ({ id }: { id: string }) => (
  <div className={s.frame} role="img" aria-label={DESCRICOES[id]}>
    {ARTES[id]}
  </div>
);
