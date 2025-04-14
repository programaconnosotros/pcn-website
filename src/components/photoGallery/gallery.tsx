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

  // Dividir las imágenes en columnas
  const getColumnImages = (columnIndex: number, totalColumns: number) => {
    return images.filter((_, index) => index % totalColumns === columnIndex);
  };

  return (
    <section className="flex max-w-[1248px] gap-0">
      {/* Columna móvil */}
      <div className="flex w-full flex-col gap-0 md:hidden">
        {images.map((photo, key) => (
          <img
            key={key}
            src={photo.src}
            alt={`Imagen ${photo.id}`}
            className="h-auto w-full object-cover"
          />
        ))}
      </div>

      {/* Columnas tablet (2 columnas) */}
      <div className="hidden w-full gap-0 md:flex lg:hidden">
        <div className="flex w-1/2 flex-col gap-0">
          {getColumnImages(0, 2).map((photo, key) => (
            <img
              key={key}
              src={photo.src}
              alt={`Imagen ${photo.id}`}
              className="h-auto w-full object-cover"
            />
          ))}
        </div>
        <div className="flex w-1/2 flex-col gap-0">
          {getColumnImages(1, 2).map((photo, key) => (
            <img
              key={key}
              src={photo.src}
              alt={`Imagen ${photo.id}`}
              className="h-auto w-full object-cover"
            />
          ))}
        </div>
      </div>

      {/* Columnas desktop (3 columnas) */}
      <div className="hidden w-full gap-0 lg:flex">
        <div className="flex w-1/3 flex-col gap-0">
          {getColumnImages(0, 3).map((photo, key) => (
            <img
              key={key}
              src={photo.src}
              alt={`Imagen ${photo.id}`}
              className="h-auto w-full object-cover"
            />
          ))}
        </div>
        <div className="flex w-1/3 flex-col gap-0">
          {getColumnImages(1, 3).map((photo, key) => (
            <img
              key={key}
              src={photo.src}
              alt={`Imagen ${photo.id}`}
              className="h-auto w-full object-cover"
            />
          ))}
        </div>
        <div className="flex w-1/3 flex-col gap-0">
          {getColumnImages(2, 3).map((photo, key) => (
            <img
              key={key}
              src={photo.src}
              alt={`Imagen ${photo.id}`}
              className="h-auto w-full object-cover"
            />
          ))}
        </div>
      </div>
    </section>
  );
};
