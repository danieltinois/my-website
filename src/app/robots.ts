import type { MetadataRoute } from "next";
import { SITE_URL } from "@/src/data/site";

// export estático (output: "export"): a rota é gerada uma vez, na build
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
