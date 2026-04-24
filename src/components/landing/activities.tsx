export const Activities = () => (
  <section className="w-full dark:bg-black">
    <div className="container px-4 md:px-6">
      <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter sm:text-5xl md:mb-24">
        Nuestras actividades preferidas
      </h2>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 lg:px-24">
        <div className="flex flex-col space-y-4">
          <img
            alt="Desarrollo open-source"
            className="aspect-video overflow-hidden rounded object-cover object-center"
            height="310"
            src="/motivation/eagerworks-1.webp"
            width="550"
          />

          <h3 className="text-2xl font-bold">Desarrollo open-source</h3>

          <p className="text-gray-500 dark:text-gray-400">
            Estamos desarrollando la plataforma que estás viendo en este momento! Podés sumarte al
            team y agregar nuevas funcionalidades o mejorar las existentes.
          </p>
        </div>

        <div className="flex flex-col space-y-4">
          <img
            alt="Lightning Talks"
            className="aspect-video overflow-hidden rounded object-cover object-center"
            height="310"
            src="/lightning-talks/arquitectura-software.webp"
            width="550"
          />

          <h3 className="text-2xl font-bold">Lightning Talks</h3>

          <p className="text-gray-500 dark:text-gray-400">
            Organizamos jornadas de charlas técnicas de corta duración para intercambiar
            conocimientos interesantes de una forma entretenida, y aprovechar para conocer mucha
            gente interesante.
          </p>
        </div>

        <div className="flex flex-col space-y-4">
          <img
            alt="Competencias de programación"
            className="aspect-video overflow-hidden rounded object-cover object-center"
            height="310"
            src="/pre-lightning-talks.webp"
            width="550"
          />

          <h3 className="text-2xl font-bold">Code Warfare</h3>

          <p className="text-gray-500 dark:text-gray-400">
            Es una competencia de programación para que podamos divertirnos y poner a prueba
            nuestras skills.
          </p>
        </div>

        <div className="flex flex-col space-y-4">
          <img
            alt="Reuniones"
            className="aspect-video overflow-hidden rounded object-cover object-center"
            height="310"
            src="/juntada.webp"
            width="550"
          />

          <h3 className="text-2xl font-bold">Networking</h3>

          <p className="text-gray-500 dark:text-gray-400">
            Podés unirte a nuestras juntadas para hacer networking, intercambiar conocimientos,
            experiencias y mantenerte actualizado con lo último en tecnología.
          </p>
        </div>
      </div>
    </div>
  </section>
);
