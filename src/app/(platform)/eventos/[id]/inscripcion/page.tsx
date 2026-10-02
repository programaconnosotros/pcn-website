import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ autoRegister?: string }>;
};

const EventRegistrationPage = async (props: Props) => {
  const params = await props.params;
  const id = params.id;

  const event = await prisma.event.findUnique({
    where: { id },
    select: { externalRegistrationUrl: true },
  });

  if (event?.externalRegistrationUrl) {
    redirect(event.externalRegistrationUrl);
  }

  const searchParams = await props.searchParams;
  const autoRegister = searchParams.autoRegister === 'true';

  if (autoRegister) {
    redirect(`/eventos/${id}?autoRegister=true`);
  } else {
    redirect(`/eventos/${id}`);
  }
};

export default EventRegistrationPage;
