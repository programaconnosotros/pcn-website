import { redirect } from 'next/navigation';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { PhotoUploader } from '@/components/photo-gallery/photo-uploader';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import prisma from '@/lib/prisma';

export const metadata = { title: 'scp * ~/galeria' };

// Any member uploads photos; theirs wait for an admin. Admins also upload videos and publish
// straight away. `?trabajando=1` comes from the profile's "photos at work".
export default async function UploadPhotosPage(props: {
  searchParams: Promise<{ evento?: string; trabajando?: string }>;
}) {
  const { evento, trabajando } = await props.searchParams;
  const session = await getCurrentSession();
  if (!session) {
    const back = `/galeria/subir${trabajando ? '?trabajando=1' : ''}`;
    redirect(`/autenticacion/iniciar-sesion?redirect=${encodeURIComponent(back)}`);
  }
  const isAdmin = session.user.role === 'ADMIN';

  const events = await prisma.event.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, date: true, endDate: true },
    orderBy: { date: 'desc' },
  });
  const defaultEventId = events.some((event) => event.id === evento) ? evento! : null;

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <StickyHeader>
          <PageTitle
            path={[{ label: 'galeria', href: '/galeria' }, { label: 'subir' }]}
            meta={
              isAdmin
                ? 'Fotos optimizadas a WebP y videos tal cual, servidos por CloudFront'
                : 'Fotos de eventos o de vos trabajando, que publica un admin'
            }
          />
        </StickyHeader>

        <PhotoUploader
          events={events}
          defaultEventId={defaultEventId}
          canUploadVideos={isAdmin}
          needsReview={!isAdmin}
          defaultWorking={trabajando === '1'}
        />
      </div>
    </div>
  );
}
