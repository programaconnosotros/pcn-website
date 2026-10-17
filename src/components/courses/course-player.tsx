'use client';

import { cn } from '@/lib/utils';
import { Play } from 'lucide-react';
import { useState, type ReactNode } from 'react';

type CoursePlayerProps = {
  videoUrls: Array<string>;
  /** Course info rendered next to the player (right column on desktop). */
  children: ReactNode;
};

export const CoursePlayer = ({ videoUrls, children }: CoursePlayerProps) => {
  const [current, setCurrent] = useState(0);
  const hasPlaylist = videoUrls.length > 1;

  return (
    <div className="grid border border-pcnGreen-200 lg:grid-cols-[minmax(0,3fr)_minmax(18rem,2fr)]">
      <div className="border-b border-pcnGreen-200 p-4 lg:border-r lg:border-b-0">
        <div className="aspect-video w-full bg-black">
          <iframe
            key={videoUrls[current]}
            className="h-full w-full"
            src={videoUrls[current]}
            title={hasPlaylist ? `Clase ${current + 1}` : 'YouTube video player'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div>

      <div className="flex flex-col divide-y divide-pcnGreen-200">
        {children}

        {hasPlaylist && (
          <section className="p-4">
            <p className="mb-2 font-mono text-[11px] text-muted-foreground/70">
              <span className="text-pcnGreen-500"># </span>
              clases · {current + 1}/{videoUrls.length}
            </p>
            <ol className="flex flex-col">
              {videoUrls.map((url, index) => {
                const isActive = index === current;
                return (
                  <li key={url}>
                    <button
                      type="button"
                      onClick={() => setCurrent(index)}
                      aria-current={isActive}
                      className={cn(
                        'flex w-full items-center gap-2 border-l-2 px-2 py-1.5 text-left font-mono text-xs transition-colors',
                        isActive
                          ? 'border-pcnGreen-500 bg-pcnGreen/10 text-foreground'
                          : 'border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                      )}
                    >
                      <Play
                        className={cn(
                          'h-3 w-3 shrink-0',
                          isActive ? 'fill-pcnGreen-500 text-pcnGreen-500' : 'opacity-40',
                        )}
                      />
                      clase {String(index + 1).padStart(2, '0')}
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>
        )}
      </div>
    </div>
  );
};
