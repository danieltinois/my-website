import AsciiCanvas from "@/src/components/Ascii/AsciiCanvas";
import Dica from "@/src/components/Ascii/Dica";
import type { NomeCena } from "@/src/components/Ascii/cenas";
import type { Projeto } from "@/src/data/site";

// cada projeto é um lugar do mundo medieval; a descrição vai para o leitor de tela. Cenas com
// personagens de foto levam as folhas deles (`figuras`, objeto fixo do módulo: o AsciiCanvas
// recarrega quando ele muda) e animam a 30 quadros por segundo; as outras ficam em 20.
const CENAS: Record<string, { cena: NomeCena; dica: string; descricao: string; figuras?: Record<string, string>; fps?: number }> = {
  devclean: {
    cena: "porao",
    dica: "clique para limpar de novo",
    descricao: "Ilustração: no porão, um velho encurvado varre devagar os três sacos de cache seguros até a carroça da Lixeira; o saco marcado para revisão fica.",
    figuras: { velho: "/cenas/figuras/velho.webp" },
    fps: 30,
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

// colunas máximas de cada tamanho de tela (as linhas seguem a proporção do banner: 3:1 no
// desktop, 2:1 no tablet e no celular); a cena começa com 25% delas e ganha detalhe conforme o
// banner sobe pela tela
const GRADE = [
  { mq: "(min-width: 1024px)", cols: 340, rows: 0 },
  { mq: "(min-width: 640px)", cols: 220, rows: 0 },
  { mq: "all", cols: 130, rows: 0 },
];

// card de projeto: a cena do projeto como banner no topo, o estudo de caso embaixo
const Project = ({ projeto, n }: { projeto: Projeto; n: string }) => {
  const repo = projeto.codigo.replace("https://github.com/", "");

  return (
    <article
      id={projeto.id}
      aria-labelledby={`${projeto.id}-nome`}
      className="surgir scroll-mt-24 border bg-paper"
    >
      <div className="noite relative border-b">
        <div data-revelar className="relative aspect-[2/1] lg:aspect-[3/1]">
          <div className="h-full" role="img" aria-label={CENAS[projeto.id].descricao}>
            <AsciiCanvas
              cena={CENAS[projeto.id].cena}
              imagem={`/cenas/${CENAS[projeto.id].cena}.webp`}
              figuras={CENAS[projeto.id].figuras}
              fps={CENAS[projeto.id].fps}
              grades={GRADE}
              revelar={0.25}
              interativa
            />
          </div>
          <p className="pointer-events-none absolute right-4 bottom-3 hidden text-caption text-muted sm:block">
            <span className="dica motion-reduce:hidden" aria-hidden="true">
              ilustração:{" "}
            </span>
            <Dica texto={CENAS[projeto.id].dica} />
          </p>
        </div>
        <span className="pointer-events-none absolute top-3 left-4 text-caption font-stretch-condensed tabular-nums text-muted">[{n}]</span>
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
