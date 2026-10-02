'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { awardBadge, createBadge, listBadges } from '@/actions/badges/badge-actions';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  BADGE_ICONS,
  BADGE_TONES,
  isBadgeIcon,
  isBadgeTone,
  type BadgeIcon,
  type BadgeTone,
} from '@/lib/badges';
import { cn } from '@/lib/utils';
import { BadgeMedal } from './badge-medal';

type CatalogBadge = Awaited<ReturnType<typeof listBadges>>[number];

const Label = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
    {children}
  </p>
);

/** Admin dialog to award an existing custom badge, or design a new one and award it. */
export function AwardBadgeDialog({
  open,
  onOpenChange,
  userId,
  userName,
  ownedBadgeIds,
}: {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  userId: string;
  userName: string;
  ownedBadgeIds: string[];
}) {
  const router = useRouter();
  const [catalog, setCatalog] = useState<CatalogBadge[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState<BadgeIcon>('trophy');
  const [tone, setTone] = useState<BadgeTone>('purple');

  useEffect(() => {
    if (!open) return;
    listBadges()
      .then(setCatalog)
      .catch(() => setCatalog([]));
  }, [open]);

  const done = (message: string) => {
    toast.success(message);
    onOpenChange(false);
    setName('');
    setDescription('');
    router.refresh();
  };

  const award = (badge: CatalogBadge) =>
    startTransition(async () => {
      try {
        await awardBadge(userId, badge.id);
        done(`${userName} ganó "${badge.name}"`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'No se pudo otorgar');
      }
    });

  const create = () =>
    startTransition(async () => {
      try {
        await createBadge({ name, description, icon, tone }, userId);
        done(`${userName} ganó "${name}"`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'No se pudo crear el badge');
      }
    });

  const owned = new Set(ownedBadgeIds);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-mono">otorgarBadge({userName.split(' ')[0]})</DialogTitle>
        </DialogHeader>

        <section>
          <Label>badges existentes</Label>
          {catalog === null ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : catalog.length === 0 ? (
            <p className="text-xs text-muted-foreground">Todavía no hay badges. Creá el primero.</p>
          ) : (
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {catalog.map((badge) => {
                const has = owned.has(badge.id);
                const iconName = isBadgeIcon(badge.icon) ? badge.icon : 'award';
                const toneName = isBadgeTone(badge.tone) ? badge.tone : 'green';
                return (
                  <li key={badge.id}>
                    <button
                      type="button"
                      disabled={has || isPending}
                      onClick={() => award(badge)}
                      title={badge.description}
                      className="group/badge flex w-full flex-col items-center gap-1.5 border border-pcnGreen-200 p-2 text-center transition-colors hover:border-pcnGreen-500 hover:bg-pcnGreen/[0.04] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <BadgeMedal icon={iconName} tone={toneName} size="sm" />
                      <span className="line-clamp-2 font-mono text-[10px] leading-tight">
                        {badge.name}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-[9px] text-muted-foreground">
                        {has && <Check className="size-2.5" />}
                        {has ? 'ya lo tiene' : `${badge._count.awards} lo tienen`}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="border-t border-dashed border-pcnGreen-200 pt-4">
          <Label>crear un badge nuevo</Label>
          <div className="flex gap-4">
            <div className="group/badge flex w-24 shrink-0 flex-col items-center gap-2 pt-1 text-center">
              <BadgeMedal icon={icon} tone={tone} />
              <span
                className="font-mono text-[10px] font-semibold uppercase leading-tight tracking-wider"
                style={{ color: BADGE_TONES[tone].light }}
              >
                {name || 'nombre'}
              </span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Input
                placeholder="Nombre (ej: Bug Hunter)"
                value={name}
                maxLength={40}
                onChange={(e) => setName(e.target.value)}
              />
              <Textarea
                placeholder="Por qué se lo ganan (se ve al pasar el mouse)"
                value={description}
                maxLength={200}
                className="min-h-[64px]"
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-3">
            <Label>ícono</Label>
            <div className="flex flex-wrap gap-1">
              {(Object.keys(BADGE_ICONS) as BadgeIcon[]).map((key) => {
                const Icon = BADGE_ICONS[key];
                return (
                  <button
                    key={key}
                    type="button"
                    aria-label={key}
                    aria-pressed={icon === key}
                    onClick={() => setIcon(key)}
                    className={cn(
                      'flex size-8 items-center justify-center border transition-colors',
                      icon === key
                        ? 'border-pcnGreen bg-pcnGreen/15 text-pcnGreen'
                        : 'border-pcnGreen-200 text-muted-foreground hover:border-pcnGreen-500 hover:text-pcnGreen',
                    )}
                  >
                    <Icon className="size-4" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3">
            <Label>acabado</Label>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(BADGE_TONES) as BadgeTone[]).map((key) => {
                const t = BADGE_TONES[key];
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={tone === key}
                    onClick={() => setTone(key)}
                    className={cn(
                      'flex items-center gap-1.5 border px-2 py-1 font-mono text-[10px] transition-colors',
                      tone === key ? 'border-current' : 'border-pcnGreen-200 opacity-70',
                    )}
                    style={{ color: t.light }}
                  >
                    <span
                      className="size-3 rounded-full"
                      style={{
                        background: `linear-gradient(135deg, ${t.light}, ${t.base}, ${t.dark})`,
                      }}
                    />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            type="button"
            variant="pcn"
            className="mt-4 w-full"
            disabled={isPending || name.trim().length < 2 || description.trim().length < 5}
            onClick={create}
          >
            crearYOtorgar();
          </Button>
        </section>
      </DialogContent>
    </Dialog>
  );
}
