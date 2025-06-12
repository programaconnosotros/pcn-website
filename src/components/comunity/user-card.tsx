import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  MapPin,
  Briefcase,
  GraduationCap,
  Code,
  Handshake,
  SquareArrowOutUpRight,
} from 'lucide-react';

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
  countryOfOrigin: string | null;
  slogan: string | null;
  jobTitle: string | null;
  enterprise: string | null;
  university: string | null;
  career: string | null;
};

type UserCardProps = {
  user: UserWithoutPassword;
  calcMembershipTime: string;
};

const UserCard = ({ user, calcMembershipTime }: UserCardProps) => {
  return (
    <Card className="transition-shadow duration-300 hover:shadow-lg">
      <CardHeader className="text-center">
        <Avatar className="mx-auto mb-4 h-20 w-20">
          <AvatarImage src={user.image || undefined} alt={user.name} />
          <AvatarFallback className="text-lg">
            {user.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
        <a href={`/perfil/${user.id}`}>
          <h3 className="text-xl font-semibold hover:underline">{user.name}</h3>
        </a>
        <p className="font-medium text-blue-600">{user.jobTitle}</p>
        {user.slogan && <p className="text-sm">{user.slogan}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Información básica */}
        <div className="space-y-2">
          {user.countryOfOrigin && (
            <div className="flex items-center gap-2 text-sm dark:text-gray-300">
              <MapPin className="h-4 w-4" />
              <span>{user.countryOfOrigin}</span>
            </div>
          )}
        </div>

        {/* Universidad o lugar de estudios */}
        {user.university && (
          <div className="flex items-center gap-2 text-sm dark:text-gray-300">
            <GraduationCap className="h-4 w-4" />
            <span>{user.university}</span>
          </div>
        )}

        {/* Empresa */}
        {user.enterprise && (
          <div className="flex items-center gap-2 text-sm dark:text-gray-300">
            <Briefcase className="h-4 w-4" />
            <span>{user.enterprise}</span>
          </div>
        )}

        {/* Lenguajes */}
        {user.languages.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Code className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium dark:text-gray-300">Lenguajes</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {user.languages.map((lang) => (
                <Badge
                  key={lang.language}
                  variant="outline"
                  className="border border-gray-600 text-xs"
                >
                  {lang.language}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Miembro desde */}
        <div className="flex items-center gap-2 text-sm dark:text-gray-300">
          <Handshake className="h-4 w-4" />
          <span>Miembro desde {calcMembershipTime}</span>
        </div>

        {/* Enlaces */}
        <div className="flex gap-2 pt-2">
          {user.linkedinUrl && (
            <Button size="sm" variant="outline" asChild>
              <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer">
                LinkedIn
                <SquareArrowOutUpRight className="ml-1" size={15} />
              </a>
            </Button>
          )}
          {user.xAccountUrl && (
            <Button size="sm" variant="outline" asChild>
              <a href={user.xAccountUrl} target="_blank" rel="noopener noreferrer">
                Twitter
                <SquareArrowOutUpRight className="ml-1" size={15} />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;
