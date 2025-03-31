import { Heading2 } from '@/components/ui/heading-2';
import { Gallery } from '@components/photoGallery/gallery';

const Photos = () => (
  <div className="mt-4 w-screen px-4 md:px-20">
    <div className="flex flex-col">
      <Heading2>Fotos</Heading2>
      <Gallery />
    </div>
  </div>
);

export default Photos;
