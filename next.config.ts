import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Cloudflare Pages: build estático, sem otimizar imagens (o serviço
     de otimização de imagem do Next não roda lá) */
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;