import ContributionField from "@/src/components/ContributionField";
import EmailCta from "@/src/components/EmailCta";
import { ESPECIFICACOES, LINKS, PERFIL } from "@/src/data/site";

// a primeira tela: quem é, o que faz e como falar à esquerda; metade da tela viva à direita
const Hero = () => {
  const [primeiro, ...resto] = PERFIL.nome.split(" ");

  return (
    <section aria-labelledby="hero-nome" className="pt-12 pb-16 lg:pt-16 lg:pb-24">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <h1 id="hero-nome" className="text-display-sm md:text-display">
            <span className="block">{primeiro}</span>
            <span className="block">{resto.join(" ")}</span>
          </h1>
          <p className="mt-8 text-lead font-semibold text-balance">{PERFIL.cargo}</p>
          <p className="mt-4 max-w-measure text-muted">{PERFIL.resumo}</p>
          <div className="mt-8">
            <EmailCta />
          </div>
          <div className="mt-4 flex gap-6 text-caption">
            <a href={LINKS.github}>github</a>
            <a href={LINKS.linkedin}>linkedin</a>
          </div>
        </div>

        <div className="min-w-0 lg:col-span-7">
          <ContributionField />
        </div>
      </div>

      <dl className="mt-16 grid grid-cols-2 border-t border-l md:grid-cols-3 xl:grid-cols-6">
        {ESPECIFICACOES.map((e) => (
          <div key={e.k} className="border-r border-b p-4">
            <dt className="text-caption font-stretch-condensed text-muted">{e.k.toLowerCase()}</dt>
            <dd className="mt-1 text-caption">{e.v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

export default Hero;
