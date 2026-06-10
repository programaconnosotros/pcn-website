export interface Article {
  id: string;
  title: string;
  author: string;
  source: string;
  category: string;
  description: string;
  url: string;
  avatar: string;
  year?: number;
}

export const articles: Article[] = [
  {
    id: '1',
    title: 'Loop Engineering',
    author: 'Addy Osmani',
    source: 'addyosmani.com',
    category: 'Programación',
    description:
      'Loop engineering reemplaza los prompts manuales con sistemas autónomos que iteran hasta completar objetivos, cambiando cómo trabajamos con agentes de código.',
    url: 'https://addyosmani.com/blog/loop-engineering/',
    avatar: 'https://github.com/addyosmani.png?size=128',
    year: 2026,
  },
  {
    id: '2',
    title: 'Agent Harness Engineering',
    author: 'Addy Osmani',
    source: 'addyosmani.com',
    category: 'Programación',
    description:
      'Explora cómo la arquitectura que rodea a un modelo de IA (el "harness") es tan importante como el modelo mismo para construir agentes de código efectivos.',
    url: 'https://addyosmani.com/blog/agent-harness-engineering/',
    avatar: 'https://github.com/addyosmani.png?size=128',
    year: 2026,
  },
  {
    id: '3',
    title: 'Agentic Infrastructure',
    author: 'Tom Occhino',
    source: 'vercel.com',
    category: 'Arquitectura',
    description:
      'La infraestructura agéntica permite que agentes de IA desplieguen, construyan y ejecuten software de forma autónoma, transformando cómo operan los sistemas modernos.',
    url: 'https://vercel.com/blog/agentic-infrastructure',
    avatar: 'https://github.com/tomocchino.png?size=128',
    year: 2026,
  },
].sort((a, b) => a.title.localeCompare(b.title, 'es', { sensitivity: 'base' }));
