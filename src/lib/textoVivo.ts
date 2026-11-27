// Texto vivo: as letras perto do cursor engordam e alargam, e voltam devagar quando ele se afasta,
// como uma onda que segue o mouse. A Martian Mono é variável (peso 100–800, largura 75–112,5%),
// então isso é só `font-variation-settings` em cada letra, sem trocar de fonte.
//
// Um gerenciador só para a página inteira: cada título registra o contêiner das letras dele
// (Decifrar) e um único pointermove move todas. A cada quadro, cada letra anda uma fração do caminho
// até o alvo (inércia), e o laço para sozinho quando tudo assentou. Só com mouse e com movimento.

const PESO_MAX = 800;
const LARGURA_MAX = 112.5;
const ALCANCE = 1.8; // raio da onda, em tamanhos de fonte do título
const SEGUE = 0.14; // fração do caminho até o alvo a cada quadro

interface Estado {
  peso: number;
  largura: number;
}

const conteineres = new Set<HTMLElement>();
const estados = new WeakMap<HTMLElement, Estado>();
let cursor: { x: number; y: number } | null = null;
let raf = 0;
let ligado = false;

const base = (el: HTMLElement) => {
  const css = getComputedStyle(el);
  return { peso: Number(css.fontWeight) || 400, tamanho: parseFloat(css.fontSize) || 16 };
};

const quadro = () => {
  raf = 0;
  let mexendo = false;
  for (const el of conteineres) {
    const caixa = el.getBoundingClientRect();
    if (caixa.bottom < 0 || caixa.top > innerHeight) continue;
    const { peso: p0, tamanho } = base(el);
    const raio = tamanho * ALCANCE;
    for (const letra of el.children as HTMLCollectionOf<HTMLElement>) {
      const r = letra.getBoundingClientRect();
      const d = cursor ? Math.hypot(r.left + r.width / 2 - cursor.x, r.top + r.height / 2 - cursor.y) : Infinity;
      const k = Math.exp(-((d / raio) ** 2));
      const alvo = { peso: p0 + (PESO_MAX - p0) * k, largura: 100 + (LARGURA_MAX - 100) * k };
      const atual = estados.get(letra) ?? { peso: p0, largura: 100 };
      const novo = {
        peso: atual.peso + (alvo.peso - atual.peso) * SEGUE,
        largura: atual.largura + (alvo.largura - atual.largura) * SEGUE,
      };
      if (Math.abs(novo.peso - alvo.peso) > 0.5 || Math.abs(novo.largura - alvo.largura) > 0.05) mexendo = true;
      estados.set(letra, novo);
      // em repouso, sem estilo: a letra volta a seguir o peso do título
      letra.style.fontVariationSettings =
        Math.abs(novo.peso - p0) < 0.5 && novo.largura < 100.05 ? "" : `"wght" ${novo.peso.toFixed(1)}, "wdth" ${novo.largura.toFixed(2)}`;
    }
  }
  if (mexendo) raf = requestAnimationFrame(quadro);
};

const acordar = () => {
  if (!raf) raf = requestAnimationFrame(quadro);
};

const ligar = () => {
  if (ligado) return;
  ligado = true;
  window.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse") return;
      cursor = { x: e.clientX, y: e.clientY };
      acordar();
    },
    { passive: true },
  );
  document.documentElement.addEventListener("pointerleave", () => {
    cursor = null;
    acordar();
  });
  // rolar muda a distância das letras ao cursor parado
  window.addEventListener("scroll", acordar, { passive: true });
};

// registra o contêiner das letras de um título; devolve a função que o tira
export const registrarTextoVivo = (el: HTMLElement) => {
  if (!matchMedia("(pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  ligar();
  conteineres.add(el);
  return () => {
    conteineres.delete(el);
    for (const letra of el.children as HTMLCollectionOf<HTMLElement>) letra.style.fontVariationSettings = "";
  };
};
