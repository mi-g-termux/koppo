// Minimal i18n layer: a single dictionary keyed by dot-path, with each leaf
// carrying both the ES and EN copy. Consumers read via `useLanguage().t()`
// which resolves the path for the active language. Keeping it flat and
// co-located (rather than adding a dependency like next-intl) keeps the
// project tiny and makes the strings easy to audit.
export type Lang = "es" | "en";

// The portfolio is intentionally English-only. The bilingual shape remains
// for compatibility with the template's typed content objects, but the UI
// never exposes a language switcher or renders the Spanish values.
export const LANGUAGES: Lang[] = ["en"];
export const DEFAULT_LANG: Lang = "en";

type Leaf = Record<Lang, string>;
type Node = Leaf | { [key: string]: Node };

function isLeaf(node: Node): node is Leaf {
  return typeof (node as Leaf).es === "string";
}

export const DICT = {
  picker: {
    season: { es: "Estación", en: "Season" },
    language: { es: "Idioma", en: "Language" },
  },
  seasons: {
    spring: { es: "Primavera", en: "Spring" },
    summer: { es: "Verano", en: "Summer" },
    autumn: { es: "Otoño", en: "Autumn" },
    winter: { es: "Invierno", en: "Winter" },
  },
  nav: {
    aria: { es: "Secciones", en: "Sections" },
    home: { es: "Inicio", en: "Home" },
    stack: { es: "Stack", en: "Stack" },
    experience: { es: "Experiencia", en: "Experience" },
    project: { es: "Proyecto", en: "Project" },
    contact: { es: "Contacto", en: "Contact" },
  },
  header: {
    availability: {
      es: "Open to opportunities",
      en: "Open to opportunities",
    },
  },
  hero: {
    greeting: { es: "Hola, soy", en: "Hi, I am" },
    roleLine: {
      es: "Full-Stack Developer & AI Automation Specialist.",
      en: "Full-Stack Developer & AI Automation Specialist.",
    },
    tagline: {
      es: "Especializado en automatizaciones con IA, flujos de n8n y aplicaciones full-stack.",
      en: "Specialised in AI automations, n8n workflows and full-stack web apps.",
    },
    cv: { es: "Descargar CV", en: "Download CV" },
    hire: { es: "Contactarme", en: "Contact me" },
    scroll: { es: "Scroll para explorar", en: "Scroll to explore" },
    keysHint: {
      es: "· hover sobre las teclas",
      en: "· hover over the keys",
    },
  },
  stack: {
    title: { es: "Tech Stack", en: "Tech Stack" },
    hint: {
      es: "(hint: pasa el ratón por una tecla)",
      en: "(hint: hover over a key)",
    },
    hintMobile: {
      es: "Las herramientas con las que construyo.",
      en: "The tools I build with.",
    },
  },
  experience: {
    title: { es: "Cómo Te Ayudo a Ganar", en: "How I Help You Win." },
    subtitle: {
      es: "Elimina tareas manuales y transforma cuellos de botella con flujos de n8n y desarrollo web a medida.",
      en: "Stop losing hours to manual tasks and weak websites. I turn your business bottlenecks into automated, high-converting digital machines.",
    },
  },
  projects: {
    kicker: { es: "proyecto", en: "project" },
    viewMore: { es: "Ver más", en: "View more" },
    openSite: { es: "Abrir sitio", en: "Visit site" },
    viewCode: { es: "Ver código", en: "View code" },
    orderWebsite: { es: "Pedir este sitio", en: "Order this website" },
    close: { es: "Cerrar", en: "Close" },
    stackLabel: { es: "Stack", en: "Stack" },
    overview: { es: "Resumen", en: "Overview" },
  },
  contact: {
    kicker: { es: "contacto", en: "contact" },
    title: { es: "¿Hablamos?", en: "Let's talk?" },
    body: {
      es: "Si lo que has visto te interesa, el teclado ya está listo para recibir el primer mensaje.",
      en: "If what you've seen interests you, the keyboard is ready for the first message.",
    },
    copyEmail: { es: "Copiar email", en: "Copy email" },
    openMail: { es: "Abrir mail", en: "Open mailto" },
    github: { es: "GitHub", en: "GitHub" },
    linkedin: { es: "LinkedIn", en: "LinkedIn" },
    emailToast: { es: "Email copiado", en: "Email copied" },
    footer: {
      es: "© 2026 MIR Labs. Todos los derechos reservados.",
      en: "© 2026 MIR Labs. All rights reserved.",
    },
  },
  keyboard: {
    taglines: {
      javascript: {
        es: "Donde empezó todo. Sigue aquí, sigue mandando.",
        en: "Where it all started. Still here, still in charge.",
      },
      typescript: {
        es: "Mismo JS, con cinturón de seguridad.",
        en: "Same JS, with a seatbelt.",
      },
      html5: {
        es: "Los huesos de cualquier página.",
        en: "The bones of any page.",
      },
      css: {
        es: "El detalle que separa lo bueno de lo bonito.",
        en: "What separates good from beautiful.",
      },
      tailwindcss: {
        es: "Utility-first. Diseño en el HTML.",
        en: "Utility-first. Design inside the HTML.",
      },
      python: {
        es: "Se lee como inglés, escala como cohete.",
        en: "Reads like English, scales like a rocket.",
      },
      react: {
        es: "Componentes, componentes, componentes.",
        en: "Components, components, components.",
      },
      nextdotjs: {
        es: "React adulto: routing, SSR, edge.",
        en: "React all grown up: routing, SSR, edge.",
      },
      vuedotjs: {
        es: "El frontend más relajado.",
        en: "The most relaxed frontend.",
      },
      nodedotjs: {
        es: "JavaScript en el servidor.",
        en: "JavaScript on the server.",
      },
      php: {
        es: "Mueve más web de la que crees.",
        en: "Runs more of the web than you think.",
      },
      n8n: {
        es: "Flujos de automatización e integraciones con IA.",
        en: "Workflow automation, API integrations and AI pipelines.",
      },
      odoo: {
        es: "ERP que no hace llorar.",
        en: "ERP that doesn't make you cry.",
      },
      postgresql: {
        es: "La base de datos aburrida que siempre funciona.",
        en: "The boring database that always works.",
      },
      docker: {
        es: "Igual en mi máquina, igual en producción.",
        en: "Same on my machine, same in production.",
      },
      git: {
        es: "Historia y máquina del tiempo del código.",
        en: "History and a time machine for your code.",
      },
    },
  },
} as const satisfies Record<string, Node>;

// Resolve a dotted path in the dictionary for a given language.
export function translate(path: string, lang: Lang): string {
  const parts = path.split(".");
  let ref: Node = DICT as unknown as Node;
  for (const p of parts) {
    if (isLeaf(ref)) return path;
    ref = (ref as { [key: string]: Node })[p];
    if (ref === undefined) return path;
  }
  if (isLeaf(ref)) return ref[lang] ?? ref.es ?? path;
  return path;
}
