import type { MetadataRoute } from "next";
import snapshot from "@/src/data/contributions.json";
import { IDIOMAS, SITE_URL } from "@/src/data/site";

// export estático (output: "export"): a rota é gerada uma vez, na build
export const dynamic = "force-static";

// uma página por idioma, cada uma apontando para as outras; a data é a do snapshot, que muda a
// cada deploy
const url = (caminho: string) => (caminho === "/" ? SITE_URL : `${SITE_URL}${caminho}`);

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(IDIOMAS.map((i) => [i.html, url(i.caminho)]));
  return IDIOMAS.map((i) => ({ url: url(i.caminho), lastModified: snapshot.fetchedAt, alternates: { languages } }));
}
