'use client';

import Link from 'next/link';
import ASZSoftwareLogo from './asz-software-logo';
import BoweryLogo from './bowery-logo';

export const MainSponsorCard = () => (
  <div className="-mx-6 flex w-[calc(100%+3rem)] flex-col gap-4">
    <Link
      href="https://asz.software"
      target="_blank"
      rel="noopener noreferrer"
      className="block !border-0 outline-none"
      style={{ border: 'none' }}
    >
      <ASZSoftwareLogo />
    </Link>

    <Link
      href="https://bowerystudio.co/en/"
      target="_blank"
      rel="noopener noreferrer"
      className="block !border-0 outline-none"
      style={{ border: 'none' }}
    >
      <BoweryLogo />
    </Link>
  </div>
);
