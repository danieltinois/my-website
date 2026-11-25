import AsciiCanvas from "@/src/components/Ascii/AsciiCanvas";
import { dadosCastelo } from "@/src/components/Ascii/cenas";
import ContributionStats from "@/src/components/ContributionStats";
import EmailCta from "@/src/components/EmailCta";
import snapshot from "@/src/data/contributions.json";
import { ESPECIFICACOES, LINKS, PERFIL } from "@/src/data/site";
import { formatNumber, type Snapshot } from "@/src/lib/contributions";

// A primeira tela: o castelo à noite em ASCII, com quem eu sou, o que faço e como falar
// comigo por cima do céu (no desktop) ou acima da cena (no celular). É sempre noite aqui,
// inclusive no tema claro (.noite).

// modo denso: muitas células pequenas, como uma imagem feita de caracteres
const GRADES = [
  { mq: "(min-width: 1024px)", cols: 260, rows: 80 },
  { mq: "(min-width: 640px)", cols: 180, rows: 66 },
  { mq: "all", cols: 96, rows: 52 },
];

const Hero = () => {
  const [primeiro, ...resto] = PERFIL.nome.split(" ");
  const dados = dadosCastelo(snapshot as Snapshot);

  return (
    <section aria-labelledby="hero-nome" className="noite -mx-6 px-6 pt-8 pb-16 lg:-mx-12 lg:px-12 lg:pb-24">
      <div className="relative">
        <div className="relative max-w-measure lg:absolute lg:top-12 lg:left-0 lg:z-10 lg:max-w-[34rem]">
          <h1 id="hero-nome" className="text-display-sm md:text-display">
            <span className="block">{primeiro}</span>
            <span className="block">{resto.join(" ")}</span>
          </h1>
          <p className="mt-6 text-lead font-semibold text-balance">{PERFIL.cargo}</p>
          <p className="mt-3 text-muted">{PERFIL.resumo}</p>
          <div className="mt-6">
            <EmailCta />
          </div>
          <div className="mt-4 flex gap-6 text-caption">
            <a href={LINKS.github}>github</a>
            <a href={LINKS.linkedin}>linkedin</a>
          </div>
        </div>

        <div
          className="relative mt-8 aspect-square sm:aspect-[3/2] lg:mt-0 lg:aspect-[7/4]"
          role="img"
          aria-label={`Cena em ASCII: um castelo à noite, com tochas, bandeiras e um cavaleiro na muralha. As montanhas atrás dele são as ${formatNumber(snapshot.total)} contribuições no GitHub dos últimos 12 meses, e uma fogueira marca a semana em que começaram três projetos.`}
        >
          <AsciiCanvas cena="castelo" dados={dados} grades={GRADES} interativa />
          <span className="pointer-events-none absolute right-0 bottom-1 text-caption text-muted">
            passe o mouse e clique no céu ou no lago
          </span>
        </div>
      </div>

      <div className="mt-8">
        <ContributionStats />
      </div>

      <dl className="mt-12 grid grid-cols-2 border-t border-l md:grid-cols-3 xl:grid-cols-6">
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
