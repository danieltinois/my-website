import AsciiCanvas from "@/src/components/Ascii/AsciiCanvas";
import ContributionStats from "@/src/components/ContributionStats";
import Decifrar from "@/src/components/Decifrar";
import EmailCta from "@/src/components/EmailCta";
import { ESPECIFICACOES, LINKS, PERFIL } from "@/src/data/site";

// A primeira tela: o castelo à noite em ASCII, com quem eu sou, o que faço e como falar
// comigo por cima do céu (no desktop) ou acima da cena (no celular). É sempre noite aqui,
// inclusive no tema claro (.noite).
//
// A cena vem de uma imagem (public/cenas/castelo.webp) e fica presa na tela enquanto a pessoa
// rola por um trecho alto ([data-revelar]): começa com poucos caracteres grandes e termina com
// milhares de caracteres pequenos, quase uma foto. Sem movimento, ela aparece inteira de uma vez.

// grade máxima de cada tamanho de tela; a revelação começa em 15% dela
const GRADES = [
  { mq: "(min-width: 1280px)", cols: 360, rows: 0 },
  { mq: "(min-width: 1024px)", cols: 300, rows: 0 },
  { mq: "(min-width: 640px)", cols: 220, rows: 0 },
  { mq: "all", cols: 120, rows: 0 },
];

const Hero = () => {
  const [primeiro, ...resto] = PERFIL.nome.split(" ");

  return (
    <section aria-labelledby="hero-nome" className="noite -mx-6 px-6 pb-16 lg:-mx-12 lg:px-12 lg:pb-24">
      <div className="relative lg:grid lg:grid-cols-[minmax(0,1fr)]">
        {/* no desktop texto e cena dividem a mesma célula da grade: o texto fica preso sobre o céu
            dentro da altura do bloco da cena, então os dois saem juntos (abaixo de lg o texto é
            só o primeiro item do fluxo) */}
        <div className="relative z-10 pt-8 lg:pointer-events-none lg:col-start-1 lg:row-start-1 lg:sticky lg:top-32 lg:self-start">
          <div className="max-w-measure lg:pointer-events-auto lg:max-w-[34rem]">
            <h1 id="hero-nome" className="text-display-sm md:text-display">
              <span className="block">
                <Decifrar texto={primeiro} />
              </span>
              <span className="block">
                <Decifrar texto={resto.join(" ")} atraso={250} />
              </span>
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
        </div>

        <div data-revelar className="mt-8 h-[200svh] motion-reduce:h-auto lg:col-start-1 lg:row-start-1 lg:mt-0 lg:h-[260svh]">
          <div
            className="sticky top-24 -mx-6 h-[calc(100svh-6rem)] lg:-mx-12"
            role="img"
            aria-label="Cena em ASCII quase realista: um castelo iluminado sobre um penhasco à noite, com uma cachoeira caindo num lago que reflete a lua cheia, floresta de pinheiros ao redor e, de vez em quando, um dragão cruzando o céu. Ao rolar a página, a cena ganha cada vez mais caracteres e detalhe."
          >
            <AsciiCanvas cena="castelo" imagem="/cenas/castelo.webp" grades={GRADES} revelar={0.15} interativa />
            <span className="pointer-events-none absolute right-6 bottom-2 left-6 text-right text-caption text-muted lg:right-12">
              role para revelar<span className="hidden sm:inline"> · clique no céu ou no lago</span>
            </span>
          </div>
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
