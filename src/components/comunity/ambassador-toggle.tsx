'use client';

import { useState, useTransition } from 'react';
import { Award } from 'lucide-react';
import { toast } from 'sonner';
import { setAmbassador } from '@/actions/users/set-ambassador';
import { MarkToggle } from '@/components/ui/mark-toggle';

// Admin-only toggle in the users table that adds or removes someone from PCN Ambassadors.
export function AmbassadorToggle({
  userId,
  userName,
  isAmbassador,
}: {
  userId: string;
  userName: string;
  isAmbassador: boolean;
}) {
  const [active, setActive] = useState(isAmbassador);
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    if (isPending) return;
    const next = !active;
    setActive(next);
    startTransition(async () => {
      try {
        await setAmbassador(userId, next);
        toast.success(next ? `${userName} ahora es ambassador` : `${userName} ya no es ambassador`);
      } catch (error) {
        setActive(!next);
        toast.error(error instanceof Error ? error.message : 'No se pudo actualizar');
      }
    });
  };

  return (
    <MarkToggle
      active={active}
      onToggle={toggle}
      icon={Award}
      label={active ? 'ambassador' : 'no'}
      title={active ? `Quitar a ${userName} de PCN Ambassadors` : `Hacer ambassador a ${userName}`}
      className={isPending ? 'opacity-60' : undefined}
    />
  );
}
