import ContributionCurve from "@/src/components/ContributionCurve";
import EmailCta from "@/src/components/EmailCta";
import Params from "@/src/components/Params";
import { ESPECIFICACOES, LINKS, PERFIL } from "@/src/data/site";

// a capa da ficha: quem é, o que faz e como falar, antes de qualquer rolagem
const Hero = () => (
  <section aria-labelledby="hero-nome" className="pt-12 pb-16 lg:pt-16 lg:pb-24">
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
      <div className="lg:col-span-7">
        <h1
          id="hero-nome"
          className="text-display-sm font-stretch-extra-condensed md:text-display"
        >
          {PERFIL.nome}
        </h1>
        <p className="mt-6 text-h3">{PERFIL.cargo}</p>
        <p className="mt-4 max-w-measure text-lead">{PERFIL.resumo}</p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
          <EmailCta />
          <a href={LINKS.github}>GitHub</a>
          <a href={LINKS.linkedin}>LinkedIn</a>
        </div>
      </div>

      <div className="lg:col-span-5 lg:pt-4">
        <Params rows={ESPECIFICACOES} caption="Especificações" />
      </div>
    </div>

    <div className="mt-16 lg:mt-24">
      <ContributionCurve />
    </div>
  </section>
);

export default Hero;
