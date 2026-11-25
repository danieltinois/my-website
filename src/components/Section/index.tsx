// Seção numerada da ficha: o número fica na coluna de margem (docs/design.md, motivo 1).

interface SectionProps {
  id?: string;
  n: string;
  title: string;
  children: React.ReactNode;
}

const Section = ({ id, n, title, children }: SectionProps) => (
  <section id={id} aria-labelledby={id && `${id}-titulo`} className="scroll-mt-16 border-t py-16 lg:py-24">
    <div className="grid items-baseline gap-2 lg:grid-cols-12 lg:gap-8">
      <p className="hidden text-h2 font-regular font-stretch-condensed tabular-nums text-muted lg:col-span-3 lg:block" aria-hidden="true">
        {n}
      </p>
      <div className="min-w-0 lg:col-span-9">
        <h2 id={id && `${id}-titulo`} className="text-h2 font-stretch-semi-condensed">
          {/* abaixo de 1024px não há coluna de margem: o número vai junto do título */}
          <span className="mr-3 font-regular font-stretch-condensed tabular-nums text-muted lg:hidden" aria-hidden="true">
            {n}
          </span>
          {title}
        </h2>
        <div className="mt-12">{children}</div>
      </div>
    </div>
  </section>
);

export default Section;
