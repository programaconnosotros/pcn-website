import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { trackPageVisit } from '@/actions/analytics/track-page-visit';

const MeetupPage = async () => {
  // Trackear la visita a /meetup antes del redirect
  await trackPageVisit('/meetup');

  const now = new Date();

  // Buscar el próximo evento que sea un dev meetup
  // Buscamos eventos que:
  // 1. No estén eliminados
  // 2. Tengan fecha futura (o endDate futura)
  // 3. Su nombre contenga "meetup" o "dev meetup" (case insensitive)
  const nextMeetup = await prisma.event.findFirst({
    where: {
      deletedAt: null,
      OR: [
        {
          date: {
            gte: now,
          },
        },
        {
          endDate: {
            gte: now,
          },
        },
      ],
      name: {
        contains: 'meetup',
        mode: 'insensitive',
      },
    },
    orderBy: {
      date: 'asc',
    },
  });

  if (!nextMeetup) {
    // Si no hay meetup próximo, redirigir a la página de eventos
    redirect('/eventos');
  }

  // Redirigir a la página de inscripción del meetup
  redirect(`/eventos/${nextMeetup.id}/inscripcion`);
};

export default MeetupPage;

