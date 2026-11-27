import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE_URL } from "@/src/data/site";
import { mono } from "./fonts";

const title = "Daniel Tinois, dev full stack";
const description =
  "Dev full stack pleno na Verzel, em São Paulo. React, Next, Flutter, Node e Spring. Projetos, trajetória e contato.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "Daniel Tinois",
    locale: "pt_BR",
    type: "website",
  },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = {
  themeColor: "#0b0c0e",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={mono.variable}>
      <body>
        <a
          href="#conteudo"
          className="sr-only bg-ink px-4 py-2 text-paper focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-20"
        >
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
