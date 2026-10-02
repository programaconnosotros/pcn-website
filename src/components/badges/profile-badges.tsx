'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { revokeBadge } from '@/actions/badges/badge-actions';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { BADGE_TONES, type DisplayBadge } from '@/lib/badges';
import { BadgeMedal } from './badge-medal';
import { AwardBadgeDialog } from './award-badge-dialog';

const monthFormat = new Intl.DateTimeFormat('es-AR', { month: 'short', year: 'numeric' });

type ProfileBadge = DisplayBadge & { custom?: boolean };

/** The "## badges" block of a profile. Admins can award new badges and take custom ones back. */
export function ProfileBadges({
  userId,
  userName,
  badges,
  isAdmin,
}: {
  userId: string;
  userName: string;
  badges: ProfileBadge[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (badges.length === 0 && !isAdmin) return null;

  const revoke = (badge: ProfileBadge) =>
    startTransition(async () => {
      try {
        await revokeBadge(userId, badge.id);
        toast.success(`Badge "${badge.name}" quitado`);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'No se pudo quitar el badge');
      }
    });

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-mono text-xs font-semibold text-muted-foreground">
          <span className="text-pcnGreen-500">## </span>badges
          <span className="ml-1 text-muted-foreground/60">[{badges.length}]</span>
        </h2>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-1 font-mono text-[11px] text-pcnGreen-700 hover:text-pcnGreen"
          >
            <Plus className="size-3" />
            otorgar
          </button>
        )}
      </div>

      {badges.length > 0 ? (
        <ul className="grid grid-cols-3 gap-x-2 gap-y-4">
          {badges.map((badge) => (
            <li key={badge.id} className="relative">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="group/badge flex cursor-default flex-col items-center gap-2 text-center outline-none">
                    <BadgeMedal icon={badge.icon} tone={badge.tone} />
                    <span
                      className="font-mono text-[10px] font-semibold uppercase leading-tight tracking-wider"
                      style={{ color: BADGE_TONES[badge.tone].light }}
                    >
                      {badge.name}
                    </span>
                    {badge.awardedAt && (
                      <span className="-mt-1.5 font-mono text-[9px] text-muted-foreground/70">
                        {monthFormat.format(new Date(badge.awardedAt))}
                      </span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-[220px] text-pretty leading-relaxed">
                  <p className="font-semibold">{badge.name}</p>
                  <p className="text-muted-foreground">{badge.description}</p>
                </TooltipContent>
              </Tooltip>
              {isAdmin && badge.custom && (
                <button
                  type="button"
                  disabled={isPending}
                  aria-label={`Quitar el badge ${badge.name}`}
                  onClick={() => revoke(badge)}
                  className="absolute right-1 top-0 rounded-sm p-0.5 text-muted-foreground opacity-60 hover:bg-muted hover:text-red-400 hover:opacity-100"
                >
                  <X className="size-3" />
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">Todavía no tiene badges.</p>
      )}

      {isAdmin && (
        <AwardBadgeDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          userId={userId}
          userName={userName}
          ownedBadgeIds={badges.filter((badge) => badge.custom).map((badge) => badge.id)}
        />
      )}
    </div>
  );
}
