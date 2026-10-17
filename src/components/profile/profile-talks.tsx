'use client';

import { useState } from 'react';
import { TalkCell, TalkMediaDialogs, type TalkWithEvent } from '@/components/talks/community-talks';
import { FullRowsCell, RuledGrid } from '@/components/ui/ruled-grid';
import { TALK_COLUMNS } from './profile-grid-columns';

/** The talks someone gave, with the /charlas cell: big cover, whole title, video and slides in place. */
export const ProfileTalks = ({
  talks,
  fillRows = false,
}: {
  talks: TalkWithEvent[];
  /** A capped preview: hide what would leave a row half empty. */
  fillRows?: boolean;
}) => {
  const [playing, setPlaying] = useState<TalkWithEvent | null>(null);
  const [slides, setSlides] = useState<TalkWithEvent | null>(null);

  return (
    <>
      <RuledGrid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {talks.map((talk, index) => (
          <FullRowsCell
            key={talk.id}
            index={index}
            count={fillRows ? talks.length : 0}
            columns={TALK_COLUMNS}
          >
            <TalkCell
              talk={talk}
              fullText
              isAdmin={false}
              onPlay={() => setPlaying(talk)}
              onSlides={() => setSlides(talk)}
            />
          </FullRowsCell>
        ))}
      </RuledGrid>

      <TalkMediaDialogs
        playing={playing}
        slides={slides}
        onClosePlaying={() => setPlaying(null)}
        onCloseSlides={() => setSlides(null)}
      />
    </>
  );
};
