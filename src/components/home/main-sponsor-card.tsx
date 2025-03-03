'use client';

import Link from 'next/link';
import ASZSoftwareLogo from './asz-software-logo';

export const MainSponsorCard = () => (
  <Link
    href="https://asz.software"
    target="_blank"
    rel="noopener noreferrer"
    className="w-full rounded-md border"
  >
    <ASZSoftwareLogo />
  </Link>
);
