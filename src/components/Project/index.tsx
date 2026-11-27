import type { Projeto } from "@/src/data/site";

// card de projeto: uma caixa de 1px com o marcador [1.1] no alto, o estudo de caso à esquerda e a
// grade de parâmetros à direita
const Project = ({ projeto, n }: { projeto: Projeto; n: string }) => {
  const repo = projeto.codigo.replace("https://github.com/", "");

  return (
    <article id={projeto.id} aria-labelledby={`${projeto.id}-nome`} className="surgir scroll-mt-24 border bg-paper">
      <p className="border-b px-6 py-3 text-caption font-stretch-condensed tabular-nums text-muted lg:px-8">[{n}]</p>

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
