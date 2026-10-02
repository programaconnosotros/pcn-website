import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type UserWithoutPassword = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  image: string | null;
  languages: {
    language: string;
    color: string;
    logo: string;
  }[];
  linkedinUrl: string | null;
  xAccountUrl: string | null;
  gitHubUrl: string | null;
  countryOfOrigin: string | null;
  slogan: string | null;
  jobTitle: string | null;
  enterprise: string | null;
  career: string | null;
  studyPlace: string | null;
};

type UserCardProps = {
  user: UserWithoutPassword;
  calcMembershipTime: string;
};

const UserCard = ({ user }: UserCardProps) => {
  const facts = [user.countryOfOrigin, user.enterprise, user.career || user.studyPlace].filter(
    Boolean,
  );
  const links = [
    { label: 'linkedin', url: user.linkedinUrl },
    { label: 'github', url: user.gitHubUrl },
    { label: 'x', url: user.xAccountUrl },
  ].filter((link) => link.url);

  return (
    <div className={cn(ruledCellClassName, 'flex gap-3 p-3')}>
      <Avatar className="h-9 w-9 shrink-0 rounded-sm">
        <AvatarImage src={user.image || undefined} alt={user.name} />
        <AvatarFallback className="rounded-sm">
          {user.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)}
        </AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2 font-mono text-sm">
          <Link href={`/perfil/${user.id}`} className="truncate font-semibold hover:text-pcnGreen">
            {user.name}
          </Link>
          {user.jobTitle && (
            <span className="truncate text-[11px] text-pcnGreen-700">{user.jobTitle}</span>
          )}
        </div>

        {facts.length > 0 && (
          <p className="truncate text-xs text-muted-foreground">{facts.join(' · ')}</p>
        )}

        {(user.languages.length > 0 || links.length > 0) && (
          <p className="flex flex-wrap gap-x-3 font-mono text-[11px] text-muted-foreground/70">
            {user.languages.length > 0 && (
              <span>
                <span className="text-pcnGreen-500"># </span>
                {user.languages.map((lang) => lang.language).join(' · ')}
              </span>
            )}
            {links.map((link) => (
              <a
                key={link.label}
                href={link.url!}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pcnGreen"
              >
                {link.label}↗
              </a>
            ))}
          </p>
        )}
      </div>
    </div>
  );
};

export default UserCard;
