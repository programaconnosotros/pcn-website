'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageTitle } from '@/components/ui/page-title';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { articles, type Article } from './articles';
import { ArticleReaderDialog } from './article-reader-dialog';
import { ArticlesPanel, isReadStatus, type ReadStatus } from './articles-panel';
import { useContentMarks } from '@/hooks/use-content-marks';
import { SearchBar } from '@/components/ui/search-bar';

interface Book {
  id: string;
  title: string;
  author: string;
  categories: string[];
  description: string;
  year?: number;
  cover: string;
  isbn?: string;
  url?: string;
}

const books: Book[] = [
  {
    id: '1',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    categories: ['Programación'],
    description:
      'Un manual de artesanía de software ágil que te enseñará a escribir código limpio y mantenible.',
    year: 2008,
    cover: '/lectura/clean-code.jpg',
    isbn: '0132350882',
  },
  {
    id: '2',
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt, David Thomas',
    categories: ['Programación'],
    description:
      'Un enfoque práctico para convertirse en un programador más efectivo y productivo.',
    year: 1999,
    cover: '/lectura/the-pragmatic-programmer.jpg',
    isbn: '020161622X',
  },
  {
    id: '3',
    title: 'Design Patterns',
    author: 'Gang of Four',
    categories: ['Arquitectura'],
    description:
      'Patrones de diseño reutilizables para resolver problemas comunes en el diseño de software.',
    year: 1994,
    cover: '/lectura/design-patterns.jpg',
    isbn: '0201633612',
  },
  {
    id: '4',
    title: 'Refactoring',
    author: 'Martin Fowler',
    categories: ['Programación'],
    description:
      'Mejora del diseño del código existente, mostrando cómo mejorar la estructura del código sin cambiar su comportamiento.',
    year: 1999,
    cover: '/lectura/refactoring.jpg',
    isbn: '0134757599',
  },
  {
    id: '5',
    title: "You Don't Know JS",
    author: 'Kyle Simpson',
    categories: ['Programación'],
    description:
      'Serie de libros que profundiza en los mecanismos internos del lenguaje JavaScript.',
    cover: '/lectura/you-dont-know-js.jpg',
    isbn: '1491924462',
  },
  {
    id: '6',
    title: 'The Mythical Man-Month',
    author: 'Frederick P. Brooks Jr.',
    categories: ['Gestión'],
    description:
      'Ensayos sobre ingeniería de software que explican por qué agregar más personas a un proyecto retrasado lo retrasa aún más.',
    year: 1975,
    cover: '/lectura/the-mythical-man-month.jpg',
    isbn: '0201835959',
  },
  {
    id: '7',
    title: 'Code Complete',
    author: 'Steve McConnell',
    categories: ['Programación'],
    description:
      'Una guía práctica para la construcción de software que cubre todo el proceso de desarrollo.',
    year: 1993,
    cover: '/lectura/code-complete.jpg',
    isbn: '0735619670',
  },
  {
    id: '8',
    title: 'Domain-Driven Design',
    author: 'Eric Evans',
    categories: ['Arquitectura'],
    description:
      'Un enfoque para el desarrollo de software complejo conectando la implementación a un modelo en evolución.',
    year: 2003,
    cover: '/lectura/domain-driven-design.jpg',
    isbn: '0321125215',
  },
  {
    id: '9',
    title: 'Mastering Event-Driven Microservices on AWS',
    author: 'Sheen Brisals, Luke Hedger',
    categories: ['Arquitectura'],
    description:
      'Una guía práctica para diseñar y construir arquitecturas de microservicios orientadas a eventos utilizando los servicios nativos de AWS.',
    year: 2024,
    cover: '/lectura/mastering-event-driven-microservices.jpg',
    isbn: 'B0DF49L9QJ',
  },
  {
    id: '10',
    title: 'Mastering Serverless Computing with AWS Lambda',
    author: 'Marcia Villalba',
    categories: ['Arquitectura'],
    description:
      'Una guía completa para dominar el cómputo serverless con AWS Lambda, abarcando patrones, rendimiento y mejores prácticas de producción.',
    year: 2024,
    cover: '/lectura/mastering-serverless-computing.jpg',
    isbn: 'B0DN6TJ323',
  },
  {
    id: '11',
    title: '97 Things Every Software Architect Should Know',
    author: 'Richard Monson-Haefel (ed.)',
    categories: ['Arquitectura'],
    description:
      'Una colección de consejos prácticos de los arquitectos de software más experimentados del mundo, organizados en 97 lecciones esenciales.',
    year: 2009,
    cover: '/lectura/97-things-software-architect.jpg',
    isbn: '059652269X',
  },
  {
    id: '12',
    title: 'Balancing Coupling in Software Design',
    author: 'Vladislav Khononov',
    categories: ['Arquitectura'],
    description:
      'Un análisis profundo del acoplamiento en el diseño de software, con estrategias para balancearlo y construir sistemas más mantenibles y evolutivos.',
    year: 2023,
    cover: '/lectura/balancing-coupling.jpg',
    isbn: '0137353480',
  },
  {
    id: '13',
    title: 'Patterns for API Design',
    author: 'Olaf Zimmermann, Mirko Stocker, Daniel Lübke, Uwe Zdun, Cesare Pautasso',
    categories: ['Arquitectura'],
    description:
      'Un catálogo de patrones probados para diseñar APIs robustas, comprensibles y evolutivas, con énfasis en comunicación entre servicios.',
    year: 2022,
    cover: '/lectura/patterns-of-api-design.jpg',
    isbn: '0137670109',
  },
  {
    id: '14',
    title: 'Principles of Web API Design',
    author: 'James Higginbotham',
    categories: ['Arquitectura'],
    description:
      'Un enfoque sistemático para diseñar APIs web de alta calidad, cubriendo modelado de dominio, contratos y gestión del ciclo de vida.',
    year: 2021,
    cover: '/lectura/principles-web-api-design.jpg',
    isbn: '0137355637',
  },
  {
    id: '15',
    title: 'Strategic Monoliths and Microservices',
    author: 'Vaughn Vernon, Tomasz Jaskula',
    categories: ['Arquitectura'],
    description:
      'Una guía estratégica para decidir cuándo usar monolitos o microservicios, con énfasis en Domain-Driven Design y contextos acotados.',
    year: 2022,
    cover: '/lectura/strategic-monoliths-microservices.jpg',
    isbn: '0137355467',
  },
  {
    id: '16',
    title: 'Continuous Architecture in Practice',
    author: 'Murat Erder, Pierre Pureur, Eoin Woods',
    categories: ['Arquitectura'],
    description:
      'Un enfoque para practicar la arquitectura de software de forma continua en equipos ágiles, integrando decisiones de diseño en el flujo de desarrollo.',
    year: 2021,
    cover: '/lectura/continuous-architecture.jpg',
    isbn: '0136523560',
  },
  {
    id: '17',
    title: 'Adaptive Systems with Domain-Driven Design, Wardley Mapping, and Team Topologies',
    author: 'Michael Plöd, Christian Stettler, Alban Frei, Nick Tune',
    categories: ['Arquitectura'],
    description:
      'Combina Domain-Driven Design, Wardley Maps y Team Topologies para construir organizaciones y sistemas de software verdaderamente adaptativos.',
    year: 2022,
    cover: '/lectura/adaptive-systems-ddd.jpg',
    isbn: '0137393032',
  },
  {
    id: '18',
    title: 'Test Driven Development: By Example',
    author: 'Kent Beck',
    categories: ['Programación'],
    description:
      'El libro fundacional del TDD: muestra paso a paso cómo escribir tests antes que el código para producir software más limpio y con menos defectos.',
    year: 2002,
    cover: '/lectura/test-driven-development.jpg',
    isbn: '0321146530',
  },
  {
    id: '19',
    title: 'Modern Software Engineering',
    author: 'David Farley',
    categories: ['Programación'],
    description:
      'Un manifiesto para la ingeniería de software moderna, que integra entrega continua, TDD y principios de diseño para construir software de calidad.',
    year: 2021,
    cover: '/lectura/modern-software-engineering.jpg',
    isbn: '0137314914',
  },
  {
    id: '20',
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    categories: ['Arquitectura'],
    description:
      'Una guía profunda sobre los principios y prácticas detrás de los sistemas de datos confiables, escalables y mantenibles.',
    year: 2017,
    cover: '/lectura/designing-data-intensive.jpg',
    isbn: 'B0FWY1P6PS',
  },
  {
    id: '21',
    title: 'Agile Testing',
    author: 'Lisa Crispin, Janet Gregory',
    categories: ['Programación', 'Testing'],
    description:
      'Una guía práctica para testers y equipos ágiles que muestra cómo integrar el testing en el proceso de desarrollo para entregar software de calidad.',
    year: 2008,
    cover: '/lectura/agile-testing.jpg',
    isbn: '0321534468',
  },
  {
    id: '22',
    title: 'Cracking the Coding Interview',
    author: 'Gayle Laakmann McDowell',
    categories: ['Programación'],
    description:
      'La guía más completa para preparar entrevistas técnicas de programación, con 189 preguntas y soluciones detalladas.',
    year: 2015,
    cover: '/lectura/cracking-the-coding-interview.jpg',
    isbn: '0984782850',
  },
  {
    id: '23',
    title: 'Applying UML and Patterns',
    author: 'Craig Larman',
    categories: ['Arquitectura'],
    description:
      'Una introducción al análisis y diseño orientado a objetos con UML y patrones de diseño aplicados al desarrollo iterativo.',
    year: 2004,
    cover: '/lectura/applying-uml-and-patterns.jpg',
    isbn: '0131489062',
  },
  {
    id: '24',
    title: 'Algoritmos a Fondo',
    author: 'Pablo Albero Sznajdleder',
    categories: ['Programación'],
    description:
      'Un recorrido exhaustivo por las estructuras de datos y algoritmos fundamentales, con implementaciones prácticas en C y Java.',
    year: 2013,
    cover: '/lectura/algoritmos-a-fondo.jpg',
    isbn: '987160937X',
  },
  {
    id: '25',
    title: 'Construcción de software con una mirada ágil',
    author: 'Diego Fontdevila, Alfredo Fernández, Jorge Aguirre',
    categories: ['Programación'],
    description:
      'Un enfoque ágil para la construcción de software que combina prácticas de ingeniería moderna con metodologías iterativas de desarrollo.',
    year: 2016,
    cover: '/lectura/construccion-software-agil.jpg',
    isbn: 'B01M1L858Z',
  },
  {
    id: '26',
    title: 'Engineering Management for the Rest of Us',
    author: 'Sarah Drasner',
    categories: ['Gestión'],
    description:
      'Una guía práctica sobre gestión de ingeniería para quienes no tienen formación formal en management, cubriendo comunicación, contratación, retroalimentación y cultura de equipo.',
    year: 2022,
    cover: '/lectura/engineering-management-rest-of-us.jpg',
    isbn: '9798986769318',
  },
  {
    id: '27',
    title: 'Getting Real',
    author: '37signals',
    categories: ['Gestión'],
    description:
      'El enfoque de 37signals para construir software web exitoso: más chico, más rápido y mejor, evitando funciones, reuniones y planes innecesarios.',
    year: 2006,
    cover: '/lectura/getting-real.jpg',
    isbn: '0578012812',
  },
  {
    id: '28',
    title: 'Shape Up',
    author: 'Ryan Singer',
    categories: ['Gestión'],
    description:
      'El método de 37signals para dar forma, apostar y construir producto en ciclos de seis semanas, sin estimaciones ni backlogs interminables.',
    year: 2019,
    cover: '/lectura/shape-up.jpg',
    isbn: '9780578511849',
  },
  {
    id: '29',
    title: 'Remote: Office Not Required',
    author: 'Jason Fried, David Heinemeier Hansson',
    categories: ['Gestión'],
    description:
      'Argumenta por qué el trabajo remoto es el futuro y cómo hacerlo bien, derribando los mitos sobre productividad y colaboración a distancia.',
    year: 2013,
    cover: '/lectura/remote.jpg',
    isbn: '0804137501',
  },
  {
    id: '30',
    title: "It Doesn't Have to Be Crazy at Work",
    author: 'Jason Fried, David Heinemeier Hansson',
    categories: ['Gestión'],
    description:
      'Un manifiesto contra la cultura del ajetreo: cómo construir una empresa tranquila, rentable y sostenible sin largas jornadas ni estrés crónico.',
    year: 2018,
    cover: '/lectura/it-doesnt-have-to-be-crazy-at-work.jpg',
    isbn: '0062874780',
  },
  {
    id: '31',
    title: 'Rework',
    author: 'Jason Fried, David Heinemeier Hansson',
    categories: ['Gestión'],
    description:
      'Una visión disruptiva y directa sobre cómo trabajar y emprender, descartando las convenciones tradicionales de los negocios.',
    year: 2010,
    cover: '/lectura/rework.jpg',
    isbn: '0307463745',
  },
  {
    id: '32',
    title: 'Refactoring UI',
    author: 'Adam Wathan, Steve Schoger',
    categories: ['Diseño'],
    description:
      'Aprendé a diseñar interfaces hermosas con tácticas concretas y accionables en lugar de principios abstractos: jerarquía, espaciado, color, tipografía y más.',
    cover: '/lectura/refactoring-ui.jpg',
    url: 'https://refactoringui.com/',
  },
  {
    id: '33',
    title: 'Practical UI',
    author: 'Adham Dannaway',
    categories: ['Diseño'],
    description:
      'Más de 100 guías prácticas y basadas en lógica para crear interfaces intuitivas, accesibles y atractivas, con ejemplos visuales.',
    cover: '/lectura/practical-ui.jpg',
    url: 'https://www.practical-ui.com/',
  },
  {
    id: '34',
    title: 'How To Design Better',
    author: 'UI Adrian',
    categories: ['Diseño'],
    description:
      'Recurso de educación en diseño que cubre fundamentos de UI/UX, diseño de componentes y mejores prácticas, con ejemplos visuales y guías accionables.',
    cover: '/lectura/how-to-design-better.jpg',
    url: 'https://www.howtodesignbetter.com/ebook',
  },
  {
    id: '35',
    title: 'Better Small Talk',
    author: 'Patrick King',
    categories: ['Comunicación'],
    description:
      'Una guía práctica para mejorar las conversaciones cotidianas, reducir la incomodidad social y construir conexiones más profundas y auténticas.',
    year: 2020,
    cover: '/lectura/better-small-talk.jpg',
    isbn: 'B087349Q57',
  },
  {
    id: '36',
    title: 'One Presentation Away',
    author: 'Colin Boyd',
    categories: ['Comunicación'],
    description:
      'Estrategias para convertirse en un orador irresistible que transforma presentaciones en oportunidades de negocio con confianza y claridad.',
    year: 2025,
    cover: '/lectura/one-presentation-away.jpg',
    isbn: '1394324316',
  },
  {
    id: '37',
    title: 'Domain-Driven Refactoring',
    author: 'Alessandro Colla, Alberto Acerbis',
    categories: ['Arquitectura'],
    description:
      'Una guía práctica para aplicar Domain-Driven Design en la transformación de monolitos en sistemas modulares y microservicios.',
    year: 2025,
    cover: '/lectura/domain-driven-refactoring.jpg',
    isbn: '1835889107',
  },
  {
    id: '38',
    title: 'The Rust Programming Language',
    author: 'Steve Klabnik, Carol Nichols',
    categories: ['Programación'],
    description:
      'El libro oficial del lenguaje Rust: cubre propiedad, tipado, concurrencia y seguridad de memoria desde los fundamentos hasta temas avanzados.',
    year: 2023,
    cover: '/lectura/the-rust-programming-language.jpg',
    isbn: '1718503105',
  },
  {
    id: '39',
    title: 'The Book of Ruby',
    author: 'Huw Collingbourne',
    categories: ['Programación'],
    description:
      'Una introducción exhaustiva al lenguaje Ruby con ejemplos prácticos que van desde los conceptos básicos hasta técnicas orientadas a objetos avanzadas.',
    year: 2011,
    cover: '/lectura/the-book-of-ruby.jpg',
    isbn: '1593272944',
  },
  {
    id: '40',
    title: 'The Principles of Object-Oriented JavaScript',
    author: 'Nicholas C. Zakas',
    categories: ['Programación'],
    description:
      'Explora en profundidad los mecanismos orientados a objetos de JavaScript, incluyendo prototipos, constructores, herencia y patrones de diseño.',
    year: 2014,
    cover: '/lectura/principles-of-object-oriented-javascript.jpg',
    isbn: '1593275404',
  },
  {
    id: '41',
    title: 'Data Structures and Algorithms in JavaScript',
    author: 'Federico Kereki',
    categories: ['Programación'],
    description:
      'Implementación y análisis de las estructuras de datos y algoritmos más importantes utilizando JavaScript moderno.',
    year: 2025,
    cover: '/lectura/data-structures-and-algorithms-in-javascript.jpg',
    isbn: '1718502621',
  },
  {
    id: '42',
    title: 'Domain-Driven Design Reference',
    author: 'Eric Evans',
    categories: ['Arquitectura'],
    description:
      'Una referencia compacta con las definiciones canónicas y resúmenes de patrones del Domain-Driven Design, ideal como guía de consulta rápida.',
    year: 2014,
    cover: '/lectura/domain-driven-design-reference.jpg',
    isbn: '1457501198',
  },
  {
    id: '43',
    title: 'Coding Interview Patterns',
    author: 'Alex Xu, Shaun Gunawardane',
    categories: ['Programación'],
    description:
      'Un enfoque sistemático basado en patrones para resolver preguntas de entrevistas de programación con confianza y eficiencia.',
    year: 2024,
    cover: '/lectura/coding-interview-patterns.jpg',
    isbn: '1736049135',
  },
  {
    id: '44',
    title: "System Design Interview – An Insider's Guide",
    author: 'Alex Xu',
    categories: ['Arquitectura'],
    description:
      'Una guía para superar entrevistas de diseño de sistemas, con casos de estudio detallados sobre sistemas escalables y distribuidos.',
    year: 2020,
    cover: '/lectura/system-design-interview.jpg',
    isbn: 'B08CMF2CQF',
  },
  {
    id: '45',
    title: 'Start. Scale. Exit. Repeat.',
    author: 'Colin C. Campbell',
    categories: ['Negocios'],
    description:
      'Los secretos de los emprendedores en serie para crear, escalar, vender y repetir el ciclo de construcción de startups exitosas.',
    year: 2024,
    cover: '/lectura/start-scale-exit-repeat.jpg',
    isbn: 'B0CYWGZ6YL',
  },
  {
    id: '46',
    title: 'Kickstart Database Management System Fundamentals',
    author: 'Jagdish Chandra Patni, Latika Pinjarkar',
    categories: ['Arquitectura'],
    description:
      'Una introducción clara y práctica a los fundamentos de los sistemas de gestión de bases de datos, incluyendo modelado, SQL y optimización.',
    year: 2024,
    cover: '/lectura/kickstart-database-management-systems.jpg',
    isbn: 'B0DQLLMB5W',
  },
  {
    id: '47',
    title: "The Staff Engineer's Path",
    author: 'Tanya Reilly',
    categories: ['Gestión'],
    description:
      'Una guía para ingenieros senior que navegan el crecimiento como contribuidores individuales en roles de staff engineer y liderazgo técnico.',
    year: 2022,
    cover: '/lectura/the-staff-engineers-path.jpg',
    isbn: '1098118731',
  },
  {
    id: '48',
    title: 'Monolith to Microservices',
    author: 'Sam Newman',
    categories: ['Arquitectura'],
    description:
      'Patrones evolutivos y prácticos para migrar sistemas monolíticos hacia arquitecturas de microservicios de forma gradual y segura.',
    year: 2019,
    cover: '/lectura/monolith-to-microservices.jpg',
    isbn: '1492047848',
  },
  {
    id: '49',
    title: 'Foundations of Software Testing: ISTQB Certification',
    author: 'Dorothy Graham, Rex Black, Erik van Veenendaal',
    categories: ['Testing'],
    description:
      'Los fundamentos del testing de software según el currículo oficial del ISTQB, cubriendo principios, técnicas y gestión del ciclo de pruebas.',
    year: 2019,
    cover: '/lectura/foundations-of-software-testing.jpg',
    isbn: '1473764793',
  },
  {
    id: '50',
    title: "The Manager's Path",
    author: 'Camille Fournier',
    categories: ['Gestión'],
    description:
      'Una hoja de ruta para líderes de ingeniería en cada etapa de su carrera: desde tech lead hasta CTO, con consejos prácticos y honestos.',
    year: 2017,
    cover: '/lectura/the-managers-path.jpg',
    isbn: '1491973897',
  },
  {
    id: '51',
    title: 'Software Architecture: The Hard Parts',
    author: 'Neal Ford, Mark Richards, Pramod Sadalage, Zhamak Dehghani',
    categories: ['Arquitectura'],
    description:
      'Análisis de las difíciles decisiones arquitectónicas en sistemas distribuidos, con trade-offs entre descomposición, comunicación y gestión de datos.',
    year: 2021,
    cover: '/lectura/software-architecture-the-hard-parts.jpg',
    isbn: '1492086894',
  },
  {
    id: '52',
    title: 'React Key Concepts',
    author: 'Maximilian Schwarzmüller',
    categories: ['Programación'],
    description:
      'Una guía en profundidad sobre los conceptos fundamentales de React: componentes, estado, efectos, contexto y las características del React moderno.',
    year: 2022,
    cover: '/lectura/react-key-concepts.jpg',
    isbn: '183620227X',
  },
  {
    id: '53',
    title: 'Accelerate',
    author: 'Nicole Forsgren, Jez Humble, Gene Kim',
    categories: ['DevOps', 'Gestión'],
    description:
      'Investigación basada en datos sobre las prácticas de DevOps y entrega continua que distinguen a las organizaciones tecnológicas de alto rendimiento.',
    year: 2018,
    cover: '/lectura/accelerate.jpg',
    isbn: '1942788339',
  },
  {
    id: '54',
    title: 'Build: Elements of an Effective Software Organization',
    author: 'Rebecca Murphey, Otto Hilska',
    categories: ['Gestión'],
    description:
      'Principios y prácticas para construir organizaciones de ingeniería de software efectivas, desde la cultura hasta los procesos técnicos.',
    year: 2024,
    cover: '/lectura/build-effective-software-organization.jpg',
    isbn: 'B0CT7KLXKL',
  },
  {
    id: '55',
    title: 'Mastering Efficient Software Design Practices',
    author: 'Paulo Cardoso',
    categories: ['DevOps'],
    description:
      'Técnicas para desarrollar software escalable y de alto rendimiento aplicando metodologías ágiles, DevOps, CI/CD y herramientas modernas.',
    year: 2025,
    cover: '/lectura/mastering-efficient-software-design.jpg',
    isbn: 'B0F6VJWRL4',
  },
  {
    id: '56',
    title: 'Lead With Empathy',
    author: 'Pete Srodoski',
    categories: ['Gestión'],
    description:
      'Cómo elevar las habilidades de liderazgo poniendo la empatía en el centro para construir equipos sólidos e inspirar cambios duraderos en la organización.',
    year: 2023,
    cover: '/lectura/lead-with-empathy.jpg',
    isbn: 'B0CJLLN8RL',
  },
  {
    id: '57',
    title: 'Improving Agile Retrospectives',
    author: 'Marc Loeffler',
    categories: ['Gestión'],
    description:
      'Técnicas concretas para hacer retrospectivas ágiles más efectivas, dinámicas y orientadas a la mejora continua del equipo.',
    year: 2017,
    cover: '/lectura/improving-agile-retrospectives.jpg',
    isbn: '0134678346',
  },
  {
    id: '58',
    title: 'Developer Testing: Building Quality into Software',
    author: 'Alexander Tarlinder',
    categories: ['Testing'],
    description:
      'Un enfoque integral sobre testing para desarrolladores, cubriendo técnicas de unit testing, mocks y TDD para construir software de calidad.',
    year: 2016,
    cover: '/lectura/developer-testing.jpg',
    isbn: '0134291069',
  },
  {
    id: '59',
    title: 'Management 3.0',
    author: 'Jurgen Appelo',
    categories: ['Gestión'],
    description:
      'Un enfoque moderno y sistémico para la gestión de equipos ágiles, combinando complejidad, motivación y prácticas de liderazgo adaptativo.',
    year: 2010,
    cover: '/lectura/management-3-0.jpg',
    isbn: '0321712471',
  },
  {
    id: '60',
    title: 'More Agile Testing',
    author: 'Janet Gregory, Lisa Crispin',
    categories: ['Testing'],
    description:
      'Continúa el viaje del testing ágil con nuevas técnicas, casos de estudio y reflexiones sobre la calidad en equipos modernos de desarrollo.',
    year: 2014,
    cover: '/lectura/more-agile-testing.jpg',
    isbn: '0321967054',
  },
  {
    id: '61',
    title: 'Web Security for Developers',
    author: 'Malcolm McDonald',
    categories: ['Seguridad'],
    description:
      'Una guía práctica sobre las principales amenazas de seguridad web — XSS, CSRF, inyección SQL y más — con defensas concretas para desarrolladores.',
    year: 2020,
    cover: '/lectura/web-security-for-developers.jpg',
    isbn: '1593279949',
  },
  {
    id: '62',
    title: 'The Site Reliability Workbook',
    author: 'Betsy Beyer, Niall Richard Murphy, David K. Rensin, Kent Kawahara, Stephen Thorne',
    categories: ['DevOps'],
    description:
      'Un compendio práctico de implementaciones reales de SRE con ejercicios y casos de uso para aplicar los principios de confiabilidad de Google.',
    year: 2018,
    cover: '/lectura/the-site-reliability-workbook.jpg',
    isbn: '1492029505',
  },
  {
    id: '63',
    title: 'Chaos Engineering',
    author: 'Casey Rosenthal, Nora Jones',
    categories: ['DevOps'],
    description:
      'Principios y prácticas de la ingeniería del caos para probar y mejorar la resiliencia de sistemas distribuidos en producción.',
    year: 2020,
    cover: '/lectura/chaos-engineering.jpg',
    isbn: '1492043869',
  },
  {
    id: '64',
    title: 'Observability Engineering',
    author: 'Charity Majors, Liz Fong-Jones, George Miranda',
    categories: ['DevOps'],
    description:
      'Cómo lograr excelencia en producción mediante observabilidad: trazas, métricas y logs para entender sistemas complejos en tiempo real.',
    year: 2022,
    cover: '/lectura/observability-engineering.jpg',
    isbn: '1492076449',
  },
  {
    id: '65',
    title: 'Software Architecture Metrics',
    author: 'Christian Ciceri et al.',
    categories: ['Arquitectura'],
    description:
      'Casos de estudio sobre métricas de arquitectura de software para evaluar, monitorear y mejorar la calidad estructural de los sistemas.',
    year: 2022,
    cover: '/lectura/software-architecture-metrics.jpg',
    isbn: '1098112237',
  },
  {
    id: '66',
    title: 'Site Reliability Engineering',
    author: 'Betsy Beyer, Chris Jones, Jennifer Petoff, Niall Richard Murphy',
    categories: ['DevOps'],
    description:
      'Cómo Google ejecuta sus sistemas de producción: principios, prácticas y herramientas de SRE para sistemas a escala global.',
    year: 2016,
    cover: '/lectura/site-reliability-engineering.jpg',
    isbn: '149192912X',
  },
  {
    id: '67',
    title: 'The Pricing Roadmap',
    author: 'Ulrik Lehrskov-Schmidt',
    categories: ['Negocios'],
    description:
      'Una guía estructurada para diseñar modelos de precios B2B SaaS que maximizan el valor percibido y la satisfacción del cliente.',
    year: 2023,
    cover: '/lectura/the-pricing-roadmap.jpg',
    isbn: '1544536313',
  },
  {
    id: '68',
    title: 'The SaaS Playbook',
    author: 'Rob Walling',
    categories: ['Negocios'],
    description:
      'Estrategias probadas para construir un negocio SaaS multimillonario sin capital de riesgo, aplicando principios de bootstrapping y crecimiento sostenible.',
    year: 2023,
    cover: '/lectura/the-saas-playbook.jpg',
    isbn: 'B0C87KHT1L',
  },
  {
    id: '69',
    title: 'Python Crash Course',
    author: 'Eric Matthes',
    categories: ['Programación'],
    description:
      'Una introducción práctica y basada en proyectos al lenguaje Python, cubriendo fundamentos, visualización de datos, aplicaciones web y juegos.',
    year: 2023,
    cover: '/lectura/python-crash-course.jpg',
    isbn: '1718502702',
  },
  {
    id: '70',
    title: 'Software Architecture Patterns for Serverless Systems',
    author: 'John Gilbert',
    categories: ['Arquitectura'],
    description:
      'Patrones de arquitectura para construir sistemas serverless modernos con microservicios orientados a eventos y micro frontends.',
    year: 2024,
    cover: '/lectura/software-architecture-patterns-serverless.jpg',
    isbn: '1803235446',
  },
  {
    id: '71',
    title: 'How AI Works',
    author: 'Ronald T. Kneusel',
    categories: ['IA'],
    description:
      'Una explicación accesible y rigurosa de los fundamentos matemáticos y algorítmicos detrás de la inteligencia artificial moderna.',
    year: 2023,
    cover: '/lectura/how-ai-works.jpg',
    isbn: '1718503725',
  },
  {
    id: '72',
    title: 'Serverless as a Game Changer',
    author: 'Joseph Emison',
    categories: ['Arquitectura'],
    description:
      'Cómo aprovechar al máximo el modelo serverless en la nube para transformar la forma en que se construye y opera software a escala.',
    year: 2024,
    cover: '/lectura/serverless-as-a-game-changer.jpg',
    isbn: '0137392621',
  },
].sort((a, b) => a.title.localeCompare(b.title));

const categories = [
  'Todas las categorías',
  ...Array.from(new Set(books.flatMap((book) => book.categories))),
];

const BookRow = ({ book }: { book: Book }) => {
  const content = (
    <>
      {/* Cover shown as a physical book: a lit spine, page edge and a tilt towards the reader
          on hover. Covers come in different proportions, so the book hugs the whole image
          inside a fixed slot that keeps every row's text aligned. */}
      <div className="flex h-32 w-[6.5rem] shrink-0 items-start justify-center [perspective:600px] sm:h-36 sm:w-[7.5rem]">
        <div className="relative w-fit rounded-[2px] shadow-[4px_6px_18px_-6px_rgba(0,0,0,0.9)] ring-1 ring-pcnGreen-200 transition-[transform,box-shadow] duration-300 ease-out [transform-origin:left_center] group-hover:shadow-[10px_10px_28px_-8px_rgba(4,244,190,0.45)] group-hover:ring-pcnGreen-500 motion-safe:group-hover:[transform:rotateY(-14deg)]">
          <Image
            src={book.cover}
            alt={`Portada de ${book.title}`}
            width={240}
            height={360}
            className="block h-auto max-h-32 w-auto max-w-[6.5rem] rounded-[2px] bg-muted sm:max-h-36 sm:max-w-[7.5rem]"
            sizes="120px"
          />
          <span className="pointer-events-none absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/60 via-white/10 to-transparent" />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start gap-2 font-mono text-sm">
          {/* Long titles wrap on phones instead of being cut off. */}
          <h2 className="font-semibold group-hover:text-pcnGreen md:truncate">{book.title}</h2>
          <span className="ml-auto flex shrink-0 items-center gap-1 pt-0.5 text-[11px] text-muted-foreground group-hover:text-pcnGreen">
            {book.year}
            {book.url && <ArrowUpRight className="h-3 w-3" />}
          </span>
        </div>

        <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
          {book.description}
        </p>

        <p className="truncate font-mono text-[11px] text-muted-foreground/70">
          <span className="text-pcnGreen-500">@ </span>
          {book.author}
          <span className="text-pcnGreen-500"> # </span>
          {book.categories.join(' · ')}
          {book.isbn && ` · isbn ${book.isbn}`}
        </p>
      </div>
    </>
  );

  // The tilted cover and its glow are clipped so they never spill past the row's hairlines.
  const className = cn(ruledCellClassName, 'group flex gap-4 overflow-hidden p-3');

  return book.url ? (
    <Link href={book.url} target="_blank" rel="noopener noreferrer" className={className}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
};

const ReadingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas las categorías');
  const [activeTab, setActiveTab] = useState<'libros' | 'articulos'>('libros');
  const [readerArticle, setReaderArticle] = useState<Article | null>(null);
  const [readStatus, setReadStatus] = useState<ReadStatus>('todos');
  const savedCount = useContentMarks('article').ids('saved').size;

  // `/lectura?lista=para-leer` opens straight into the user's reading list (and any other
  // status filter), so it can be bookmarked or linked from elsewhere.
  useEffect(() => {
    const lista = new URLSearchParams(window.location.search).get('lista');
    if (isReadStatus(lista)) {
      setActiveTab('articulos');
      setReadStatus(lista);
    }
  }, []);

  const handleReadStatusChange = (status: ReadStatus) => {
    setReadStatus(status);
    const url = new URL(window.location.href);
    if (status === 'todos') url.searchParams.delete('lista');
    else url.searchParams.set('lista', status);
    window.history.replaceState(null, '', url);
  };

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'Todas las categorías' || book.categories.includes(selectedCategory);

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'Todas las categorías' || article.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'libros' | 'articulos');
    setSelectedCategory('Todas las categorías');
  };

  return (
    <>
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="mt-4">
          <PageTitle
            path="lectura"
            meta={`${books.length} libros · ${articles.length} artículos`}
          />

          <div className="mb-4">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="mb-4">
                <TabsTrigger value="libros">Libros</TabsTrigger>
                <TabsTrigger value="articulos">
                  Artículos
                  {savedCount > 0 && (
                    <span
                      title={`${savedCount} en tu lista para leer`}
                      className="ml-1 bg-pcnGreen px-1 text-[10px] tabular-nums text-black"
                    >
                      {savedCount}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Filtros compartidos */}
              <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center">
                {/* Búsqueda */}
                <SearchBar
                  searchQuery={searchTerm}
                  setSearchQuery={setSearchTerm}
                  placeholder="título, autor o descripción"
                  label="Buscar por título, autor o descripción"
                  className="max-w-none flex-1"
                />

                {/* Filtro por categoría (los artículos filtran desde su propio histograma) */}
                {activeTab === 'libros' && (
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Tab: Libros */}
              <TabsContent value="libros">
                {filteredBooks.length > 0 ? (
                  <RuledGrid className="grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
                    {filteredBooks.map((book) => (
                      <BookRow key={book.id} book={book} />
                    ))}
                  </RuledGrid>
                ) : (
                  <p className="py-8 text-center font-mono text-sm text-muted-foreground">
                    No se encontraron libros con los filtros seleccionados.
                  </p>
                )}
              </TabsContent>

              {/* Tab: Artículos */}
              <TabsContent value="articulos">
                <ArticlesPanel
                  articles={articles}
                  filteredArticles={filteredArticles}
                  category={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  onOpen={setReaderArticle}
                  status={readStatus}
                  onStatusChange={handleReadStatusChange}
                />
              </TabsContent>
            </Tabs>
          </div>

          <ArticleReaderDialog
            article={readerArticle}
            open={!!readerArticle}
            onOpenChange={(open) => {
              if (!open) setReaderArticle(null);
            }}
          />

          {/* Banner AgusLogs */}
          <RuledGrid className="mb-14 grid-cols-1">
            <Link
              href="https://aguslogs.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(ruledCellClassName, 'group flex items-center gap-3 p-3')}
            >
              <Image
                src="/aguslogs-logo.png"
                alt="AgusLogs"
                width={36}
                height={36}
                className="h-9 w-9 shrink-0 rounded-sm"
              />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm font-semibold group-hover:text-pcnGreen">
                  AgusLogs
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  Aprendé y crecé como ingeniero de software.
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-1 font-mono text-[11px] text-muted-foreground group-hover:text-pcnGreen">
                aguslogs.com
                <ArrowUpRight className="h-3 w-3" />
              </span>
            </Link>
          </RuledGrid>
        </div>
      </div>
    </>
  );
};

export default ReadingPage;
