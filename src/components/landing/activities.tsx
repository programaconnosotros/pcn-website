export const Activities = () => (
  <section className="w-full py-12 md:py-24 lg:py-32">
    <div className="container px-4 md:px-6">
      <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter sm:text-5xl">
        Actividades destacadas
      </h2>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
        <div className="flex flex-col space-y-4">
          <img
            alt="Desarrollo open-source"
            className="aspect-video overflow-hidden rounded-xl object-cover object-center"
            height="310"
            src="/motivation/eagerworks-1.jpeg"
            width="550"
          />

          <h3 className="text-center text-2xl font-bold">Desarrollo open-source</h3>

          <p className="text-center text-gray-500 dark:text-gray-400">
            Participá en el desarrollo de la plataforma que estás viendo en este momento, sirve para
            intercambiar conocimiento, ganar experiencia y, sobre todo, para divertirnos!
          </p>
        </div>

        <div className="flex flex-col space-y-4">
          <img
            alt="Lightning Talks"
            className="aspect-video overflow-hidden rounded-xl object-cover object-center"
            height="310"
            src="/lightning-talks/arquitectura-software.jpeg"
            width="550"
          />

          <h3 className="text-center text-2xl font-bold">Lightning Talks</h3>

          <p className="text-center text-gray-500 dark:text-gray-400">
            Jornada de charlas técnicas de corta duración para intercambiar conocimientos
            interesantes de una forma entretenida, y aprovechar para conocer mucha gente copada.
          </p>
        </div>

        <div className="flex flex-col space-y-4">
          <img
            alt="Competencias de programación"
            className="aspect-video overflow-hidden rounded-xl object-cover object-center"
            height="310"
            src="/pre-lightning-talks.jpeg"
            width="550"
          />

          <h3 className="text-center text-2xl font-bold">Code Warfare</h3>

          <p className="text-center text-gray-500 dark:text-gray-400">
            Competencia de programación para que podamos divertirnos y poner a prueba nuestras
            skills.
          </p>
        </div>

        <div className="flex flex-col space-y-4">
          <img
            alt="Reuniones"
            className="aspect-video overflow-hidden rounded-xl object-cover object-center"
            height="310"
            src="/juntada.jpeg"
            width="550"
          />

          <h3 className="text-center text-2xl font-bold">Reuniones presenciales y virtuales</h3>

          <p className="text-center text-gray-500 dark:text-gray-400">
            Podés unirte a nuestros encuentros regulares para hacer networking, intercambiar
            conocimiento y mantenerte actualizado con lo último en tecnología.
          </p>
        </div>
      </div>
    </div>
  </section>
);
