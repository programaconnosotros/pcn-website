'use client';

export const ContentCard = ({
  title,
  description,
  image,
  author,
  timeToRead,
  authorImage,
}: {
  title: string;
  description: string;
  image: string;
  author?: string;
  timeToRead?: string;
  authorImage?: string;
}) => (
  <div className="group/card w-full cursor-default hover:cursor-pointer">
    <div className="relative mx-auto h-96 overflow-hidden rounded-md shadow-xl">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      />

      <div className="absolute inset-0 bg-black/50 transition-colors duration-300 group-hover/card:bg-black/70 dark:bg-black/70 dark:group-hover/card:bg-black/80"></div>

      <div className="relative z-10 flex h-full flex-col justify-between p-4">
        <div className="z-10 flex flex-row items-center space-x-4">
          {authorImage && (
            <img
              alt={`Avatar de ${author}`}
              src={authorImage}
              className="h-10 w-10 rounded-full border-2 object-cover"
            />
          )}

          <div className="flex flex-col">
            {author && <p className="text-base font-normal text-white">{author}</p>}

            {timeToRead && <p className="text-sm text-gray-300">{timeToRead}</p>}
          </div>
        </div>

        <div className="text content">
          <h1 className="text-xl font-bold text-white md:text-2xl">{title}</h1>
          <p className="my-4 text-sm font-normal text-gray-100">{description}</p>
        </div>
      </div>
    </div>
  </div>
);
