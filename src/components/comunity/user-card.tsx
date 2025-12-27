import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Briefcase, GraduationCap, SquareArrowOutUpRight } from 'lucide-react';

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
  return (
    <Card className="border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:scale-[1.02] hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Avatar a la izquierda */}
          <Avatar className="h-14 w-14 shrink-0">
            <AvatarImage src={user.image || undefined} alt={user.name} />
            <AvatarFallback>
              {user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>

          {/* Contenido a la derecha */}
          <div className="min-w-0 flex-1">
            <a href={`/perfil/${user.id}`}>
              <h3 className="truncate font-semibold transition-colors hover:text-pcnPurple hover:underline dark:hover:text-pcnGreen">
                {user.name}
              </h3>
            </a>
            {user.jobTitle && (
              <p className="truncate text-sm text-pcnPurple dark:text-pcnGreen">{user.jobTitle}</p>
            )}

            {/* Info compacta */}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {user.countryOfOrigin && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {user.countryOfOrigin}
                </span>
              )}
              {user.enterprise && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {user.enterprise}
                </span>
              )}
              {(user.career || user.studyPlace) && (
                <span className="flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" />
                  {user.career || user.studyPlace}
                </span>
              )}
            </div>

            {/* Lenguajes */}
            {user.languages.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {user.languages.slice(0, 4).map((lang) => (
                  <Badge
                    key={lang.language}
                    variant="secondary"
                    className="px-1.5 py-0 text-[10px]"
                  >
                    {lang.language}
                  </Badge>
                ))}
                {user.languages.length > 4 && (
                  <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                    +{user.languages.length - 4}
                  </Badge>
                )}
              </div>
            )}

            {/* Enlaces */}
            {(user.linkedinUrl || user.gitHubUrl || user.xAccountUrl) && (
              <div className="mt-3 flex gap-2">
                {user.linkedinUrl && (
                  <Button size="sm" variant="outline" className="h-7 px-2 text-xs" asChild>
                    <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer">
                      LinkedIn
                      <SquareArrowOutUpRight className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                )}
                {user.gitHubUrl && (
                  <Button size="sm" variant="outline" className="h-7 px-2 text-xs" asChild>
                    <a href={user.gitHubUrl} target="_blank" rel="noopener noreferrer">
                      GitHub
                      <SquareArrowOutUpRight className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                )}
                {user.xAccountUrl && (
                  <Button size="sm" variant="outline" className="h-7 px-2 text-xs" asChild>
                    <a href={user.xAccountUrl} target="_blank" rel="noopener noreferrer">
                      X
                      <SquareArrowOutUpRight className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;
