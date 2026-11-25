import { ProjectArt } from "@/src/components/ProjectArt";
import type { Projeto } from "@/src/data/site";

// card de projeto: a arte do próprio projeto à esquerda, o estudo de caso à direita
const Project = ({ projeto, n }: { projeto: Projeto; n: string }) => {
  const repo = projeto.codigo.replace("https://github.com/", "");

  return (
    <article
      id={projeto.id}
      aria-labelledby={`${projeto.id}-nome`}
      className="grid scroll-mt-24 border lg:grid-cols-12"
    >
      <div className="flex flex-col justify-between gap-6 overflow-hidden border-b bg-plate p-6 lg:col-span-5 lg:border-r lg:border-b-0">
        <span className="text-caption font-stretch-condensed tabular-nums text-muted">[{n}]</span>
        <ProjectArt id={projeto.id} />
        <span className="text-caption text-muted">ilustração</span>
      </div>

      <div className="p-6 lg:col-span-7 lg:p-8">
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

        <dl className="mt-8 grid border-t border-l text-caption sm:grid-cols-3">
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
