'use client';

import { useState, useTransition } from 'react';
import { Award, Ban, Crown, ShieldCheck, type LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { setAmbassador } from '@/actions/users/set-ambassador';
import { setCofounder } from '@/actions/users/set-cofounder';
import { setSuspended } from '@/actions/users/set-suspended';
import { setUserRole } from '@/actions/users/set-user-role';
import { MarkToggle } from '@/components/ui/mark-toggle';
import { actionErrorMessage } from '@/lib/rate-limit-messages';

type FlagConfig = {
  icon: LucideIcon;
  label: string;
  save: (_userId: string, _active: boolean) => Promise<unknown>;
  on: (_name: string) => string;
  off: (_name: string) => string;
  /** The hover text, when "Dar/Quitar <label> a <name>" doesn't read right. */
  title?: (_active: boolean, _name: string) => string;
};

// Admin-only flags that can be switched from the users table.
const FLAGS = {
  admin: {
    icon: ShieldCheck,
    label: 'admin',
    save: (userId, active) => setUserRole(userId, active ? 'ADMIN' : 'REGULAR'),
    on: (name) => `${name} ahora es admin`,
    off: (name) => `${name} ya no es admin`,
  },
  ambassador: {
    icon: Award,
    label: 'ambassador',
    save: setAmbassador,
    on: (name) => `${name} ahora es ambassador`,
    off: (name) => `${name} ya no es ambassador`,
  },
  cofounder: {
    icon: Crown,
    label: 'co-founder',
    save: setCofounder,
    on: (name) => `${name} ahora figura como co-founder`,
    off: (name) => `${name} ya no figura como co-founder`,
  },
  suspended: {
    icon: Ban,
    label: 'suspendida',
    save: setSuspended,
    on: (name) => `Suspendiste la cuenta de ${name}`,
    off: (name) => `Reactivaste la cuenta de ${name}`,
    title: (active, name) => `${active ? 'Reactivar' : 'Suspender'} la cuenta de ${name}`,
  },
} satisfies Record<string, FlagConfig>;

export type UserFlag = keyof typeof FLAGS;

export function UserFlagToggle({
  flag,
  userId,
  userName,
  active: initial,
}: {
  flag: UserFlag;
  userId: string;
  userName: string;
  active: boolean;
}) {
  const config: FlagConfig = FLAGS[flag];
  const [active, setActive] = useState(initial);
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    if (isPending) return;
    const next = !active;
    setActive(next);
    startTransition(async () => {
      try {
        const result = await config.save(userId, next);
        // Errores esperados que la action devuelve (por ejemplo, quitarse el admin a uno mismo)
        if (result && typeof result === 'object' && 'error' in result) {
          setActive(!next);
          toast.error(String(result.error));
          return;
        }
        toast.success(next ? config.on(userName) : config.off(userName));
      } catch (error) {
        setActive(!next);
        toast.error(actionErrorMessage(error, 'No se pudo actualizar', true));
      }
    });
  };

  return (
    <MarkToggle
      active={active}
      onToggle={toggle}
      icon={config.icon}
      label={active ? config.label : 'no'}
      title={
        config.title?.(active, userName) ??
        `${active ? 'Quitar' : 'Dar'} ${config.label} a ${userName}`
      }
      className={isPending ? 'opacity-60' : undefined}
    />
  );
}
