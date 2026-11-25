import Decifrar from "@/src/components/Decifrar";

// Seção numerada: o marcador [01] faz parte do título (docs/design.md, motivos). O título se
// decifra em ASCII quando entra na tela.

interface SectionProps {
  id: string;
  n: string;
  title: string;
  children: React.ReactNode;
}

const Section = ({ id, n, title, children }: SectionProps) => (
  <section id={id} aria-labelledby={`${id}-titulo`} className="scroll-mt-24 border-t py-16 lg:py-24">
    <h2 id={`${id}-titulo`} className="surgir text-h2">
      <span className="mr-4 font-regular font-stretch-condensed tabular-nums text-muted" aria-hidden="true">
        [{n}]
      </span>
      <Decifrar texto={title} />
    </h2>
    <div className="mt-12">{children}</div>
  </section>
);

export default Section;
