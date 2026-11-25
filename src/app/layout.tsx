import type { Metadata } from "next";
import "./globals.css";
import "@fontsource-variable/martian-mono/wdth.css";
import { THEME_SCRIPT } from "@/src/lib/theme";

const title = "Daniel Tinois, dev full stack";
const description =
  "Dev full stack pleno na Verzel, em São Paulo. React, Next, Flutter, Node e Spring. Projetos, trajetória e contato.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // escuro é o padrão; o script troca para o claro antes da pintura se a pessoa escolheu
    <html lang="pt-BR" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <a
          href="#conteudo"
          className="sr-only bg-ink px-4 py-2 text-paper focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-10"
        >
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
