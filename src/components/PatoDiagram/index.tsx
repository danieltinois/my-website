import { Fragment } from "react";

// Figura 2: diagrama de blocos do Pato Commit, como o "functional block diagram" de uma
// ficha técnica. O bloco tracejado é o que ainda não existe (mesma convenção da semana em
// curso na Figura 1).

const BLOCOS = [
  { nome: "GitHub App", detalhe: "Entrega cada evento pelo menos uma vez." },
  { nome: "Webhook", detalhe: "Confere a assinatura e descarta entrega repetida pelo ID." },
  { nome: "PostgreSQL", detalhe: "A fila é uma tabela. Grava antes de responder ao GitHub." },
  { nome: "Worker", detalhe: "Um UPDATE condicional dá cada entrega a um só worker." },
  { nome: "Caixa de entrada", detalhe: "O que espera decisão sua.", futuro: true },
];

const Seta = () => (
  <span aria-hidden="true" className="flex items-center justify-center py-1 lg:px-1 lg:py-0">
    <svg viewBox="0 0 16 10" className="h-3 w-4 rotate-90 lg:rotate-0" fill="none">
      <path d="M0 5h14M10 1l4 4-4 4" className="stroke-muted" strokeWidth="1" />
    </svg>
  </span>
);

const PatoDiagram = () => (
  <figure>
    <div className="border bg-plate p-4 md:p-6">
      <ol className="flex flex-col lg:flex-row">
        {BLOCOS.map((b, i) => (
          <Fragment key={b.nome}>
            <li
              className={`flex-1 border bg-paper p-3 ${b.futuro ? "border-dashed border-muted" : "border-rule"}`}
            >
              <p className="font-semibold">{b.nome}</p>
              <p className="mt-1 text-caption text-muted">
                {b.futuro && <span className="sr-only">Ainda não implementado. </span>}
                {b.detalhe}
              </p>
            </li>
            {i < BLOCOS.length - 1 && <Seta />}
          </Fragment>
        ))}
      </ol>
    </div>
    <figcaption className="mt-3 max-w-measure text-caption text-muted">
      Figura 2. O caminho de um evento do GitHub dentro do Pato Commit. O bloco tracejado é o próximo marco.
    </figcaption>
  </figure>
);

export default PatoDiagram;
