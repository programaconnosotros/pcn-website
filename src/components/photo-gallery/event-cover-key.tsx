'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { setEventCoverPhoto } from '@/actions/events/set-event-cover-photo';
import { actionErrorMessage } from '@/lib/rate-limit-messages';
import { cn } from '@/lib/utils';
import { keyCapClassName } from './photo-utils';

// For admins, on a photo's page: make it (or stop it being) the cover of its event's page.
export function EventCoverKey({
  eventId,
  photoId,
  isCover,
}: {
  eventId: string;
  photoId: string;
  isCover: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const label = isCover ? 'Quitar como portada del evento' : 'Usar como portada del evento';

  const toggle = () =>
    startTransition(async () => {
      try {
        await setEventCoverPhoto(eventId, isCover ? null : photoId);
        toast.success(isCover ? 'La portada vuelve a ser aleatoria' : 'Es la portada del evento');
        router.refresh();
      } catch (error) {
        toast.error(actionErrorMessage(error, 'No se pudo cambiar la portada'));
      }
    });

  return (
    <button
      type="button"
      className={cn(keyCapClassName, isCover && 'text-pcnGreen')}
      onClick={toggle}
      disabled={isPending}
      title={label}
      aria-pressed={isCover}
    >
      <Star className={cn('size-3.5', isCover && 'fill-current')} />
      <span className="sr-only">{label}</span>
    </button>
  );
}
