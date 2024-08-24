'use client';

import { AddAdvise } from './add-advise';
import { AdviseCard } from './advise-card';
import { Advise } from '@prisma/generated/zod';

// TODO: Check if there are new advises and if user accepts update the list.

export const Advises = ({ advises }: { advises: Advise[] }) => (
  <>
    <AddAdvise />

    <div className="space-y-4">
      {advises.map((advise) => (
        <AdviseCard key={advise.id} advise={advise} />
      ))}
    </div>
  </>
);
