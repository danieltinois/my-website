import type { MetadataRoute } from "next";
import snapshot from "@/src/data/contributions.json";
import { SITE_URL } from "@/src/data/site";

// export estático (output: "export"): a rota é gerada uma vez, na build
export const dynamic = "force-static";

// uma página só; a data é a do snapshot, que muda a cada deploy
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE_URL, lastModified: snapshot.fetchedAt }];
}
