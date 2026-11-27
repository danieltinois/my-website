// Vaga-lumes atrás da página: poucos pontos quentes que flutuam devagar e acendem e apagam, como
// os da margem do lago no castelo. Só CSS (.vaga-lume em globals.css): cada um com posição, rota,
// tempo e atraso próprios, fixos aqui para a build sair sempre igual. Com reduced motion, somem.

// x e y em % da janela; d = segundos da rota; p = segundos do pisca; a = atraso; r = rota (1–3)
const VAGA_LUMES = [
  { x: 6, y: 18, d: 34, p: 4.2, a: 0, r: 1 },
  { x: 14, y: 72, d: 41, p: 5.1, a: -7, r: 2 },
  { x: 23, y: 44, d: 29, p: 3.6, a: -15, r: 3 },
  { x: 31, y: 88, d: 38, p: 6.0, a: -3, r: 1 },
  { x: 42, y: 12, d: 45, p: 4.8, a: -21, r: 2 },
  { x: 55, y: 64, d: 33, p: 3.9, a: -9, r: 3 },
  { x: 63, y: 30, d: 39, p: 5.5, a: -26, r: 1 },
  { x: 71, y: 82, d: 36, p: 4.4, a: -12, r: 2 },
  { x: 79, y: 50, d: 43, p: 6.3, a: -4, r: 3 },
  { x: 88, y: 22, d: 31, p: 3.8, a: -18, r: 1 },
  { x: 94, y: 68, d: 40, p: 5.0, a: -30, r: 2 },
  { x: 48, y: 94, d: 35, p: 4.6, a: -24, r: 3 },
];

const VagaLumes = () => (
  <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden motion-reduce:hidden" aria-hidden="true">
    {VAGA_LUMES.map((v, i) => (
      <span
        key={i}
        className={`vaga-lume rota-${v.r}`}
        style={{
          left: `${v.x}%`,
          top: `${v.y}%`,
          animationDuration: `${v.d}s, ${v.p}s`,
          animationDelay: `${v.a}s, ${v.a / 2}s`,
        }}
      />
    ))}
  </div>
);

export default VagaLumes;
