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
    <section className="flex max-w-[1248px] flex-wrap">
      {images.map((photo, key) => (
        <div key={key} className="w-full p-0 md:w-1/2 lg:w-1/3">
          <img
            src={photo.src}
            alt={`Imagen ${photo.id}`}
            width={350}
            height={300}
            className="h-auto w-full object-cover group-hover:opacity-75"
          />
        </div>
      ))}
    </section>
  );
};
