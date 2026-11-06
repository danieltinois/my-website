// ondas do fundo só com SVG + CSS: a animação é um translateX na GPU, sem JS por frame
// (o react-wavify fazia setState e lia layout a cada frame, disputando o main thread com o craft)

// uma onda que se repete a cada `period`; o path tem 2x a largura visível e a animação
// anda exatamente metade, então o loop não tem emenda
const wavePath = (base: number, amp: number, period: number, width = 2880, height = 320) => {
  let d = `M0 ${base}`;
  for (let x = 0; x < width; x += period) {
    d += ` Q${x + period / 4} ${base - amp} ${x + period / 2} ${base} T${x + period} ${base}`;
  }
  return `${d} V${height} H0 Z`;
};

const LAYERS = [
  // o período precisa dividir 1440 (metade do path) pro loop fechar
  { fill: "var(--color-bg-wave-first)", d: wavePath(40, 26, 1440), className: "wave-a" },
  { fill: "var(--color-bg-wave-second)", d: wavePath(70, 30, 720), className: "wave-b" },
];

const Waves = () => (
  <div
    aria-hidden
    className="pointer-events-none fixed bottom-0 left-0 -z-10 h-[1020px] w-full overflow-hidden md:h-[380px]"
  >
    {LAYERS.map((l) => (
      <div key={l.className} className={`wave-bob absolute inset-x-0 bottom-0 top-0 md:top-10 ${l.className}`}>
        <svg
          viewBox="0 0 2880 320"
          preserveAspectRatio="none"
          className="wave-slide absolute left-0 top-0 h-full w-[200%]"
        >
          <path d={l.d} fill={l.fill} />
        </svg>
      </div>
    ))}
  </div>
);

export default Waves;
