'use client';

import { useState, useTransition } from 'react';
import { Award, ShieldCheck, type LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { setAmbassador } from '@/actions/users/set-ambassador';
import { setUserRole } from '@/actions/users/set-user-role';
import { MarkToggle } from '@/components/ui/mark-toggle';

type FlagConfig = {
  icon: LucideIcon;
  label: string;
  save: (_userId: string, _active: boolean) => Promise<unknown>;
  on: (_name: string) => string;
  off: (_name: string) => string;
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
        await config.save(userId, next);
        toast.success(next ? config.on(userName) : config.off(userName));
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
      icon={config.icon}
      label={active ? config.label : 'no'}
      title={`${active ? 'Quitar' : 'Dar'} ${config.label} a ${userName}`}
      className={isPending ? 'opacity-60' : undefined}
    />
  );
}
