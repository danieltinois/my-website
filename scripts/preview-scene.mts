// Prévia de uma cena em ASCII no terminal, para iterar a arte:
//   node scripts/preview-scene.mts <cena> [colunas] [linhas] [t] [p]
import { ansiDenso } from "../src/components/Ascii/denso.ts";
import { CENAS } from "../src/components/Ascii/cenas/index.ts";

const [nome = "castelo", ...nums] = process.argv.slice(2);
const [cols = 150, rows = 44, t = 5.1, p = 0.5] = nums.map(Number);
// a cena é feita de imagem, que só decodifica no navegador: aqui sai o campo de estrelas de espera
const dados = undefined;
const cena = CENAS[nome as keyof typeof CENAS];
process.stdout.write(ansiDenso(cena({ cols, rows, t, p, dados } as never)));
