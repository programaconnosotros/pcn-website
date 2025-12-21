import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

const Home = async () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Background GIF */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/home.GIF"
          alt="Background"
          fill
          className="object-cover"
          priority
          unoptimized
        />
      </div>

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 z-0 bg-black/70" />

      {/* Hero content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center">
        {/* Logo centered */}
        <div className="mb-12 flex justify-center">
          <Image
            src="/logo.webp"
            alt="programaConNosotros"
            width={96}
            height={96}
            className="w-16 md:w-24"
            priority
          />
        </div>

        <h4 className="mb-6 max-w-4xl scroll-m-20 text-2xl font-semibold tracking-tight text-white md:text-3xl lg:text-4xl">
          La comunidad que necesitas para llevar tu carrera en el mundo del software al siguiente
          nivel.
        </h4>

        <p className="mb-8 max-w-2xl text-base leading-relaxed text-gray-300 md:text-lg">
          Conocé desarrolladores apasionados, aprende y compartí conocimientos, encontrá
          oportunidades y cambia tu vida.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Link href="/autenticacion/registro">
            <Button className="bg-pcnGreen text-black hover:bg-pcnGreen/90">Registrarme</Button>
          </Link>
          <Link href="/autenticacion/iniciar-sesion">
            <Button
              variant="outline"
              className="border-pcnGreen text-pcnGreen hover:bg-pcnGreen hover:text-black"
            >
              Iniciar sesión
            </Button>
          </Link>
        </div>
      </div>

      {/* TODO: Agregar secci?n de beneficios
        TODO: Agregar secci?n de features
        TODO: Agregar secci?n de testimonios
        TODO: Agregar secci?n de contacto
        TODO: Agregar secci?n de FAQ */}
    </div>
  );
};

export default Home;
