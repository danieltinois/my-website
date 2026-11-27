import { TEXTOS, type Idioma } from "@/src/data/site";

// A trajetória como uma agenda: uma linha por marco, do mais novo para o mais antigo, com a data
// numa coluna estreita à esquerda e linhas finas entre elas (sem caixas dos lados).
const Trajetoria = ({ lang }: { lang: Idioma }) => (
  <ol>
    {TEXTOS[lang].trajetoria.map((t) => (
      <li
        key={`${t.quando}-${t.titulo}`}
        className="surgir grid items-baseline gap-2 border-t py-6 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-6"
      >
        <span className="text-caption font-stretch-condensed tabular-nums text-muted">{t.quando}</span>
        <p className="max-w-measure">
          <span className="font-semibold">
            {t.titulo}
            {lang === "ja" ? "。" : "."}
          </span> <span className="text-muted">{t.texto}</span>
        </p>
      </li>
    ))}
  </ol>
);

export default Trajetoria;
