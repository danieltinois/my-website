// Tabela de parâmetros (docs/design.md, motivo 2): duas colunas, linhas de 1px.

export interface Param {
  k: string;
  v: React.ReactNode;
}

const Params = ({ rows, caption }: { rows: Param[]; caption: string }) => (
  <table className="w-full border-collapse text-left">
    <caption className="sr-only">{caption}</caption>
    <tbody>
      {rows.map((r) => (
        <tr key={r.k} className="border-t last:border-b">
          <th
            scope="row"
            className="w-1/3 py-3 pr-4 align-baseline text-caption font-regular font-stretch-condensed text-muted"
          >
            {r.k}
          </th>
          <td className="py-3 align-baseline">{r.v}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default Params;
