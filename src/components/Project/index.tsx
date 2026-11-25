import Params from "@/src/components/Params";
import type { Projeto } from "@/src/data/site";

// mini estudo de caso: o problema, como funciona, o que tem de difícil e a tabela da peça
const Project = ({ projeto, n, figura }: { projeto: Projeto; n: string; figura?: React.ReactNode }) => {
  const repo = projeto.codigo.replace("https://", "");

  return (
    <article id={projeto.id} aria-labelledby={`${projeto.id}-nome`} className="scroll-mt-16">
      <h3 id={`${projeto.id}-nome`} className="text-h3">
        <span className="mr-4 font-regular font-stretch-condensed tabular-nums text-muted">{n}</span>
        {projeto.nome}
      </h3>
      <p className="mt-3 max-w-measure text-lead">{projeto.resumo}</p>

      <div className="mt-8 grid gap-8 xl:grid-cols-9">
        <dl className="max-w-measure space-y-6 xl:col-span-5">
          {[
            { k: "Problema", v: projeto.problema },
            { k: "Como funciona", v: projeto.comoFunciona },
            { k: "O difícil", v: projeto.dificil },
          ].map(({ k, v }) => (
            <div key={k}>
              <dt className="text-caption font-stretch-condensed text-muted">{k}</dt>
              <dd className="mt-1">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="xl:col-span-4">
          <Params
            caption={`Parâmetros do ${projeto.nome}`}
            rows={[
              ...projeto.parametros,
              {
                k: "Código",
                v: (
                  <a href={projeto.codigo} className="break-words">
                    {repo}
                  </a>
                ),
              },
            ]}
          />
        </div>
      </div>

      {figura && <div className="mt-12">{figura}</div>}
    </article>
  );
};

export default Project;
