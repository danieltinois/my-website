import Escrita from "@/src/components/Escrita";
import type { Projeto, Textos } from "@/src/data/site";

// card de projeto: uma caixa de 1px com o marcador [1.1] no alto, o estudo de caso à esquerda e a
// grade de parâmetros à direita. O resumo se escreve palavra por palavra ao entrar na tela.
const Project = ({ projeto, n, rotulos }: { projeto: Projeto; n: string; rotulos: Textos["ui"]["projeto"] }) => {
  const repo = projeto.codigo.replace("https://github.com/", "");

  return (
    <article id={projeto.id} aria-labelledby={`${projeto.id}-nome`} className="surgir scroll-mt-24 border bg-paper">
      <p className="border-b px-6 py-3 text-caption font-stretch-condensed tabular-nums text-muted lg:px-8">[{n}]</p>

      <div className="grid gap-8 p-6 lg:grid-cols-12 lg:p-8">
        <div className="lg:col-span-7">
          <h3 id={`${projeto.id}-nome`} className="text-h3">
            {projeto.nome}
          </h3>
          <Escrita texto={projeto.resumo} className="mt-2 max-w-measure text-lead" />

          <dl className="mt-8 max-w-measure space-y-6">
            {[
              { k: rotulos.problema, v: projeto.problema },
              { k: rotulos.comoFunciona, v: projeto.comoFunciona },
              { k: rotulos.dificil, v: projeto.dificil },
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
            { k: rotulos.estado, v: projeto.estado, largura: "sm:col-span-2" },
            { k: rotulos.papel, v: projeto.papel, largura: "" },
            { k: rotulos.stack, v: projeto.stack, largura: "sm:col-span-3" },
            {
              k: rotulos.codigo,
              v: (
                <a href={projeto.codigo} className="break-words">
                  {repo}
                </a>
              ),
              largura: "sm:col-span-3",
            },
          ].map((p) => (
            <div key={p.k} className={`border-r border-b p-3 ${p.largura}`}>
              <dt className="font-stretch-condensed text-muted">{p.k}</dt>
              <dd className="mt-1">{p.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
};

export default Project;
