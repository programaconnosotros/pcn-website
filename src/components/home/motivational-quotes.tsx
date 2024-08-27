'use client';

import Writer from 'typewriter-effect';
import shuffleArray from 'shuffle-array';

const quotes = [
  'La programación es el superpoder que te permite dar vida a tus ideas.',
  'Nunca subestimes el poder de un programador con una idea y el conocimiento para llevarla a cabo.',
  'El conocimiento es la llave que abre todas las puertas.',
  'Cada día es una oportunidad para aprender algo nuevo.',
  'La inversión en conocimiento siempre paga el mejor interés.',
  'La educación es el arma más poderosa que puedes usar para cambiar el mundo.',
];

export const MotivationalQuotes = () => (
  <div className="mt-3 text-sm">
    <code>
      <Writer
        options={{
          strings: shuffleArray(quotes),
          autoStart: true,
          loop: true,
          delay: 40,
        }}
      />
    </code>
  </div>
);
