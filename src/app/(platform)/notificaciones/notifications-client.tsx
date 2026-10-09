'use client';

import { Button } from '@/components/ui/button';
import { ArrowUpRight, Bell, Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { markNotificationAsRead } from '@/actions/notifications/mark-as-read';
import { markAllNotificationsAsRead } from '@/actions/notifications/mark-all-as-read';
import { toast } from 'sonner';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { actionErrorMessage } from '@/lib/rate-limit-messages';
import { REVIEW_QUEUE_PATH } from '@/schemas/recommendation-schema';

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  metadata: string | null;
  createdAt: Date;
};

type NotificationsClientProps = {
  notifications: Notification[];
};

const EVENT_NOTIFICATION_TYPES = [
  'event_registration_created',
  'event_registration_cancelled',
  'event_waitlist_joined',
  'event_waitlist_cancelled',
  'event_waitlist_promoted',
];

const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'hace menos de un minuto';
  if (minutes < 60) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  if (hours < 24) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
  return `hace ${days} día${days > 1 ? 's' : ''}`;
};

export function NotificationsClient({ notifications }: NotificationsClientProps) {
  const router = useRouter();
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);

  const unreadNotifications = notifications.filter((n) => !n.read);
  const readNotifications = notifications.filter((n) => n.read);

  const getTestimonialId = (notification: Notification): string | null => {
    if (
      notification.type === 'testimonial_created' ||
      notification.type === 'testimonial_updated' ||
      notification.type === 'testimonial_deleted'
    ) {
      try {
        const metadata = notification.metadata ? JSON.parse(notification.metadata) : null;
        return metadata?.testimonialId || null;
      } catch {
        return null;
      }
    }
    return null;
  };

  const isTestimonialNotification = (notification: Notification): boolean => {
    return (
      notification.type === 'testimonial_created' ||
      notification.type === 'testimonial_updated' ||
      notification.type === 'testimonial_deleted'
    );
  };

  const isEventNotification = (notification: Notification): boolean => {
    return EVENT_NOTIFICATION_TYPES.includes(notification.type);
  };

  const getEventId = (notification: Notification): string | null => {
    if (isEventNotification(notification)) {
      try {
        const metadata = notification.metadata ? JSON.parse(notification.metadata) : null;
        return metadata?.eventId || null;
      } catch {
        return null;
      }
    }
    return null;
  };

  const handleMarkAsRead = async (notificationId: string) => {
    setMarkingAsRead(notificationId);
    try {
      await markNotificationAsRead(notificationId);
      toast.success('Notificación marcada como leída');
      router.refresh();
    } catch (error: any) {
      toast.error(actionErrorMessage(error, 'Error al marcar la notificación como leída', true));
    } finally {
      setMarkingAsRead(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadNotifications.length === 0) return;

    setMarkingAllAsRead(true);
    try {
      await markAllNotificationsAsRead();
      toast.success('Todas las notificaciones marcadas como leídas');
      router.refresh();
    } catch (error: any) {
      toast.error(
        actionErrorMessage(error, 'Error al marcar las notificaciones como leídas', true),
      );
    } finally {
      setMarkingAllAsRead(false);
    }
  };

  if (notifications.length === 0) {
    return (
      <p className="flex items-center gap-2 border border-pcnGreen-200 p-4 font-mono text-xs text-muted-foreground">
        <Bell className="h-3.5 w-3.5 text-pcnGreen-500" />
        No tienes notificaciones
      </p>
    );
  }

  const renderRow = (notification: Notification, unread: boolean) => {
    const testimonialId = getTestimonialId(notification);
    const hasTestimonialLink = isTestimonialNotification(notification) && testimonialId;
    const eventId = getEventId(notification);
    const hasEventLink = isEventNotification(notification) && eventId;
    const hasRecommendationLink = notification.type === 'recommendation_pending';
    const linkClassName =
      'flex items-center gap-1 font-mono text-[11px] text-pcnGreen-700 transition-colors hover:text-pcnGreen';

    return (
      <div
        key={notification.id}
        className={cn(
          'flex items-start gap-3 p-3 transition-colors hover:bg-pcnGreen/[0.04]',
          unread ? 'shadow-[inset_2px_0_0_0_#04f4be]' : 'opacity-70',
        )}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-baseline gap-2 font-mono">
            <h4 className="text-sm font-semibold">{notification.title}</h4>
            <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">
              {formatRelativeTime(notification.createdAt)}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">{notification.message}</p>
          {(hasTestimonialLink || hasEventLink || hasRecommendationLink) && (
            <div className="flex flex-wrap gap-3">
              {hasTestimonialLink && (
                <Link href={`/testimonios/${testimonialId}`} className={linkClassName}>
                  ver testimonio
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              )}
              {hasRecommendationLink && (
                <Link href={REVIEW_QUEUE_PATH} className={linkClassName}>
                  revisar recomendaciones
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              )}
              {hasEventLink && (
                <>
                  <Link href={`/eventos/${eventId}`} className={linkClassName}>
                    ver evento
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                  <Link href={`/eventos/${eventId}/inscripciones`} className={linkClassName}>
                    ver inscripciones
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
        {unread && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            title="Marcar como leída"
            onClick={() => handleMarkAsRead(notification.id)}
            disabled={markingAsRead === notification.id}
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    );
  };

  const sectionTitleClassName =
    'flex items-center justify-between gap-2 px-3 py-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground';

  return (
    <div className="mb-14 divide-y divide-pcnGreen-200 border border-pcnGreen-200">
      {unreadNotifications.length > 0 && (
        <>
          <div className={sectionTitleClassName}>
            <span>
              <span className="text-pcnGreen-500">{'// '}</span>
              sin leer [{unreadNotifications.length}]
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 font-mono text-[11px] tracking-normal normal-case"
              onClick={handleMarkAllAsRead}
              disabled={markingAllAsRead}
            >
              <CheckCheck className="mr-1 h-3.5 w-3.5" />
              marcar todas
            </Button>
          </div>
          {unreadNotifications.map((notification) => renderRow(notification, true))}
        </>
      )}

      {readNotifications.length > 0 && (
        <>
          <div className={sectionTitleClassName}>
            <span>
              <span className="text-pcnGreen-500">{'// '}</span>
              leídas [{readNotifications.length}]
            </span>
          </div>
          {readNotifications.map((notification) => renderRow(notification, false))}
        </>
      )}
    </div>
  );
}
