import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

type Props = {
  params: { id: string };
  searchParams: Promise<{ autoRegister?: string }>;
};

const EventRegistrationPage = async ({ params, searchParams }: Props) => {
  const id = params.id;

  const event = await prisma.event.findUnique({
    where: { id },
    select: { externalRegistrationUrl: true },
  });

  if (event?.externalRegistrationUrl) {
    redirect(event.externalRegistrationUrl);
  }

  const params_await = await searchParams;
  const autoRegister = params_await.autoRegister === 'true';

  if (autoRegister) {
    redirect(`/eventos/${id}?autoRegister=true`);
  } else {
    redirect(`/eventos/${id}`);
  }
};

export default EventRegistrationPage;
