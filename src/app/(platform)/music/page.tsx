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
