import { cn } from '@/lib/utils';

// Shows a flyer whole, whatever its shape: the poster sits on a blurred, darkened copy of itself
// instead of being cropped to fit the frame. Both images get their own compositor layer: the blur
// and the drop shadow are painted once and the hover zoom only moves pixels around, instead of
// re-blurring every frame (which made the pointer crawl over the /eventos museum grid).
export const FlyerFrame: React.FC<{
  src: string | undefined;
  alt: string;
  className?: string;
}> = ({ src, alt, className }) => (
  <div className={cn('relative overflow-hidden bg-black', className)}>
    {src ? (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          aria-hidden
          loading="lazy"
          className="absolute inset-0 h-full w-full scale-125 transform-gpu object-cover opacity-60 blur-2xl"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="relative h-full w-full object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.03]"
        />
      </>
    ) : (
      <div className="flex h-full w-full items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.webp" alt={alt} className="w-1/3 opacity-30" />
      </div>
    )}
  </div>
);
