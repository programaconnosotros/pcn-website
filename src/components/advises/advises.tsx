'use client';

import { AddAdvise } from './add-advise';
import { Advise } from './advise';

// TODO: Check if there are new advises and if user accepts update the list.

export const Advises = ({
  advises,
}: {
  advises: {
    id: string;
    content: string;
    createdAt: Date;
    author: {
      id: string;
      name: string;
    };
  }[];
}) => (
  <>
    <AddAdvise />

    <div className="space-y-4">
      {advises.map((advise) => (
        <Advise key={advise.id} advise={advise} />
      ))}
    </div>
  </>
);
