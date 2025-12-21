import { TextGenerateEffect } from '../ui/text-generate-effect';

const BoweryLogo = () => (
  <div className="flex w-full flex-col items-center bg-black py-10 !border-0" style={{ border: 'none' }}>
    <div className="mb-4 mt-4 flex flex-row items-center">
      <img src="/bowery-logo.webp" alt="Bowery" className="h-12" />

      <h1 className="ml-4 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-4xl font-bold text-transparent">
        Bowery
      </h1>
    </div>

    <TextGenerateEffect
      className="max-w-xl px-6 text-center md:px-0 md:text-2xl"
      words={'Elite squads for disruptive innovation.'}
    />
  </div>
);

export default BoweryLogo;

