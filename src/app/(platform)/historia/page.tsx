import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Heading2 } from '@/components/ui/heading-2';
import { Heading3 } from '@/components/ui/heading-3';
import Link from 'next/link';

const PCN = () => (
  <code className="font-bold text-green-700 dark:text-pcnGreen">programaConNosotros</code>
);

const PCNStory = () => (
  <div className="xl:mr-120 mb-12 mt-6 flex flex-col gap-4 md:mx-24 lg:mx-48 xl:mx-64">
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        <BreadcrumbItem>
          <BreadcrumbLink href="/posts/historia-pcn">Historia de PCN</BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <Heading2>Historia de programaConNosotros</Heading2>

    <p>
      Hola! Soy <b>Agustín Sánchez</b>, uno de los fundadores de nuestra comunidad, y en este
      artículo quiero contarte cómo llegamos a crear <PCN />, y casi todos los pasos que dimos para
      ser lo que somos hoy. Espero que te guste!
    </p>

    <Heading3>
      Todo empezó en la{' '}
      <Link
        href="https://www.frt.utn.edu.ar/"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline"
      >
        UTN-FRT
      </Link>
    </Heading3>

    <p>
      Empecé a estudiar <u>ingeniería en sistemas de información</u> en la UTN (Universidad
      Tecnológica Nacional), en la provincia de Tucumán, Argentina. Lo que más me gustaba de la
      carrera era programar y desarrollar software, asi que empecé a moverme extracurricularmente
      para aprender mucho más sobre eso.
    </p>

    <p>
      En la facultad conocí a <b>Germán Navarro</b>, <b>Chelo Núñez</b> e <b>Iván Taddei</b>,
      compañeros que fueron muy importantes para mi formación como profesional y como persona.
      Luego, tuve la fortuna de que mis hermanos menores, <b>Mauricio</b> y <b>Esteban</b>, también
      empezaron a estudiar la misma carrera. Los 6 formamos un grupo de amigos excelente.
    </p>

    <Heading3>
      Fuimos voluntarios en el{' '}
      <Link
        href="https://ieee.org/"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline"
      >
        IEEE
      </Link>
    </Heading3>

    <p>
      Con Germán pudimos entrar a formar parte como voluntarios en el IEEE (instituto más
      prestigioso de ingeniería del mundo). Ahí aprendimos muchas cosas, conocimos personas muy
      copadas y empezamos a organizar actividades para compartir conocimiento y facilitar el
      networking.
    </p>

    <p>
      Me encantaba organizar cosas y liderar el equipo de voluntarios, llegué a ser presidente
      primero del <b>Capítulo Estudiantil de IEEE Computer Society de la UNT</b> por 2 años
      consecutivos, y luego, presidente de la <b>Rama Estudiantil IEEE de la UTN-FRT</b>. Germán fue
      vicepresidente en ambos grupos.
    </p>

    <p>
      Las actividades más piolas que organizamos fueron:
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        <li>
          <b>Tucumán Hack Weekend</b>: fue un congreso de seguridad informática de 2 días. Tuvimos
          speakers de primer nivel, como <b>Victor Figueredo</b> (líder y fundador de{' '}
          <b>Tucumán Hacking</b>) y <b>Facundo Gelatti</b> (ingeniero de software en <b>10Pines</b>,
          docente en la universidad de Quilmes y referente de ingeniería de software a nivel
          nacional). También me animé a dar mi primera charla, hablé sobre programación competitiva.
        </li>

        <li>
          <b>Code Warfare</b>: fue una competencia de programación que organizamos en un laboratorio
          de computación de la UTN-FRT. Participaron más de 10 equipos, de diferentes universidades
          de Tucumán y estuvo muy divertido.
        </li>

        <li>
          <b>WESCIS</b>: fue un congreso de 3 días sobre diferentes ingenierías. Uno de esos días
          fue sobre computación, del cual tuve el orgullo de ser el presidente de la organización.
          Fue realizado en la <b>UNSTA</b> de Yerba Buena, y pudimos traer speakers excelentes, como{' '}
          <b>Hernán Wilkinson</b> (CEO de <b>10Pines</b> y referente a nivel mundial en ingeniería
          de software), <b>Alejandro Bianchi</b> (CEO de <b>Liveware</b> y referente de arquitectura
          de software en latinoamérica) y el crack ya mencionado, <b>Facundo Gelatti</b>.{' '}
        </li>

        <li>
          <b>Club de algoritmos</b>: fue un grupo de programación que cree para que muchas personas
          puedan aprender algoritmos y estructuras de datos. Los viernes, luego de las clases de la
          carrera, nos quedábamos en un laboratorio de la facultad y daba las clases sobre
          diferentes temas relacionados a algoritmos, estructuras de datos, patrones y demás.
        </li>
      </ul>
    </p>

    <Heading3>Necesitábamos más</Heading3>

    <p>
      El IEEE es un instituto que engloba demasiadas disciplinas de ingeniería, pero nosotros
      necesitamos algo más específico para la ingeniería de software, asi que creamos...
    </p>

    <Heading3>
      <PCN />
    </Heading3>

    <p>
      Una comunidad para personas apasionadas por la ingeniería de software, que quieren estar
      constantemente actualizados, mejorando, compartiendo conocimientos y contactos con los demás.
    </p>

    <p>
      <PCN /> es un lugar en el que podés encontrar a a un experto en ingeniería de software
      charlando con una persona que recién está empezando su camino dentro del software. Hay muchos
      mentores dispuestos a dar los mejores consejos, enseñar cosas difíciles de forma accesible y
      muchas cosas más, por el simple hecho de que estamos apasionados por el software y creemos que
      ayudarnos entre todos, podemos llegar más lejos.
    </p>

    <Heading3>Las Lightning Talks</Heading3>

    <p>
      En el año 2020, empezamos a organizar una actividad llamada Lightning Talks, que consiste en
      presentaciones rápidas (5-10 minutos) sobre un tema que te apasiona. Esto permite a los
      oyentes no aburrirse y a los speakers animarse a dar charlas. Con las Lightning Talks,
      empezamos a atraer mucha gente. Al principio las hacíamos online por Discord y YouTube, porque
      estábamos en pandemia y no se podía organizar actividades de forma presencial. Actualmente,
      organizamos varias ediciones presenciales de la actividad y cada vez se copa más gente.
    </p>

    <div className="my-6 grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="mb-4 md:mb-0">
        <img
          src="/lightning-talks/arquitectura-software.webp"
          alt="Arquitectura de software"
          className="w-full rounded-lg object-cover md:h-48"
        />

        <p className="mt-2 text-xs text-gray-500">
          Yo dando una charla de arquitectura de software.
        </p>
      </div>

      <div className="mb-4 md:mb-0">
        <img
          src="/lightning-talks/arquitectura-modular.webp"
          alt="Arquitectura modular"
          className="w-full rounded-lg object-cover md:h-48"
        />

        <p className="mt-2 text-xs text-gray-500">
          Mauricio dando una charla de arquitectura modular.
        </p>
      </div>

      <div className="mb-4 md:mb-0">
        <img
          src="/lightning-talks/paradigmas.webp"
          alt="Paradigmas de programación"
          className="w-full rounded-lg object-cover md:h-48"
        />

        <p className="mt-2 text-xs text-gray-500">
          Chelo dando una charla de paradigmas de programación.
        </p>
      </div>
    </div>

    <Link href="/charlas">
      <Button className="w-full" variant="outline">
        Ver el historial de charlas dadas en PCN
      </Button>
    </Link>

    <Heading3>Empezamos a juntarnos más seguido para networking</Heading3>

    <img src="/juntada.webp" alt="Networking" className="w-full rounded-lg object-cover" />

    <Heading3>Empecé a desarrollar este website</Heading3>

    <p>
      En el año 2024, cree este sitio web para que podamos compartir conocimiento y encontrar
      información copada acerca de ingeniería de software. Este proyecto es open source y cualquier
      persona puede contribuir si lo desea, ya sea para mejorar cosas, fixear bugs o agregar
      features. Uno de los objetivos de este proyecto es facilitar que las personas puedan ganar
      experiencia en diferentes disciplinas.
    </p>
  </div>
);
export default PCNStory;
