// Campo de estrelas fraco, de espera: aparece enquanto a imagem de fundo ainda decodifica e
// vai embora conforme ela surge. Corre devagar para a esquerda; cerca de 1 estrela a cada 60
// células. Sem figuras nem imagem, só `ruido` (em coordenadas inteiras ele é um hash estável).

import { acender, ruido, type Tela } from "./denso.ts";

const DENSIDADE = 1 / 60;

export const estrelasEspera = (T: Tela, t: number, I = 0.35) => {
  if (I <= 0) return;
  const deriva = Math.floor(t * 1.5);
  for (let y = 0; y < T.rows; y++)
    for (let x = 0; x < T.cols; x++) {
      const xi = x + deriva;
      if (ruido(xi, y) < 1 - DENSIDADE) continue;
      const pisca = 0.65 + 0.35 * Math.sin(t * 2 + ruido(xi * 3.7, y * 2.9) * 20);
      acender(T, y * T.cols + x, I * pisca * (0.6 + 0.4 * ruido(xi * 7.3 + 11, y * 5.1)));
    }
};
