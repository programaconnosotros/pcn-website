import { PageTitle } from '@/components/ui/page-title';
import { TableOfContents } from '@/components/historia/table-of-contents';
import { HistoriaImage, HistoriaGallery } from '@/components/historia/historia-image';
import {
  HistoriaProse,
  HistoriaSection,
  HistoriaTimeline,
} from '@/components/historia/historia-section';
import { MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

const founders = [
  'Agustín Sánchez',
  'Mauricio Sánchez',
  'Esteban Sánchez',
  'Germán Navarro',
  'Marcelo Núñez',
  'Iván Taddei',
];

const lightningTalksNextGen = [
  {
    title: 'Cómo Construir una Carrera Exponencial en Tecnología',
    speaker: 'Ing. Alejo Boga',
    role: 'Senior AI Engineer en Santander Tecnología',
  },
  {
    title: 'Effective Agentic Coding',
    speaker: 'Agustín Sánchez',
    role: 'Senior Software Engineer en Eagerworks, Director de DIZENZ y Líder de PCN',
  },
  {
    title: 'Buscando el Diseño Perfecto',
    speaker: 'Ing. Mauricio Sánchez',
    role: 'Staff Software Engineer en PedidosYa, Co-fundador de PCN',
  },
  {
    title: '5 Consejos de Supervivencia Backend',
    speaker: 'Ing. Marcelo de Jesús Núñez',
    role: 'Senior Software Engineer en Bowery, Co-fundador de PCN',
  },
  {
    title:
      'Stablecoins, Mercados 24/7 y Activos Tokenizados: Blockchain, el Nuevo Stack Financiero',
    speaker: 'Ing. Franco Pérez',
    role: 'Founder de Crisol Studio',
  },
  {
    title: 'Anatomía de un Agente de IA: Qué son y cómo funcionan',
    speaker: 'Franco Jose Espinoza',
    role: 'Founder & Lead Developer en Section 05',
  },
  {
    title:
      'De MVP a Pro: Evolución de interfaces complejas y carga cognitiva (Caso Volley Manager)',
    speaker: 'Fabio Ramos',
    role: 'Lead Software Engineer en CAW Tech',
  },
  {
    title: 'NEX OS: Ingeniería de Sistemas Operativos en la Web y Optimización Extrema',
    speaker: 'Salvador Juárez y Yamil Cardozo',
    role: 'Software Engineer en Bitflow · Estudiante IES',
  },
  {
    title: 'El Atacante que Llegó por el npm install',
    speaker: 'Ismael Chávez',
    role: 'Software Developer & Pentester en Endpoint Consulting',
  },
  {
    title: 'No te Reemplaza la IA, te Reemplaza el QA que la Usa',
    speaker: 'Leo Apaza',
    role: 'Software Development Engineer in Test en Assist-365',
  },
];

export const metadata: Metadata = {
  title: 'Historia',
  description:
    'Cómo nació programaConNosotros: desde un grupo de estudiantes apasionados en la UTN-FRT hasta una comunidad regional de ingeniería de software. Conocé a los fundadores y los pasos que nos trajeron hasta acá.',
  openGraph: {
    title: 'Nuestra historia | programaConNosotros',
    description:
      'Cómo nació programaConNosotros: desde un grupo de estudiantes apasionados en la UTN-FRT hasta una comunidad regional de ingeniería de software. Conocé a los fundadores y los pasos que nos trajeron hasta acá.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
    url: `${SITE_URL}/historia`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nuestra historia | programaConNosotros',
    description:
      'Cómo nació programaConNosotros: desde un grupo de estudiantes apasionados en la UTN-FRT hasta una comunidad regional de ingeniería de software. Conocé a los fundadores y los pasos que nos trajeron hasta acá.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
  },
};

const PCNStory = () => (
  <>
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <PageTitle
          sticky
          path="historia"
          meta="de un grupo de estudiantes a una comunidad sin fronteras · 2015 → hoy"
        />

        <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
          <TableOfContents />

          <div className="min-w-0 flex-1">
            <div className="mx-auto max-w-3xl border border-pcnGreen-200">
              <section
                id="introduccion"
                className="scroll-mt-32 border-b border-pcnGreen-200 p-4 lg:scroll-mt-28"
              >
                <h2 className="font-mono text-base font-semibold tracking-tight">
                  <span className="text-pcnGreen-500">## </span>Introducción
                </h2>
                <HistoriaProse className="mt-3">
                  <p>
                    Hola! Gracias por visitar la historia de la comunidad, esperamos te sirva para
                    entender el contexto y los valores de lo que creamos, y también motivarte a
                    colaborar en la comunidad y ayudarnos a seguir creciendo entre todos!
                  </p>
                  <p>
                    <b>programaConNosotros</b> es una comunidad de profesionales y estudiantes de
                    ingeniería de software, fundada en el año 2020 en Tucumán (Argentina), en plena
                    cuarentena por la pandemia del COVID-19. Los co-fundadores son los hermanos
                    Sánchez (Agustín, Mauricio y Esteban) junto a Germán Navarro, Marcelo Núñez e
                    Iván Taddei.
                  </p>
                  <p>
                    Si bien la comunidad fue fundada en 2020, los co-fundadores y las personas más
                    destacadas de la comunidad se conocieron varios años atrás, y queremos contar
                    toda la historia.
                  </p>
                </HistoriaProse>
                <p className="mt-4 border-t border-dashed border-pcnGreen-200 pt-3 font-mono text-xs text-muted-foreground">
                  <span className="text-pcnGreen">co-fundadores: </span>
                  {founders.join(' · ')}
                </p>
              </section>

              <HistoriaTimeline>
                <HistoriaSection id="comienzos-utn" title="Comienzos en la UTN-FRT" period="2015">
                  <p>
                    En el año 2015, en la Universidad Tecnológica de Tucumán (Argentina), se
                    conocieron Agustín Sánchez y Germán Navarro, estudiando Ingeniería en Sistemas
                    de Información. La gran pasión que tenían por la ingeniería de software,
                    particularmente por la programación, los llevó a estudiar mucho más de lo que se
                    enseñaba en la universidad y a participar de actividades extracurriculares como
                    charlas y competencias de programación.
                  </p>
                  <HistoriaImage
                    src="/historia/IMG_20230809_113640.webp"
                    alt="Comienzos en la UTN-FRT"
                  />
                </HistoriaSection>

                <HistoriaSection
                  id="voluntariado-ieee"
                  title="Voluntariado en el IEEE"
                  period="2017"
                >
                  <p>
                    En el año 2017, Agus y Germán se sumaron al IEEE para participar del programa de
                    voluntariado, que tiene como objetivo hacer networking, organizar y participar
                    de eventos técnicos.
                  </p>
                  <HistoriaImage
                    src="/historia/evento_abril (173) (2).webp"
                    alt="Voluntariado en el IEEE"
                  />
                  <p>
                    Viajaron a un evento en Catamarca llamado <b>Reunión Nacional de Ramas (RNR)</b>
                    , y se hicieron amigos de Facu Gelatti y Franco Mirada. Facu y Franco ya estaban
                    terminando de cursar la carrera y fueron mentores muy importantes para Agus y
                    Germán. Compartieron muchos eventos técnicos, destacandose los congresos de
                    Smalltalks, por la gran pasión que tenían por la programación orientada a
                    objetos.
                  </p>
                  {/* // TODO: Agregar fotos de los congresos de Smalltalks. */}
                  <p>
                    Los 4 ayudaban en la organización de algunas actividades técnicas dentro del
                    IEEE. Facu estaba dando sus primeras charlas, en aquel momento sobre Java, Git y
                    refactorización de código. Agus y Germán por su lado dieron su primera charla en
                    septiembre del 2017: Introducción a la Programación Competitiva.
                  </p>
                  {/* // TODO: Agregar flyer de la charla */}
                  <p>
                    Les apasionaba mucho la programación competitiva asi que daban clases ad-honorem
                    sobre algoritmos y estructuras de datos avanzadas aparte de cursar la carrera de
                    ingeniería. A estas clases se sumaban varios estudiantes apasionados por la
                    programación. El profesor Augusto Nasrallah y el ingeniero Jorge Buabud de la
                    UTN-FRT colaboraban prestando un laboratorio de computación de la universidad
                    para dictar estas clases.
                  </p>
                </HistoriaSection>

                <HistoriaSection id="code-warfare" title="Code Warfare" period="2017">
                  <p>
                    A finales de 2017, organizaron un torneo de programación en la UTN de Tucumán,
                    lo llamaron Code Warfare. Se anotaron muchos equipos y estuvo muy divertido.
                  </p>
                  <HistoriaImage
                    src="/historia/code-warfare-logo.webp"
                    alt="Code Warfare logo"
                    className="mx-auto max-w-lg"
                  />
                  <HistoriaGallery
                    images={[
                      { src: '/historia/photo_2017-10-08_20-24-40.webp', alt: 'Code Warfare' },
                      { src: '/historia/photo_2017-10-08_20-24-35.webp', alt: 'Code Warfare' },
                    ]}
                  />
                </HistoriaSection>

                <HistoriaSection
                  id="ieee-computer-society"
                  title="IEEE Computer Society"
                  period="2018"
                >
                  <p>
                    En el año 2018, Agus y Germán dieron un paso importante presidiendo el Capítulo
                    Estudiantil de IEEE Computer Society en la Universidad Nacional de Tucumán.
                  </p>
                </HistoriaSection>

                <HistoriaSection id="club-algoritmos" title="Club de Algoritmos" period="2018">
                  <p>
                    Agus creó un club de algoritmos que se juntaban todos los viernes desde las
                    18.00 hasta las 23.00 en un laboratorio del departamento de ingeniería en
                    sistemas de información de la UTN-FRT.
                  </p>
                  <HistoriaImage
                    src="/historia/photo_2019-10-14_01-58-25.webp"
                    alt="Club de Algoritmos"
                  />
                </HistoriaSection>

                <HistoriaSection
                  id="tucuman-hacking"
                  title="Actividades con Tucumán Hacking"
                  period="2018"
                >
                  <p>
                    En abril del 2018, organizaron el Tucumán Hack Weekend, un congreso
                    internacional de seguridad informática llevado a cabo en la UTN de Tucumán. El
                    evento fue organizado también por la organización Tucumán Hacking, presidida por
                    Victor Figueredo (ahora CEO de Endpoint Consulting).
                  </p>
                  <HistoriaGallery
                    images={[
                      { src: '/historia/evento_abril (167).webp', alt: 'Tucumán Hack Weekend' },
                      { src: '/historia/evento_abril (10).webp', alt: 'Tucumán Hack Weekend' },
                      {
                        src: '/historia/evento_abril (118) (1).webp',
                        alt: 'Tucumán Hack Weekend',
                      },
                      { src: '/historia/evento_abril (139).webp', alt: 'Tucumán Hack Weekend' },
                      { src: '/historia/evento_abril (142).webp', alt: 'Tucumán Hack Weekend' },
                      { src: '/historia/evento_abril (147).webp', alt: 'Tucumán Hack Weekend' },
                    ]}
                  />
                  <p>
                    Organizaron varios talleres de seguridad informática en conjunto con la
                    organización Tucumán Hacking, destacándose los talleres de pentesting y hacking
                    ofensivo.
                  </p>
                  <HistoriaImage
                    src="/historia/evento_abril (64).webp"
                    alt="Tucumán Hack Weekend"
                  />
                  {/* // TODO: Agregar fotos de los cursos de seguridad informática */}
                </HistoriaSection>

                <HistoriaSection id="nibble" title="Nibble" period="2019">
                  <p>
                    En el año 2019, Agus y Germán conocieron 2 personas en la UTN-FRT que se
                    convirtieron en grandes compañeros y amigos: Iván Taddei y Marcelo
                    &quot;Chelo&quot; Núñez. El grupo de los 4, bautizado por el Chelo como
                    &quot;Nibble&quot;, fue un grupo destacado en la facultad, más que nada por la
                    pasión que tenían por la ingeniería del software. Nunca fueron a la facultad
                    solo para aprobar materias y ya, sino que realmente querían entender cómo
                    funcionan las cosas, cómo se relacionan, cómo se aplican, y estudiar mucho más
                    de lo que adentro de las aulas se enseñaba.
                  </p>
                  <HistoriaImage src="/historia/IMG_1525.webp" alt="Nibble" />
                </HistoriaSection>

                <HistoriaSection
                  id="nacimiento-pcn"
                  title="El nacimiento de programaConNosotros"
                  period="2020"
                >
                  <p>
                    En el año 2020, en la Rama Estudiantil IEEE de la UTN-FRT se renovaron las
                    autoridades. Agus y Germán dieron otro paso más en su carrera del voluntariado y
                    Mauricio Sánchez se sumó también. Agus era presidente, Germán vicepresidente y
                    Mauri tesorero. Se sumaron aquel año también Chelo, Iván y Esteban para
                    colaborar en la organización de las actividades.
                  </p>
                  <p>
                    2020 estuvo marcado por la cuarentena por la pandemia del COVID-19, por lo que
                    todos los eventos organizados eran virtuales, nada presencial. El evento
                    estrella eran las Lightning Talks, jornada de charlas rápidas sobre ingeniería
                    de software.
                  </p>
                  <p>
                    El IEEE tenía muchas limitaciones que nos impedían crecer por el rumbo que
                    queríamos y dedicarnos 100% a la programación y crear la comunidad que
                    visionabamos, por lo cual, decidimos dar un paso al costado y crear nuestro
                    propio espacio de voluntariado. Es así como nace programaConNosotros (PCN para
                    los amigos).
                  </p>
                </HistoriaSection>

                <HistoriaSection
                  id="cursos-git"
                  title="Cursos de Git & GitHub con la cátedra de AED"
                  period="2020"
                >
                  <p>
                    La cátedra de Algoritmos y Estructuras de Datos (AED) de la UTN-FRT le dio lugar
                    a la comunidad para dar algunos talleres de Git y GitHub, con los cuales se sumó
                    mucha gente a la comunidad, entre los cuales estaban Tobias Paz Posse, Jeremias
                    Ivanoff y Lucas Pérez. Tobi, Jere (alias Lunai) y Lucas le pusieron mucha
                    energía y buena onda a la comunidad, y han crecido mucho desde que entraron.
                  </p>
                </HistoriaSection>

                <HistoriaSection id="lightning-talks" title="Lightning Talks" period="2021 – 2024">
                  <p>
                    Organizamos varias jornadas de Lightning Talks, donde muchos miembros de la
                    comunidad comparten su conocimiento y experiencias. Al principio eran todas
                    virtuales por Discord, y cuando se terminó la cuarentena y se pudo volver a la
                    vida de antes, organizamos varias ediciones de Lightning Talks presenciales.
                  </p>
                  <p>
                    La primera edición fue en junio de 2021, de forma virtual por Discord, con
                    charlas rápidas sobre ingeniería de software. Con la vuelta a la presencialidad,
                    las Lightning Talks encontraron su lugar en el SUM 1 de la UTN-FRT: organizamos
                    una edición en mayo de 2023 y otra en octubre de 2024, convocando a cada vez más
                    miembros de la comunidad a subirse al escenario y compartir lo que estaban
                    aprendiendo.
                  </p>
                  <HistoriaGallery
                    aspect="flyer"
                    images={[
                      {
                        src: 'https://d374fgq95bfr8o.cloudfront.net/events/flyers/1777242335684-7df020ca-0179-422e-9084-4dbbb6ed20f1.jpeg',
                        alt: 'Lightning Talks 2021',
                      },
                      {
                        src: 'https://d374fgq95bfr8o.cloudfront.net/events/flyers/1777242053412-bee91069-37b8-4d27-91cb-2fafcfdf92c9.jpeg',
                        alt: 'Lightning Talks 2023',
                      },
                      {
                        src: 'https://d374fgq95bfr8o.cloudfront.net/events/flyers/1777235792921-7d89c0da-a617-4e80-8a2b-6cc7cea2d0b8.jpeg',
                        alt: 'Lightning Talks 2024',
                      },
                    ]}
                  />
                </HistoriaSection>

                <HistoriaSection
                  id="pcn-global-learning"
                  title="PCN & Global Learning"
                  period="2023"
                >
                  <p>
                    En 2023, colaboramos con Global Learning dando charlas sobre arquitectura de
                    software e ingeniería de software en la última clase de sus cursos.
                  </p>
                </HistoriaSection>

                <HistoriaSection
                  id="charlas-comunidad"
                  title="Compartiendo con la industria y las escuelas"
                  period="2023 – 2024"
                >
                  <p>
                    A medida que la comunidad fue creciendo, empezamos a salir de la universidad
                    para llevar nuestra experiencia a otros espacios. En noviembre de 2023
                    organizamos <b>Una Mirada de la Industria del Software</b> en el Mercado
                    Municipal de Tafí Viejo, donde ingenieros senior de la comunidad compartieron
                    metodologías, técnicas y una visión honesta de cómo funciona la industria del
                    software en la actualidad.
                  </p>
                  <p>
                    En octubre de 2024 fuimos invitados a dar dos charlas de orientación vocacional.
                    La primera, <b>Descubrí el Mundo del Desarrollo de Software</b>, se llevó a cabo
                    en Aticana, donde recorrimos los distintos roles y caminos posibles dentro de la
                    profesión. La segunda, <b>Introducción al Desarrollo de Software</b>, la dimos
                    en el Instituto Nuestra Señora de Montserrat para estudiantes de secundaria que
                    estaban dando sus primeros pasos en este mundo.
                  </p>
                  <HistoriaGallery
                    aspect="flyer"
                    images={[
                      {
                        src: 'https://d374fgq95bfr8o.cloudfront.net/events/flyers/1777241814466-2b43047c-27f0-4de7-86a2-faabca4f1ac9.jpeg',
                        alt: 'Una Mirada de la Industria del Software',
                      },
                      {
                        src: 'https://d374fgq95bfr8o.cloudfront.net/events/flyers/1777236239325-19d0cf0e-4385-4e14-ac61-a2c20fb06bb0.jpeg',
                        alt: 'Descubrí el Mundo del Desarrollo de Software',
                      },
                      {
                        src: 'https://d374fgq95bfr8o.cloudfront.net/events/flyers/1777241043347-93b51aef-47ba-4e88-9a9c-a4aaa997f6c2.jpeg',
                        alt: 'Introducción al Desarrollo de Software',
                      },
                    ]}
                  />
                </HistoriaSection>

                <HistoriaSection
                  id="desarrollo-website"
                  title="Empezamos a desarrollar el website"
                  period="2024"
                >
                  <p>
                    En 2024, Agus empezó el proyecto del website de PCN. Al principio iba a ser solo
                    un website institucional, pero después se transformó en una red social más
                    compleja, en la que los miembros de la comunidad pueden crear un usuario para
                    interactuar en el sitio.
                  </p>
                  <p>
                    El proyecto es open-source y cualquier persona de la comunidad puede participar
                    en el desarrollo y testing de la plataforma. Los miembros de la comunidad que
                    colaboraron en el desarrollo de la primera versión del website fueron Germán
                    Navarro, Mauricio Chaile, Matías Gutierrez, Nicolas Fuentes, Facundo Bazán,
                    Vicky Grillo, Emiliano Grillo, Carlos Spagnolo, Alejo Boga, Tobías Paz Posse,
                    Marcelo Núñez y Benjamin Cortes. El equipo fue liderado por Agustín Sánchez.
                  </p>
                </HistoriaSection>

                <HistoriaSection id="tech-in-action" title="Tech in Action" period="2025">
                  <p>
                    En junio de 2025, en el marco del Mes de la Ingeniería, la UTN-FRT nos abrió
                    nuevamente las puertas del SUM 1 para organizar <b>Tech in Action</b>: dos
                    presentaciones técnicas a cargo de miembros de la comunidad que mostraron
                    proyectos reales y herramientas que estaban usando en su trabajo cotidiano.
                  </p>
                  <p>
                    El evento reunió a estudiantes, egresados y profesionales de la industria, y fue
                    una muestra más de que PCN sigue siendo un puente entre la academia y el mundo
                    laboral.
                  </p>
                  <HistoriaImage
                    src="https://d374fgq95bfr8o.cloudfront.net/events/flyers/1777236349066-ae60a5c3-81d2-4cd8-bc18-85b648d4f089.jpeg"
                    alt="Tech in Action"
                    aspect="flyer"
                    className="mx-auto max-w-sm"
                  />
                </HistoriaSection>

                <HistoriaSection id="era-meetups" title="La era de los Meetups" period="2025">
                  <p>
                    A partir de 2025, la comunidad adoptó un nuevo formato que se convirtió en el
                    corazón de la actividad de PCN: los meetups mensuales. Con sedes que rotaron
                    entre Blackbox Cowork (Yerba Buena), Once57 Cowork y Xetro AI (San Miguel de
                    Tucumán), cada encuentro combinó charlas técnicas, networking y trabajo
                    colaborativo en un ambiente relajado.
                  </p>
                  <p>
                    También incorporamos las <b>Cowork Sessions</b>, jornadas de trabajo y estudio
                    en comunidad donde los miembros se juntan a avanzar en sus proyectos, preparar
                    entrevistas o simplemente programar acompañados. Estas sesiones se convirtieron
                    en un espacio muy valorado por quienes están en modo aprendizaje intensivo.
                  </p>
                  <p>
                    El cierre de 2025 fue en Blackbox Cowork con un meetup especial de fin de año:
                    coworking, charlas y mucho networking para despedir un año muy activo para la
                    comunidad.
                  </p>
                  <HistoriaGallery
                    aspect="flyer"
                    images={[
                      {
                        src: 'https://d374fgq95bfr8o.cloudfront.net/events/flyers/1766992051811-4f6bc2cb-ebe4-47e3-b701-dd537a0590fe.jpeg',
                        alt: 'Meetup diciembre 2025',
                      },
                      {
                        src: 'https://d374fgq95bfr8o.cloudfront.net/events/flyers/1771359135414-cc6b3a49-722f-400c-99f2-b049d32a23ec.JPG',
                        alt: 'Meetup febrero 2026',
                      },
                      {
                        src: 'https://d374fgq95bfr8o.cloudfront.net/events/flyers/1775498317125-414e180b-4b7c-43b0-9848-64e89c4506af.PNG',
                        alt: 'Meetup abril 2026',
                      },
                      {
                        src: 'https://d374fgq95bfr8o.cloudfront.net/events/flyers/1776732685244-11d00b6f-78b7-460b-a1a8-11d40f0a852f.png',
                        alt: 'Cowork Session',
                      },
                      {
                        src: 'https://d374fgq95bfr8o.cloudfront.net/events/flyers/1779314634681-9a349677-eb94-4345-b69b-6eef31325aa1.png',
                        alt: 'Meetup mayo 2026',
                      },
                    ]}
                  />
                </HistoriaSection>

                <HistoriaSection id="zero-to-agent" title="Zero to Agent" period="2026">
                  <p>
                    En abril de 2026 organizamos <b>Zero to Agent</b>, el primer hackathon de PCN
                    dedicado al desarrollo de agentes de IA. El evento se realizó en Once57 Cowork y
                    desafió a los participantes a construir agentes usando Vercel v0, con más de USD
                    6.000 en premios globales en juego. Fue una apuesta fuerte al futuro de la
                    ingeniería de software y demostró que la comunidad está al día con lo que viene.
                  </p>
                  <HistoriaImage
                    src="https://d374fgq95bfr8o.cloudfront.net/events/flyers/1777412831586-c7e9da58-e2a2-40d9-853a-e06cc1a5aace.png"
                    alt="Zero to Agent"
                    aspect="flyer"
                    className="mx-auto max-w-sm"
                  />
                </HistoriaSection>

                <HistoriaSection
                  id="nextgen-software-2026"
                  title="NextGen Software 2026"
                  period="2026"
                >
                  <p>
                    En junio de 2026, en el marco del 40° aniversario de la carrera de Ingeniería en
                    Sistemas de Información de la UTN-FRT, co-organizamos{' '}
                    <b>NextGen Software 2026</b>, unas jornadas para celebrar el Mes de la
                    Ingeniería y reflexionar sobre el pasado, el presente y el futuro de la
                    profesión.
                  </p>
                  <HistoriaImage
                    src="https://d374fgq95bfr8o.cloudfront.net/events/flyers/1780980085496-3a4b53b8-7df0-4259-a25a-d8d86873493b.png"
                    alt="NextGen Software 2026"
                    className="mx-auto max-w-sm"
                  />
                  <p>
                    El viernes 12 de junio, en el Aula Magna de la UTN-FRT, realizamos una sesión de{' '}
                    <b>Lightning Talks</b> con 10 charlas de la comunidad:
                  </p>
                  <ol className="divide-y overflow-hidden rounded-lg border bg-card">
                    {lightningTalksNextGen.map((talk, index) => (
                      <li key={talk.title} className="flex gap-4 px-4 py-3">
                        <span className="mt-0.5 w-6 shrink-0 text-right text-xs font-semibold tabular-nums text-pcnPurple dark:text-pcnGreen">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold leading-snug text-foreground">
                            {talk.title}
                          </p>
                          <p className="mt-0.5 text-sm leading-snug">
                            {talk.speaker} · {talk.role}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </HistoriaSection>

                <HistoriaSection
                  id="comunidad-whatsapp"
                  title="La comunidad en WhatsApp"
                  period="Hoy"
                >
                  <p>
                    Más allá de los eventos y las charlas presenciales, el corazón de PCN late en el{' '}
                    <b>grupo de WhatsApp de la comunidad</b>. Ahí es donde sucede la conversación
                    cotidiana: debates sobre herramientas como{' '}
                    <b>Cursor, Claude Code y agentes de IA</b>, discusiones de arquitectura,
                    recomendaciones de libros técnicos, preguntas sobre frameworks y bases de datos,
                    y el eterno dilema de cómo cobrar en dólares desde Argentina.
                  </p>
                  <p>
                    Pero lo más valioso no es el contenido técnico: es el <b>networking genuino</b>.
                    Ofertas de trabajo compartidas en el grupo que se convirtieron en empleos
                    reales, referidos entre miembros, revisiones de CV, consejos de entrevistas, y
                    la organización espontánea de un club de lectura técnica. Cuando Facundo García
                    Martoni consiguió su posición como Senior Full-Stack Engineer gracias a una
                    oferta publicada en el grupo y el acompañamiento de otros miembros, quedó claro{' '}
                    <b>el valor concreto de pertenecer a esta comunidad</b>.
                  </p>
                  <p>
                    Archivamos las mejores charlas en la sección de Conversaciones para que nadie se
                    pierda lo que se charló. Y si querés ser parte de lo que viene, el grupo está
                    abierto.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Link href="/conversaciones">
                      <Button variant="outline" size="sm">
                        Ver las conversaciones
                      </Button>
                    </Link>
                    <Link
                      href="https://chat.whatsapp.com/IFwKhHXoMwM6ysKcbfHiEh"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="pcn" size="sm" className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Unirme al grupo
                      </Button>
                    </Link>
                  </div>
                </HistoriaSection>
              </HistoriaTimeline>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);
export default PCNStory;
