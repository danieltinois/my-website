import {
  Briefcase01Icon,
  CommandLineIcon,
  Coffee01Icon,
  Database01Icon,
  FavouriteIcon,
  HandshakeIcon,
  MortarboardIcon,
  JavaIcon,
  Layers01Icon,
  NextIcon,
  PickaxeIcon,
  ReactIcon,
  Rocket01Icon,
  SmartPhone01Icon,
  Target02Icon,
  TrophyIcon,
  Typescript01Icon,
} from "@hugeicons/core-free-icons";
import { IconSvgElement } from "@hugeicons/react";
import { ROADMAP } from "./trajetoria";

export const ORIGEM = [
  "Tudo começou em 2020, dentro do Minecraft. Quando o jogo não tinha o que eu queria, eu escrevia: comando novo, evento novo, regra nova — plugins em Java rodando no servidor. Sem perceber, eu já estava fazendo software pra outras pessoas usarem.",
  "Em 2021 o código saiu do jogo. Fiz um site voluntário pra orientar pacientes de UPA e peguei meu primeiro cliente como freelancer — foram quase quatro anos de e-commerces pequenos, landing pages e prazos de verdade, enquanto eu aprendia React, TypeScript e Node e entrava em Engenharia de Software na FIAP.",
  "Na Swift passei um ano e meio no time de integrações: web com React, mobile com Flutter, APIs pra e-commerce, Clean Architecture e code review de verdade. No caminho, meu time levou o 1º lugar no FIAP NEXT.",
  "Hoje sou dev pleno na Verzel e penso produto antes de pensar feature: quem usa, o que dói, qual o menor passo que já resolve. Depois é shipar rápido e iterar mais rápido ainda.",
];

export interface ItemInventario {
  nome: string;
  lore: string;
  icon: IconSvgElement;
  qtd?: number;
}

// hotbar de 9 slots, igual ao jogo
export const INVENTARIO: ItemInventario[] = [
  { nome: "Java", lore: "item inicial · desde 2020, nos plugins de minecraft", icon: JavaIcon },
  { nome: "TypeScript", lore: "equipado no dia a dia · tipo é documentação que compila", icon: Typescript01Icon },
  { nome: "React", lore: "encantado: re-render III", icon: ReactIcon },
  { nome: "Next.js", lore: "este site roda nele", icon: NextIcon },
  { nome: "Node.js + Spring", lore: "o lado de trás do balcão", icon: Layers01Icon },
  { nome: "PostgreSQL", lore: "onde os dados dormem tranquilos", icon: Database01Icon },
  { nome: "Flutter + React Native", lore: "web no bolso", icon: SmartPhone01Icon },
  { nome: "Neovim", lore: "sim, eu sou desse tipo", icon: CommandLineIcon },
  { nome: "Café", lore: "consumível · regenera +4 de foco", icon: Coffee01Icon, qtd: 64 },
];

export interface Conquista {
  titulo: string;
  desc: string;
  icon: IconSvgElement;
  feito: boolean;
}

export const CONQUISTAS: Conquista[] = [
  { titulo: "Primeiro plugin", desc: "2020 · java dentro do minecraft", icon: PickaxeIcon, feito: true },
  { titulo: "Código com propósito", desc: "2021 · site voluntário pra pacientes de upa", icon: FavouriteIcon, feito: true },
  { titulo: "Primeiro cliente", desc: "2021 · freela no 99freelas", icon: HandshakeIcon, feito: true },
  { titulo: "Calouro", desc: "2024 · engenharia de software na fiap", icon: MortarboardIcon, feito: true },
  { titulo: "Integrador", desc: "2025 · time de integrações da swift", icon: Layers01Icon, feito: true },
  { titulo: "Campeão", desc: "2025 · 1º lugar no fiap next", icon: TrophyIcon, feito: true },
  { titulo: "Nível pleno", desc: "2026 · mid-level II na verzel", icon: Briefcase01Icon, feito: true },
  { titulo: "Deploy na sexta", desc: "e sobreviveu", icon: Rocket01Icon, feito: true },
  // o que falta do roadmap vira conquista bloqueada
  ...ROADMAP.filter((r) => !r.feito).map((r) => ({
    titulo: r.item[0].toUpperCase() + r.item.slice(1),
    desc: "em andamento",
    icon: Target02Icon,
    feito: false,
  })),
];
