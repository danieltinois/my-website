// Fundo da página: brasas subindo devagar, esparsas, atrás de todo o conteúdo. A rolagem (p)
// empurra as brasas um pouco para cima, como se a pessoa andasse pela fumaça, e elas desviam do
// cursor como se ele soprasse.

import { Cor, hash, nova, put, type Quadro } from "../engine.ts";

export const brasas: Quadro = ({ cols, rows, t, p, mouse }) => {
  const g = nova(cols, rows);
  const n = Math.round((cols * rows) / 90);
  const altura = rows + 6;
  for (let i = 0; i < n; i++) {
    const vel = 0.6 + hash(i, 1, 9) * 1.4;
    const vida = (t * vel + hash(i, 2, 9) * altura + p * rows * 3) % altura;
    const y = rows + 2 - vida;
    let x = hash(i, 3, 9) * cols + Math.sin(t * 0.7 + i) * 2;
    if (mouse) {
      const dx = x - mouse.u * cols;
      const dy = (y - mouse.v * rows) * 1.8;
      const d = Math.hypot(dx, dy);
      if (d < 7 && d > 0.01) x += (dx / d) * (7 - d) * 1.2;
    }
    const forte = vida < altura * 0.3;
    put(g, x, y, forte ? (hash(i, Math.floor(t * 4), 2) < 0.5 ? "*" : "'") : vida < altura * 0.7 ? "." : "·", forte ? Cor.Signal : Cor.SignalDim);
  }
  return g;
};
