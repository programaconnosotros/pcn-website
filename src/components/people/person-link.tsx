import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export type Person = { id: string; name: string; image: string | null };

/** Avatar + name linking to the person's profile. */
export const PersonLink = ({ person, className }: { person: Person; className?: string }) => (
  <Link
    href={`/perfil/${person.id}`}
    className={cn(
      'group flex min-w-0 items-center gap-2 font-mono text-xs hover:text-pcnGreen',
      className,
    )}
  >
    <Avatar className="size-6 rounded-sm">
      <AvatarImage src={person.image ?? undefined} alt="" />
      <AvatarFallback className="rounded-sm text-[10px] uppercase">
        {person.name.charAt(0)}
      </AvatarFallback>
    </Avatar>
    <span className="truncate group-hover:underline">{person.name}</span>
  </Link>
);
