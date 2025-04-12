import { ImgContainer } from '@components/photoGallery/imgContainer';

export const Gallery = () => {
  const images = [
    { id: '1', src: '/gallery-photos/agus-chelo-talk.webp' },
    { id: '2', src: '/gallery-photos/agus-chelo-tobias-watch-pc.webp' },
    { id: '3', src: '/gallery-photos/agus-init.webp' },
    { id: '4', src: '/gallery-photos/agus-pc.webp' },
    { id: '5', src: '/gallery-photos/agus-talk.webp' },
    { id: '6', src: '/gallery-photos/boys-having-a-snack.webp' },
    { id: '7', src: '/gallery-photos/chelo-watch-pc.webp' },
    { id: '8', src: '/gallery-photos/leno-time.webp' },
    { id: '9', src: '/gallery-photos/mauricio-talk.webp' },
    { id: '10', src: '/gallery-photos/photo-casual.webp' },
    { id: '11', src: '/gallery-photos/talk-class.webp' },
    { id: '12', src: '/gallery-photos/tobias-talk.webp' },
    { id: '13', src: '/gallery-photos/tobias-watch-pc.webp' },
  ];

  return (
    <section className="grid max-w-[1248px] auto-rows-[10px] grid-cols-[repeat(auto-fit,_minmax(350px,_1fr))]">
      {images.map((photo, key) => (
        <ImgContainer photo={photo} key={key} />
      ))}
    </section>
  );
};
