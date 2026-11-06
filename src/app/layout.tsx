import type { Metadata } from "next";
import "./globals.css";
import "@fontsource-variable/roboto-mono";
import { ThemeProvider } from "next-themes";
import Waves from "../components/layout/Waves";
import { SoundProvider } from "../context/SoundContext";
import PartyMode from "../components/layout/PartyMode";

const description =
  "Portfólio do Daniel Tinois — Full Stack Developer que transforma café em código e ideias em interfaces.";

export const metadata: Metadata = {
  title: "Daniel Tinois · full stack dev",
  description,
  openGraph: {
    title: "Daniel Tinois · full stack dev",
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
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem={true}
          value={{
            dark: "dark",
            light: "light",
          }}
        >
          <SoundProvider>
            {children}
            <PartyMode />
          </SoundProvider>
          <Waves />
        </ThemeProvider>
      </body>
    </html>
  );
}
