'use client';

import { useState } from 'react';
import { Bell, CheckCheck, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { markAllNotificationsAsRead } from '@/actions/notifications/mark-all-as-read';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { actionErrorMessage } from '@/lib/rate-limit-messages';
import { cn } from '@/lib/utils';
import type { NotificationFeedItem } from '@/lib/notification-center';
import { useNotificationCenter } from './use-notification-center';

type Tab = 'novedades' | 'admin';

/** Short tags that fit the column; the feed's kinds otherwise. */
const KIND_LABELS: Record<string, string> = { conversacion: 'chat', changelog: 'cambio' };

const relativeTime = (iso: string, now = Date.now()) => {
  const minutes = Math.floor((now - new Date(iso).getTime()) / 60_000);
  if (Number.isNaN(minutes)) return '';
  if (minutes < 1) return 'ahora';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
};

const Badge = ({ count }: { count: number }) =>
  count > 0 ? (
    <span
      aria-hidden
      className="absolute -right-1 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-sm bg-pcnGreen px-0.5 text-[9px] font-bold leading-none text-black shadow-[0_0_8px_rgba(4,244,190,0.8)]"
    >
      {count > 9 ? '9+' : count}
    </span>
  ) : null;

const rowClassName =
  'group flex w-full items-start gap-3 border-b border-pcnGreen-200 px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-pcnGreen/[0.07] focus-visible:bg-pcnGreen/[0.07] focus-visible:outline-none';

/** Loading rows shaped like the real ones, so the list doesn't jump when it arrives. */
const SkeletonRows = () => (
  <div aria-hidden>
    {Array.from({ length: 5 }, (_, i) => (
      <div key={i} className="flex items-start gap-3 border-b border-pcnGreen-200 px-3 py-2.5">
        <span className="mt-1 h-3 w-14 animate-pulse rounded-sm bg-pcnGreen-200" />
        <span className="flex flex-1 flex-col gap-1.5">
          <span className="h-3.5 w-3/4 animate-pulse rounded-sm bg-pcnGreen-200" />
          <span className="h-3 w-1/3 animate-pulse rounded-sm bg-pcnGreen-100" />
        </span>
      </div>
    ))}
  </div>
);

interface NotificationCenterProps {
  /** Opens a page of the site (a PCN OS window, or a regular navigation). */
  onNavigate: (_path: string) => void;
  triggerClassName?: string;
  /** Classes for the modal's backdrop and panel, e.g. to sit above PCN OS windows. */
  layerClassName?: string;
}

/**
 * A bell with a badge that opens a modal listing what's new: the latest feed items (new ones lit
 * up since the last look) and, for admins, their notifications.
 */
export function NotificationCenter({
  onNavigate,
  triggerClassName,
  layerClassName,
}: NotificationCenterProps) {
  const { data, loading, refresh, unseen, unread, markFeedSeen } = useNotificationCenter();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('novedades');
  const [markingAll, setMarkingAll] = useState(false);
  /** New items when the modal opened: they stay lit while it's open, even once marked seen. */
  const [litIds, setLitIds] = useState<Set<string>>(new Set());

  const admin = data?.admin ?? null;
  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'novedades', label: 'novedades', count: unseen.length },
    ...(admin ? [{ id: 'admin' as const, label: 'admin', count: admin.unread }] : []),
  ];

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setLitIds(new Set(unseen.map((item) => item.id)));
      if (!unseen.length && admin?.unread) setTab('admin');
      void refresh();
    } else {
      markFeedSeen();
    }
  };

  const go = (path: string) => {
    handleOpenChange(false);
    onNavigate(path);
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsAsRead();
      await refresh();
    } catch (error) {
      toast.error(actionErrorMessage(error, 'No se pudieron marcar como leídas'));
    } finally {
      setMarkingAll(false);
    }
  };

  const label = unread > 0 ? `Notificaciones (${unread} sin ver)` : 'Notificaciones';

  return (
    <>
      <button
        type="button"
        onClick={() => handleOpenChange(true)}
        aria-label={label}
        title={label}
        className={cn('relative flex items-center', triggerClassName)}
      >
        <Bell className={cn('size-3.5', unread > 0 && 'text-pcnGreen')} />
        <Badge count={unread} />
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          overlayClassName={layerClassName}
          className={cn('max-w-md gap-0 p-0', layerClassName)}
        >
          <DialogHeader className="px-5 pb-3 pt-5">
            <DialogTitle>notificaciones</DialogTitle>
            <DialogDescription className="text-xs">
              Lo último que pasó en la comunidad
              {admin ? ' y los avisos para admins' : ''}.
            </DialogDescription>
          </DialogHeader>

          <div role="tablist" className="flex items-center border-b border-pcnGreen-200 px-3">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={tab === item.id}
                onClick={() => setTab(item.id)}
                className={cn(
                  '-mb-px flex items-center gap-1.5 border-b-2 px-2 py-2 text-xs transition-colors',
                  tab === item.id
                    ? 'border-pcnGreen text-pcnGreen'
                    : 'border-transparent text-muted-foreground hover:text-pcnGreen',
                )}
              >
                {item.label}
                {item.count > 0 && (
                  <span className="rounded-sm bg-pcnGreen/15 px-1 text-[10px] tabular-nums text-pcnGreen">
                    {item.count}
                  </span>
                )}
              </button>
            ))}
            <span className="ml-auto flex items-center gap-2 text-[10px] text-pcnGreen-600">
              {loading && data && <RefreshCw className="size-3 animate-spin" aria-hidden />}
              {loading && data ? 'actualizando…' : 'en vivo'}
            </span>
          </div>

          <div className="max-h-[min(60vh,28rem)] overflow-y-auto" aria-busy={!data}>
            {!data ? (
              <SkeletonRows />
            ) : tab === 'novedades' ? (
              <FeedList items={data.feed} lit={litIds} onOpen={go} />
            ) : admin && admin.items.length ? (
              admin.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={rowClassName}
                  onClick={() => go('/notificaciones')}
                >
                  <span
                    className={cn(
                      'mt-1.5 size-1.5 shrink-0 rounded-full',
                      item.read ? 'bg-pcnGreen-300' : 'bg-pcnGreen shadow-[0_0_6px_#04f4be]',
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        'block truncate text-sm',
                        item.read ? 'text-muted-foreground' : 'text-foreground',
                      )}
                    >
                      {item.title}
                    </span>
                    <span className="line-clamp-2 text-xs text-muted-foreground">
                      {item.message}
                    </span>
                  </span>
                  <span className="shrink-0 text-[10px] text-pcnGreen-600">
                    {relativeTime(item.createdAt)}
                  </span>
                </button>
              ))
            ) : (
              <p className="px-4 py-8 text-center text-xs text-muted-foreground">
                $ sin notificaciones
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-dashed border-pcnGreen-200 px-3 py-2 text-xs">
            {tab === 'admin' && admin ? (
              <>
                <button
                  type="button"
                  disabled={markingAll || admin.unread === 0}
                  onClick={() => void markAllRead()}
                  className="flex items-center gap-1.5 text-pcnGreen-600 transition-colors hover:text-pcnGreen disabled:opacity-40"
                >
                  <CheckCheck className="size-3.5" />
                  {markingAll ? 'marcando…' : 'marcar todas como leídas'}
                </button>
                <button
                  type="button"
                  onClick={() => go('/notificaciones')}
                  className="text-pcnGreen hover:underline"
                >
                  ver todas →
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => go('/feed')}
                className="ml-auto text-pcnGreen hover:underline"
              >
                ver el feed →
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function FeedList({
  items,
  lit,
  onOpen,
}: {
  items: NotificationFeedItem[];
  lit: Set<string>;
  onOpen: (_path: string) => void;
}) {
  if (!items.length)
    return <p className="px-4 py-8 text-center text-xs text-muted-foreground">$ nada nuevo</p>;
  return items.map((item) => {
    const isNew = lit.has(item.id);
    return (
      <button
        key={item.id}
        type="button"
        className={rowClassName}
        onClick={() => onOpen(item.href)}
      >
        <span
          className={cn(
            'mt-0.5 w-16 shrink-0 truncate rounded-sm border px-1 text-center text-[10px]',
            isNew
              ? 'border-pcnGreen-500 text-pcnGreen'
              : 'border-pcnGreen-200 text-muted-foreground',
          )}
        >
          {KIND_LABELS[item.kind] ?? item.kind}
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              'block truncate text-sm transition-colors group-hover:text-pcnGreen',
              isNew ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            {isNew && <span className="mr-1 text-pcnGreen">●</span>}
            {item.title}
          </span>
          {item.meta && (
            <span className="block truncate text-xs text-muted-foreground">{item.meta}</span>
          )}
        </span>
        <span className="shrink-0 text-[10px] text-pcnGreen-600">{relativeTime(item.sortKey)}</span>
      </button>
    );
  });
}
