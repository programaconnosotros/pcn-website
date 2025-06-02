import { TextGenerateEffect } from '../ui/text-generate-effect';

const ASZSoftwareLogo = () => (
  //   <div className="relative z-10 flex w-full flex-col items-center">
  <div className="flex w-full flex-col items-center bg-black py-10">
    <div className="mb-4 mt-4 flex flex-row items-center">
      <img src="/asz-software-logo-2.webp" alt="ASZ Studio" className="-ml-8 h-12" />

      <h1 className="bg-gradient-to-b from-white to-gray-500 bg-clip-text text-4xl font-bold text-transparent">
        ASZ Software
      </h1>
    </div>

    <TextGenerateEffect
      className="max-w-xl px-6 text-center md:px-0 md:text-2xl"
      words={'Top-quality software engineering studio.'}
    />
  </div>
);

export default ASZSoftwareLogo;
