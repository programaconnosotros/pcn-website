'use client';
import { useEffect, useRef, useState } from 'react';

interface ImgContainerProps {
  photo: any;
}

export const ImgContainer = ({ photo }: ImgContainerProps) => {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const photoSpans = dimensions ? Math.ceil(dimensions.height / 10) + 1 : 1;

  return (
    <div
      ref={imgRef}
      className={`w-[350px] transform justify-self-center transition-opacity duration-700 ease-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
      }`}
      style={{ gridRow: `span ${photoSpans}` }}
    >
      <div className="group relative overflow-hidden rounded-lg">
        <img
          src={photo.src}
          alt={`Imagen ${photo.id}`}
          width={350}
          height={300}
          onLoad={(e) => {
            const img = e.target as HTMLImageElement;
            setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
          }}
          className="h-auto w-full object-cover group-hover:opacity-75"
        />
      </div>
    </div>
  );
};
