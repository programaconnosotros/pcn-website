import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { PageTitle } from '@/components/ui/page-title';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';

const videos = [
  'https://www.youtube.com/embed/1vsUPluzAWo?si=wCi5gplz67f6BAFY',
  'https://www.youtube.com/embed/SpNIOu8LAFo?si=brY8Or-NwelEx4Uf',
  'https://www.youtube.com/embed/sd9AbVNlgi4?si=qNVfuSwqjNSpk22-',
];

const Music = () => (
  <>
    <header className="flex h-16 shrink-0 items-center gap-2">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Música</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
    <div className="flex flex-1 flex-col p-4 pt-0">
      <PageTitle path="musica" className="mt-4" meta={`${videos.length} sets para programar`} />

      <RuledGrid className="mb-14 grid-cols-1 md:grid-cols-3">
        {videos.map((src) => (
          <div key={src} className={cn(ruledCellClassName, 'p-2')}>
            <div className="aspect-video w-full overflow-hidden">
              <iframe
                className="h-full w-full"
                src={src}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
        ))}
      </RuledGrid>
    </div>
  </>
);

export default Music;
