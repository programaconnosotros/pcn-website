'use client';
import { cn } from '@/lib/utils';
import { Marquee } from '@/components/magicui/marquee';

const reviews = [
  {
    name: 'Emiliano Grillo',
    body: 'PCN es una comunidad llena de potencial, con gente que le gusta aprender, compartir y enseñar lo aprendido, donde te podes sentir libre de preguntar sin sentir presiones o miedos. Es un entorno nutritivo repleto de gente nutritiva que aporta conocimientos, aprendizajes, experiencias, oportunidades y consejos que van de avanzados a novatos y de novatos a avanzados, lo que demuestra que siempre se aprende algo nuevo y que todos tenemos algo para enseñar.',
    img: 'https://avatar.vercel.sh/jack',
  },
  {
    name: 'Mateo Herrera',
    body: 'PCN es un espacio donde las personas comparten generosamente sus conocimientos, se apoyan mutuamente y crecen juntas en el mundo de la programación. Gracias a PCN no solo aprendí cosas nuevas de código, sino que también conocí gente increíble, con la que puedo hablar de proyectos, dudas, ideas y hasta compartir juntadas en persona. Es una comunidad que te hace sentir acompañado en este camino que a veces puede ser solitario, y eso lo valoro muchísimo.',
    img: 'https://avatar.vercel.sh/jill',
  },
  {
    name: 'Mauricio Chaile',
    body: 'PCN es una gran comunidad de la cual aprender muchas cosas pero sobre todo para inspirarme y compartir sobre esto que nos gusta que es el software',
    img: 'https://avatar.vercel.sh/john',
  },
  {
    name: 'Vicky Grillo',
    body: 'PCN es mucho más que una comunidad de desarrollo. Es un espacio donde se comparte conocimiento, se hacen amigos, se organizan charlas y eventos, y sobre todo, donde se da la oportunidad de tener esa primera experiencia laboral que muchas veces es tan difícil de conseguir. Aprendí un montón, conocí gente brillante y me sentí parte de algo que realmente impulsa a los que estamos empezando.',
    img: 'https://avatar.vercel.sh/jane',
  },
  {
    name: 'Matías Gutiérrez',
    body: 'PCN es una comunidad hermosa llena de gente muy inteligente y humilde, dispuestos a aprender y enseñar sin importar seniority ni nada de esas cosas. La verdad que estoy orgulloso de poder formar parte de ella',
    img: 'https://avatar.vercel.sh/jenny',
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({ img, name, body }: { img: string; name: string; body: string }) => {
  return (
    <figure
      className={cn(
        'relative h-full w-96 overflow-hidden rounded-xl border p-4',
        // light styles
        'border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]',
        // dark styles
        'dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]',
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="32" height="32" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">{name}</figcaption>
        </div>
      </div>
      <blockquote className="mt-2 text-sm">{body}</blockquote>
    </figure>
  );
};

export function Testimonials() {
  return (
    <div className="relative my-8 flex w-full flex-col items-center justify-center overflow-hidden">
      <Marquee pauseOnHover className="[--duration:20s]">
        {firstRow.map((review) => (
          <ReviewCard key={review.name} {...review} />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover className="[--duration:20s]">
        {secondRow.map((review) => (
          <ReviewCard key={review.name} {...review} />
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
    </div>
  );
}
