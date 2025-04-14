'use client';

interface ImgContainerProps {
  photo: any;
}

export const ImgContainer = ({ photo }: ImgContainerProps) => (
  <div className="w-[350px] transform justify-self-center transition-opacity duration-700 ease-out">
    <div className="group relative overflow-hidden rounded-lg">
      <img
        src={photo.src}
        alt={`Imagen ${photo.id}`}
        width={350}
        height={300}
        className="h-auto w-full object-cover group-hover:opacity-75"
      />
    </div>
  </div>
);
