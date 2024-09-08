import { Card } from '@/components/ui/card';
import { Heading2 } from '@/components/ui/heading-2';

const VimCourse = () => (
  <div className="mt-4 md:px-20">
    <Heading2>Vim</Heading2>

    <div className="mt-4 w-full" style={{ aspectRatio: '16/9' }}>
      <Card className="mb-8 h-full w-full p-8">
        <iframe
          className="h-full w-full"
          src="https://www.youtube.com/embed/C-C4xoCj_Lw?si=ik0XqUGkz4Xw7hZ4"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </Card>

      <Card className="mb-8 h-full w-full p-8">
        <iframe
          className="h-full w-full"
          src="https://www.youtube.com/embed/0s1ccWvLGYw?si=ph1rPlNvBoobmbG8"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </Card>

      <Card className="mb-8 h-full w-full p-8">
        <iframe
          className="h-full w-full"
          src="https://www.youtube.com/embed/9VIma5G-gUc?si=dHyZoKRqvc3Vpi0S"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </Card>

      <Card className="mb-8 h-full w-full p-8">
        <iframe
          className="h-full w-full"
          src="https://www.youtube.com/embed/WVzklaR68PM?si=1b4QIepxrw44Tw45"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </Card>
    </div>
  </div>
);

export default VimCourse;
