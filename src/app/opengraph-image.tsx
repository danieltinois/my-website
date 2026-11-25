import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import snapshot from "@/src/data/contributions.json";
import { MARCA } from "@/src/data/curva";
import { PERFIL } from "@/src/data/site";
import { formatNumber, toField, toWeeks, VAZIO, type Snapshot } from "@/src/lib/contributions";

// export estático (output: "export"): a rota é gerada uma vez, na build
export const dynamic = "force-static";

// Imagem de compartilhamento (1200×630), gerada na build com os mesmos dados do campo da home.
// O ImageResponse não lê woff2: usa a Martian Mono estática em woff (devDependency).

export const alt = `${PERFIL.nome}: ${PERFIL.cargo}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fonte = (peso: number) =>
  readFile(join(process.cwd(), `node_modules/@fontsource/martian-mono/files/martian-mono-latin-${peso}-normal.woff`));

const [regular, semibold] = await Promise.all([fonte(400), fonte(600)]);

const COR = { paper: "#0B0C0E", faint: "#3A3F47", muted: "#8D939C", ink: "#E9EBEE", signal: "#FF6A13" };
const LINHAS = 8;

export default function Image() {
  const data = snapshot as Snapshot;
  const weeks = toWeeks(data.days);
  const field = toField(weeks, LINHAS);
  const marca = weeks.findIndex((w, i) => MARCA.de >= w.start && MARCA.de < (weeks[i + 1]?.start ?? "9999"));

  // uma linha de texto por linha do campo; cada caractere com a cor do papel dele
  const cor = (col: number, ch: string) => (ch === VAZIO ? COR.faint : col === marca ? COR.signal : COR.muted);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: COR.paper,
          color: COR.ink,
          fontFamily: "Martian Mono",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 88, fontWeight: 600, letterSpacing: "-0.05em", lineHeight: 1 }}>
            {PERFIL.nome}
          </div>
          <div style={{ marginTop: 24, fontSize: 30, fontWeight: 600 }}>{PERFIL.cargo}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", fontSize: 25, lineHeight: 1.1 }}>
          {Array.from({ length: LINHAS }, (_, r) => (
            <div key={r} style={{ display: "flex" }}>
              {field.map((c, col) => (
                <span key={col} style={{ color: cor(col, c.cells[r]) }}>
                  {c.cells[r]}
                </span>
              ))}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: COR.muted }}>
          <span>{formatNumber(data.total)} contribuições em 12 meses</span>
          <span style={{ color: COR.ink }}>danieltinois.dev</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Martian Mono", data: regular, style: "normal", weight: 400 },
        { name: "Martian Mono", data: semibold, style: "normal", weight: 600 },
      ],
    },
  );
}
