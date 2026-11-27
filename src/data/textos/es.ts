import type { Textos } from "../site";

// Español: traducido de pt.ts.
export const es: Textos = {
  meta: {
    titulo: "Daniel Tinois, desarrollador full stack",
    descricao: "Desarrollador full stack semi senior en Verzel, en São Paulo. React, Next, Flutter, Node y Spring. Proyectos, trayectoria y contacto.",
  },
  ui: {
    pular: "Saltar al contenido",
    secoes: "Secciones",
    idioma: "Idioma",
    titulos: { projetos: "Proyectos", trajetoria: "Trayectoria", contato: "Contacto" },
    cidade: "são paulo",
    contribuicoes12m: "{n} contribuciones en 12 meses",
    revisao: "rev.",
    dica: "haz clic en el cielo o en el lago",
    cena: "Escena en ASCII casi fotográfica: un castillo iluminado sobre un acantilado de noche, con una cascada que cae a un lago donde se refleja la luna llena, un bosque de pinos alrededor y, de vez en cuando, un dragón que cruza el cielo.",
    stats: {
      legenda: "Mis contribuciones públicas en GitHub, del {de} al {ate}.",
      total: "contribuciones en 12 meses",
      dias: "días con contribuciones",
      sequencia: "racha más larga",
      unidadeDias: "{n} días",
      semanaPico: "semana más intensa",
      ver: "ver los datos por semana",
      semanaDe: "semana del",
      contribuicoes: "contribuciones",
      emCurso: "(en curso)",
    },
    projeto: {
      problema: "problema",
      comoFunciona: "cómo funciona",
      dificil: "lo difícil",
      estado: "estado",
      papel: "rol",
      stack: "stack",
      codigo: "código",
    },
    copiar: { acao: "copiar", copiado: "copiado", falhou: "no se pudo copiar", rotulo: "copiar e-mail" },
    voltarTopo: "volver arriba",
  },
  perfil: {
    cargo: "Desarrollador full stack semi senior en Verzel, en São Paulo.",
    resumo:
      "Hago web con React y Next, mobile con Flutter y APIs con Node y Spring. Escribo software que no pierde eventos, no inventa datos y no borra lo que no debe.",
  },
  especificacoes: [
    { k: "ubicación", v: "São Paulo, Brasil" },
    { k: "web", v: "React, Next.js, TypeScript" },
    { k: "mobile", v: "Flutter" },
    { k: "back-end", v: "Node, Spring, PostgreSQL" },
    { k: "programando desde", v: "2020" },
    { k: "formación", v: "Ingeniería de Software, FIAP (2027)" },
  ],
  projetos: [
    {
      id: "devclean",
      nome: "DevClean",
      resumo: "Descubre qué herramientas de desarrollo están llenando el disco del Mac y limpia solo lo que es seguro.",
      problema:
        "DerivedData, simuladores, imágenes de Android, node_modules y cachés suman decenas de GB. Los limpiadores genéricos no saben qué se puede volver a crear.",
      comoFunciona:
        "Cada hallazgo dice qué herramienta lo creó, cuánto ocupa, el riesgo de borrarlo y cómo recrearlo después. La app mueve a la Papelera solo cachés conocidas, después de confirmar, y nunca vacía la Papelera.",
      dificil:
        "El mismo motor en TypeScript corre en la CLI y dentro de la app SwiftUI, en macOS y en iPhone, a través de JavaScriptCore. Las reglas son archivos JSON: un escáner nuevo no requiere código. Antes de mover algo, la app vuelve a comprobar la ruta real y el inode, así que una regla equivocada puede mostrar de más, pero nunca borrar de más.",
      estado: "En uso en mi Mac",
      papel: "Proyecto individual",
      stack: "TypeScript, Bun, Swift, SwiftUI, JavaScriptCore",
      codigo: "https://github.com/danieltinois/dev-macos-clean",
    },
    {
      id: "pato-commit",
      nome: "Pato Commit",
      resumo: "Una bandeja de entrada de lo que espera tu decisión en GitHub, corriendo en tu máquina.",
      problema: "PRs esperando revisión, issues sin respuesta y workflows en rojo se pierden entre las notificaciones.",
      comoFunciona: "Recibe los webhooks de una GitHub App y arma una lista solo con lo que te necesita.",
      dificil:
        "GitHub entrega cada evento al menos una vez. Cada entrega tiene su firma verificada, se deduplica por ID y se guarda en Postgres antes de responder; un UPDATE condicional garantiza que solo un worker la procese. La cola es una tabla: sin Redis, sin broker, y tres ADRs explican por qué.",
      estado: "Recepción de eventos lista; la bandeja de entrada es el próximo hito",
      papel: "Proyecto individual, del ADR al CI",
      stack: "Java 25, Spring Boot 4, PostgreSQL 18, Flyway, Next.js 16",
      codigo: "https://github.com/danieltinois/pato-commit",
    },
    {
      id: "resume-tailor",
      nome: "resume-tailor",
      resumo: "Un perfil, un currículum a medida para cada vacante, sin inventar nada.",
      problema: "Adaptar el currículum a cada vacante es manual, y las herramientas que lo reescriben con IA inventan datos.",
      comoFunciona:
        "Pegas la vacante; la app encuentra las skills que pide, sugiere qué experiencias mostrar y en qué orden, y genera un PDF A4 legible por ATS. Perfil en portugués e inglés.",
      dificil:
        "El texto siempre sale del perfil. El generador copia por ID y rechaza IDs desconocidos, así que ni una IA conectada después puede inventar empresa, cargo o métrica. El contrato OpenAPI se valida con tests y genera los tipos del front; un test de punta a punta va del registro al PDF.",
      estado: "Funcional, corre con Docker Compose",
      papel: "Proyecto individual",
      stack: "Java 21, Spring Boot, Angular, PostgreSQL, Typst, Playwright",
      codigo: "https://github.com/danieltinois/job-resume-generator",
    },
  ],
  trajetoria: [
    { quando: "2026", titulo: "Verzel", texto: "Desarrollador full stack semi senior." },
    {
      quando: "2026",
      titulo: "LBA Capital, freelance",
      texto: "Colas y webhook para destrabar el procesamiento y la actualización de boletos bancarios. Node, Supabase, PostgreSQL.",
    },
    {
      quando: "2025",
      titulo: "1.er lugar en FIAP NEXT",
      texto: "Desafío de Astéria: control de caja para pequeños supermercados, del prototipo al pitch ante un panel C-level.",
    },
    {
      quando: "2025–2026",
      titulo: "Swift",
      texto: "1 año y 7 meses en el equipo de integraciones: web con React, mobile con Flutter, APIs para e-commerce.",
    },
    { quando: "2024", titulo: "FIAP", texto: "Ingeniería de Software, me gradúo en 2027." },
    {
      quando: "2021–2025",
      titulo: "Freelancer",
      texto: "Cuatro años de tiendas online, landing pages y sistemas a medida, solo del contrato al deploy.",
    },
    { quando: "2021", titulo: "Primer sitio web", texto: "Voluntario, para orientar a pacientes de urgencias después de la atención." },
    { quando: "2020", titulo: "Plugins de Minecraft", texto: "Java, donde programar se volvió algo que otras personas usan." },
  ],
  contato: {
    titulo: "¿Leíste hasta aquí? Hablemos.",
    texto: "El camino más rápido es el e-mail.",
  },
};
