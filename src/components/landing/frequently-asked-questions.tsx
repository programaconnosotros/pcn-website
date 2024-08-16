const frequentlyAskedQuestions = [
  {
    question: '¿Tengo que pagar algo para ser parte de la comunidad?',
    answer: 'No, es gratis. Sumate cuando puedas y empeza a interactuar con nosotros!',
  },
  {
    question: '¿Puedo dar una lightning talk?',
    answer:
      '¡Por supuesto! Cuando estemos organizando una jornada de Lightning Talks, avisaremos y podrás postular tu charla.',
  },
  {
    question: 'Quiero codear en este proyecto, ¿cómo me sumo?',
    answer:
      'Unite a nuestro Discord, hay un canal de texto llamado #pcn-website en el cual podés avisar que queres ayudar con el desarrollo del sitio y se te darán las instrucciones.',
  },
  {
    question: '¿Necesito ser un programador profesional para unirme a la comunidad?',
    answer:
      'No, no es necesario. Si estás interesado en el desarrollo de software, querés aprender o simplemente charlar con otros estudiantes o profesionales, ¡sumate!',
  },
  {
    question: 'Soy una empresa y me interesa aliarme con la comunidad, ¿cómo puedo hacerlo?',
    answer: 'Completá este formulario de contacto y nos pondremos en contacto con vos.',
  },
];

export const FrequentlyAskedQuestions = () => (
  <div className="mt-16 bg-white">
    <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900">
            Preguntas frecuentes
          </h2>

          <p className="mt-4 text-base leading-7 text-gray-600">
            ¿No encontraste lo que buscabas? ¡Contactanos en{' '}
            <a
              href="https://discord.gg/JUGCAmuBnf"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Discord
            </a>
            !
          </p>
        </div>

        <div className="mt-10 lg:col-span-7 lg:mt-0">
          <dl className="space-y-10">
            {frequentlyAskedQuestions.map((faq) => (
              <div key={faq.question}>
                <dt className="text-base font-semibold leading-7 text-gray-900">{faq.question}</dt>

                <dd className="mt-2 text-base leading-7 text-gray-600">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  </div>
);
