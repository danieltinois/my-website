"use client";

// Dica de clique da cena, como botão: aciona a cena pelo teclado e pelo leitor de tela.
// Dispara `cena:acionar` no [data-cena] mais próximo, que o AsciiCanvas trata como um clique.
// Não faz nada com reduced motion (a cena fica parada), então some nesse caso em qualquer largura
// (quem a esconde por largura usa motion-safe:, para a regra de largura não vencer a de reduced
// motion). Some também depois da primeira interação (regra [data-tocado] .dica), mas volta ao
// receber o foco do teclado.
const Dica = ({ texto, className = "" }: { texto: string; className?: string }) => (
  <button
    type="button"
    onClick={(e) => e.currentTarget.closest("[data-cena]")?.dispatchEvent(new CustomEvent("cena:acionar"))}
    className={`dica pointer-events-auto cursor-pointer text-caption text-muted hover:text-ink motion-reduce:hidden ${className}`}
  >
    {texto}
  </button>
);

export default Dica;
