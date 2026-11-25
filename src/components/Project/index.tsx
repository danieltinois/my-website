import AsciiCanvas from "@/src/components/Ascii/AsciiCanvas";
import type { NomeCena } from "@/src/components/Ascii/cenas";
import type { Projeto } from "@/src/data/site";

// cada projeto é um lugar do mundo medieval; a descrição vai para o leitor de tela
const CENAS: Record<string, { cena: NomeCena; dica: string; descricao: string }> = {
  devclean: {
    cena: "porao",
    dica: "clique para limpar de novo",
    descricao: "Ilustração: no porão, um varredor leva só os sacos de cache seguros para a carroça da Lixeira; o saco marcado para revisão fica.",
  },
  "pato-commit": {
    cena: "torre",
    dica: "clique para enviar uma carta; dois cliques rápidos repetem a entrega",
    descricao: "Ilustração: pombos entregam cartas na torre do correio; cada entrega entra no registro, e a carta repetida queima no braseiro.",
  },
  "resume-tailor": {
    cena: "escriba",
    dica: "clique para trocar a vaga",
    descricao: "Ilustração: à luz de vela, as experiências do pergaminho se reordenam pela vaga e a pena escreve o currículo gerado.",
  },
};

// modo denso: banner 3:1 no desktop (300×54); 3:2 no tablet e no celular
const GRADE = [
  { mq: "(min-width: 1024px)", cols: 300, rows: 54 },
  { mq: "(min-width: 640px)", cols: 150, rows: 56 },
  { mq: "all", cols: 100, rows: 37 },
];

// card de projeto: a cena do projeto como banner no topo, o estudo de caso embaixo
const Project = ({ projeto, n }: { projeto: Projeto; n: string }) => {
  const repo = projeto.codigo.replace("https://github.com/", "");

  return (
    <article
      id={projeto.id}
      aria-labelledby={`${projeto.id}-nome`}
      className="scroll-mt-24 border bg-paper"
    >
      <div className="noite relative border-b">
        <div className="aspect-[3/2] lg:aspect-[3/1]" role="img" aria-label={CENAS[projeto.id].descricao}>
          <AsciiCanvas cena={CENAS[projeto.id].cena} grades={GRADE} interativa />
        </div>
        <span className="pointer-events-none absolute top-3 left-4 text-caption font-stretch-condensed tabular-nums text-muted">[{n}]</span>
        <span className="pointer-events-none absolute right-4 bottom-3 text-caption text-muted">
          ilustração: {CENAS[projeto.id].dica}
        </span>
      </div>

      <div className="grid gap-8 p-6 lg:grid-cols-12 lg:p-8">
        <div className="lg:col-span-7">
          <h3 id={`${projeto.id}-nome`} className="text-h3">
            {projeto.nome}
          </h3>
          <p className="mt-2 max-w-measure text-lead">{projeto.resumo}</p>

          <dl className="mt-8 max-w-measure space-y-6">
            {[
              { k: "problema", v: projeto.problema },
              { k: "como funciona", v: projeto.comoFunciona },
              { k: "o difícil", v: projeto.dificil },
            ].map(({ k, v }) => (
              <div key={k}>
                <dt className="text-caption font-stretch-condensed text-muted">{k}</dt>
                <dd className="mt-1 text-muted">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <dl className="grid content-start border-t border-l text-caption sm:grid-cols-3 lg:col-span-5 lg:mt-1">
          {[
            ...projeto.parametros,
            {
              k: "Código",
              v: (
                <a href={projeto.codigo} className="break-words">
                  {repo}
                </a>
              ),
            },
          ].map((p) => (
            <div
              key={p.k}
              className={`border-r border-b p-3 ${p.k === "Stack" || p.k === "Código" ? "sm:col-span-3" : ""} ${p.k === "Estado" ? "sm:col-span-2" : ""}`}
            >
              <dt className="font-stretch-condensed text-muted">{p.k.toLowerCase()}</dt>
              <dd className="mt-1">{p.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
};

export default Project;
