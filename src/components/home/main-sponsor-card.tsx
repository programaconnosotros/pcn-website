'use client';

import Link from 'next/link';
import ASZSoftwareLogo from './asz-software-logo';

export const MainSponsorCard = () => (
  <Link
    href="https://asz.software"
    target="_blank"
    rel="noopener noreferrer"
    className="-mx-6 block w-[calc(100%+3rem)] !border-0 outline-none"
    style={{ border: 'none' }}
  >
    <ASZSoftwareLogo />
  </Link>
);
