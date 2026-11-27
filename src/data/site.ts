// O que é igual em todos os idiomas, os tipos dos textos e o mapa idioma → textos.
// Os textos vivem em src/data/textos/<idioma>.ts. O português é a fonte (docs/content.md); os
// outros idiomas são traduções dele: se um texto mudar, muda lá, aqui no pt e nas traduções.

import { en } from "./textos/en";
import { es } from "./textos/es";
import { ja } from "./textos/ja";
import { pt } from "./textos/pt";

export const SITE_URL = "https://danieltinois.dev";

export const EMAIL = "me@danieltinois.dev";

export const NOME = "Daniel Tinois";

export const LINKS = {
  github: "https://github.com/danieltinois",
  linkedin: "https://www.linkedin.com/in/danieltinois",
};

// pt fica na raiz; os outros em /en, /es e /ja. `html` vai no atributo lang e no hreflang,
// `og` no og:locale, `formato` nas datas e números.
export const IDIOMAS = [
  { id: "pt", rotulo: "pt", nome: "Português", html: "pt-BR", og: "pt_BR", formato: "pt-BR", caminho: "/" },
  { id: "en", rotulo: "en", nome: "English", html: "en", og: "en_US", formato: "en-US", caminho: "/en" },
  { id: "es", rotulo: "es", nome: "Español", html: "es", og: "es_ES", formato: "es-ES", caminho: "/es" },
  { id: "ja", rotulo: "ja", nome: "日本語", html: "ja", og: "ja_JP", formato: "ja-JP", caminho: "/ja" },
] as const;

export type Idioma = (typeof IDIOMAS)[number]["id"];

export const idioma = (id: Idioma) => IDIOMAS.find((i) => i.id === id)!;

export const ehIdioma = (x: string): x is Idioma => IDIOMAS.some((i) => i.id === x);

export interface Projeto {
  id: string;
  nome: string;
  resumo: string;
  problema: string;
  comoFunciona: string;
  dificil: string;
  estado: string;
  papel: string;
  stack: string;
  codigo: string;
}

export interface Textos {
  meta: { titulo: string; descricao: string };
  ui: {
    pular: string;
    secoes: string;
    idioma: string;
    titulos: { projetos: string; trajetoria: string; contato: string };
    cidade: string;
    contribuicoes12m: string; // "{n}" vira o total
    revisao: string;
    rolar: string;
    dica: string;
    cena: string;
    vela: { cena: string; dica: string };
    stats: {
      legenda: string; // "{de}" e "{ate}" viram as datas
      total: string;
      dias: string;
      sequencia: string;
      unidadeDias: string; // "{n}" vira o número
      semanaPico: string;
      ver: string;
      semanaDe: string;
      contribuicoes: string;
      emCurso: string;
    };
    projeto: { problema: string; comoFunciona: string; dificil: string; estado: string; papel: string; stack: string; codigo: string };
    copiar: { acao: string; copiado: string; falhou: string; rotulo: string };
    voltarTopo: string;
  };
  perfil: { cargo: string; resumo: string };
  especificacoes: { k: string; v: string }[];
  projetos: Projeto[];
  trajetoria: { quando: string; titulo: string; texto: string }[];
  contato: { titulo: string; texto: string };
}

export const TEXTOS: Record<Idioma, Textos> = { pt, en, es, ja };

// troca {chave} pelo valor
export const preencher = (modelo: string, valores: Record<string, string | number>) =>
  modelo.replace(/\{(\w+)\}/g, (_, k: string) => String(valores[k] ?? ""));
