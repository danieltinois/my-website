"use client";

// Dica de clique de uma cena, como botão: aciona a cena pelo teclado e pelo leitor de tela.
// Dispara `cena:acionar` no [data-revelar] mais próximo, que o AsciiCanvas trata como um clique.
// Não faz nada com reduced motion (a cena fica parada), então some nesse caso. Some também depois
// da primeira interação (regra [data-tocado] .dica), mas volta ao receber o foco do teclado.
const Dica = ({ texto, className = "" }: { texto: string; className?: string }) => (
  <button
    type="button"
    onClick={(e) => e.currentTarget.closest("[data-revelar]")?.dispatchEvent(new CustomEvent("cena:acionar"))}
    className={`dica pointer-events-auto cursor-pointer text-caption text-muted hover:text-ink motion-reduce:hidden ${className}`}
  >
    {texto}
  </button>
);

export default Dica;
