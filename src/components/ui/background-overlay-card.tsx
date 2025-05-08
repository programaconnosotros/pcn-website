'use client';

import { cn } from '@/lib/utils';

export const BackgroundOverlayCard = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="w-full">
    <div
      className={cn(
        'card group relative flex h-96 w-full cursor-pointer flex-col justify-end overflow-hidden rounded-md border border-transparent p-4 shadow-xl dark:border-neutral-800',
        'bg-opacity-50 bg-[url(http://localhost:3000/starbucks.webp)] bg-cover',
        // Preload hover image by setting it in a pseudo-element
        'before:fixed before:inset-0 before:z-[-1] before:bg-[url(http://localhost:3000/starbucks.webp)] before:opacity-0',
        'hover:bg-[url(http://localhost:3000/starbucks.webp)]',
        "after:absolute after:inset-0 after:bg-black after:opacity-50 after:content-['']",
        'transition-all duration-500',
      )}
    >
      <div className="text relative z-50">
        <h1 className="text-md relative font-bold text-gray-50 md:text-xl">{title}</h1>
        <p className="relative my-4 text-base font-normal text-gray-50">{description}</p>
      </div>
    </div>
  </div>
);
