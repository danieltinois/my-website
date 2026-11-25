// Prévia de uma cena em ASCII no terminal, para iterar a arte:
//   node scripts/preview-scene.mts <cena> [colunas] [linhas] [t] [p]
import { ansi } from "../src/components/Ascii/engine.ts";
import { ansiDenso } from "../src/components/Ascii/denso.ts";
import { CENAS } from "../src/components/Ascii/cenas/index.ts";

const [nome = "castelo", ...nums] = process.argv.slice(2);
const [cols = 150, rows = 44, t = 5.1, p = 0.5] = nums.map(Number);
// o castelo precisa da imagem decodificada (só no navegador): aqui ele sai vazio
const dados = undefined;
const cena = CENAS[nome as keyof typeof CENAS];
const saida = cena({ cols, rows, t, p, dados } as never) as Parameters<typeof ansi>[0] & { lum?: Float32Array };
process.stdout.write(saida.lum ? ansiDenso(saida as never) : ansi(saida));
