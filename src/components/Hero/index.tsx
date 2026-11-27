import AsciiCanvas from "@/src/components/Ascii/AsciiCanvas";
import Dica from "@/src/components/Ascii/Dica";
import ContributionStats from "@/src/components/ContributionStats";
import Decifrar from "@/src/components/Decifrar";
import EmailCta from "@/src/components/EmailCta";
import { LINKS, NOME, TEXTOS, type Idioma } from "@/src/data/site";

// A primeira tela: o castelo à noite em ASCII, com quem eu sou, o que faço e como falar comigo
// por cima do céu (no desktop) ou acima da cena (no celular). É a única cena do site.
//
// A cena vem de uma imagem (public/cenas/castelo.webp) e fica presa na tela enquanto a pessoa rola
// por um trecho alto ([data-cena]): começa com poucos caracteres grandes e termina com milhares de
// caracteres pequenos, quase uma foto. O texto aparece inteiro desde o primeiro quadro. Sem
// movimento, a cena aparece inteira de uma vez e o trecho alto encolhe.
// As bordas do quadro dissolvem no fundo (.bordas) e, no desktop, um degradê escuro sai da
// esquerda por baixo do texto (.veu-hero), para ele não ficar sobre o ruído do céu.

// grade máxima de cada tamanho de tela; a revelação começa em 15% dela
const GRADES = [
  { mq: "(min-width: 1280px)", cols: 360 },
  { mq: "(min-width: 1024px)", cols: 300 },
  { mq: "(min-width: 640px)", cols: 220 },
  { mq: "all", cols: 120 },
];

const Hero = ({ lang }: { lang: Idioma }) => {
  const t = TEXTOS[lang];
  const [primeiro, ...resto] = NOME.split(" ");

  return (
    <section id="inicio" aria-labelledby="hero-nome" className="-mx-6 px-6 pb-16 lg:-mx-12 lg:px-12 lg:pb-24">
      <div className="relative lg:grid lg:grid-cols-[minmax(0,1fr)]">
        {/* no desktop texto e cena dividem a mesma célula da grade: o texto fica preso sobre o céu
            enquanto a cena se revela, e os dois saem juntos (abaixo de lg o texto vem antes) */}
        <div className="relative z-10 pt-8 lg:pointer-events-none lg:sticky lg:top-32 lg:col-start-1 lg:row-start-1 lg:self-start">
          <div className="max-w-measure lg:pointer-events-auto lg:max-w-[34rem]">
            <h1 id="hero-nome" className="text-display-sm md:text-display">
              <span className="block">
                <Decifrar texto={primeiro} />
              </span>
              <span className="block">
                <Decifrar texto={resto.join(" ")} atraso={250} />
              </span>
            </h1>
            <p className="mt-6 text-lead font-semibold text-balance">{t.perfil.cargo}</p>
            <p className="mt-3 text-muted">{t.perfil.resumo}</p>
            <div className="mt-6">
              <EmailCta />
            </div>
            <div className="mt-4 flex gap-6 text-caption">
              <a href={LINKS.github}>github</a>
              <a href={LINKS.linkedin}>linkedin</a>
            </div>
          </div>
        </div>

        {/* o trecho alto que a rolagem percorre; a cena fica presa na tela dentro dele */}
        <div
          data-cena
          className="mt-8 h-[160svh] motion-reduce:h-auto lg:col-start-1 lg:row-start-1 lg:mt-0 lg:h-[200svh] lg:motion-reduce:h-auto"
        >
          <div className="sticky top-24 -mx-6 h-[calc(100svh-6rem)] lg:-mx-12">
            <div className="bordas h-full" role="img" aria-label={t.ui.cena}>
              <AsciiCanvas cena="castelo" imagem="/cenas/castelo.webp" grades={GRADES} revelar={0.15} interativa />
            </div>
            <div className="veu-hero pointer-events-none absolute inset-0 hidden lg:block" aria-hidden="true" />
            {/* o botão fica fora do role="img" (os filhos dele são apresentacionais) */}
            <p className="pointer-events-none absolute right-6 bottom-2 text-right text-caption text-muted lg:right-12">
              <span className="dica motion-reduce:hidden">{t.ui.rolar}</span>
              <span className="dica hidden motion-safe:sm:inline" aria-hidden="true">
                {" "}
                ·{" "}
              </span>
              <Dica texto={t.ui.dica} className="hidden motion-safe:sm:inline" />
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <ContributionStats lang={lang} />
      </div>

      <dl className="mt-12 grid grid-cols-2 border-t border-l md:grid-cols-3 xl:grid-cols-6">
        {t.especificacoes.map((e) => (
          <div key={e.k} className="border-r border-b p-4">
            <dt className="text-caption font-stretch-condensed text-muted">{e.k}</dt>
            <dd className="mt-1 text-caption">{e.v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

export default Hero;
