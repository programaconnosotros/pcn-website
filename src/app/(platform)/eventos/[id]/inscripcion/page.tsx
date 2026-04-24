import { redirect } from 'next/navigation';

type Props = {
  params: { id: string };
  searchParams: Promise<{ autoRegister?: string }>;
};

/**
 * Esta página ahora solo redirige a la página de detalle del evento.
 * La inscripción se maneja directamente desde la página de detalle.
 */
const EventRegistrationPage = async ({ params, searchParams }: Props) => {
  const id = params.id;
  const params_await = await searchParams;
  const autoRegister = params_await.autoRegister === 'true';

  // Redirigir a la página de detalle del evento con el parámetro autoRegister si corresponde
  if (autoRegister) {
    redirect(`/eventos/${id}?autoRegister=true`);
  } else {
    redirect(`/eventos/${id}`);
  }
};

export default EventRegistrationPage;
