import { Heading2 } from '@/components/ui/heading-2';
import { Card } from '@/components/ui/card';

const Music = () => (
  <div className="container mx-auto flex flex-col items-center py-8">
    <div className="w-full max-w-2xl">
      <Heading2 className="mb-6 text-center">Música</Heading2>

      <div className="flex flex-col gap-6">
        <Card className="p-4">
          <iframe
            className="aspect-video w-full"
            src="https://www.youtube.com/embed/1vsUPluzAWo?si=eOETPe27pANZ7nnE"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </Card>

        <Card className="p-4">
          <iframe
            className="aspect-video w-full"
            src="https://www.youtube.com/embed/SpNIOu8LAFo?si=hWW2nVydrRbjyif8"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </Card>

        <Card className="p-4">
          <iframe
            className="aspect-video w-full"
            src="https://www.youtube.com/embed/sd9AbVNlgi4?si=qdziYpPKw4XXCFZd"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </Card>
      </div>
    </div>
  </div>
);

export default Music;
