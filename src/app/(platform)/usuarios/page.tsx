'use client';

import { Heading2 } from '@/components/ui/heading-2';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useState, useMemo, useEffect } from 'react';
import { Search, Users, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getUsers } from '@/actions/users/get-users';
import UserCard from '@/components/comunity/user-card';

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

const CommunityPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [users, setUsers] = useState<UserWithoutPassword[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    };
    fetchUsers();
  }, []);

  const allLanguages = useMemo(() => {
    const languages = new Set<string>();
    users.forEach((user) => {
      user.languages.forEach((lang) => {
        languages.add(lang.language);
      });
    });
    return Array.from(languages).sort();
  }, [users]);

  const allLocations = useMemo(() => {
    const locations = new Set<string>();
    users.forEach((user) => {
      if (user.countryOfOrigin) {
        locations.add(user.countryOfOrigin);
      }
    });
    return Array.from(locations).sort();
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.languages.some((lang) =>
          lang.language.toLowerCase().includes(searchTerm.toLowerCase()),
        );

      const matchesLocation =
        selectedLocation === 'all' || user.countryOfOrigin === selectedLocation;
      const matchesLanguage =
        selectedLanguage === 'all' || user.languages.some((l) => l.language === selectedLanguage);

      return matchesSearch && matchesLocation && matchesLanguage;
    });
  }, [users, searchTerm, selectedLocation, selectedLanguage]);

  const hasFilters = searchTerm || selectedLocation !== 'all' || selectedLanguage !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLocation('all');
    setSelectedLanguage('all');
  };

  const calcMembershipTime = (creationDate: Date): string => {
    const today = new Date();
    const diffInMs = today.getTime() - creationDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
    return rtf.format(-diffInDays, 'day');
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Usuarios</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4">
          <div className="mb-4 flex items-center justify-between">
            <Heading2 className="m-0 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-pcnPurple/30 bg-pcnPurple/10 dark:border-pcnGreen/50 dark:bg-pcnGreen/10 dark:shadow-[0_0_10px_rgba(4,244,190,0.4)]">
                <Users className="h-5 w-5 text-pcnPurple dark:text-pcnGreen dark:drop-shadow-[0_0_8px_rgba(4,244,190,0.8)]" />
              </div>
              <span className="dark:drop-shadow-[0_0_12px_rgba(4,244,190,0.8)]">Usuarios</span>
            </Heading2>
            <span className="text-sm text-muted-foreground">
              {filteredUsers.length} de {users.length}
            </span>
          </div>

          {/* Filtros compactos */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="País" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los países</SelectItem>
                {allLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Lenguaje" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {allLanguages.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtros activos */}
          {hasFilters && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {selectedLocation !== 'all' && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer gap-1"
                  onClick={() => setSelectedLocation('all')}
                >
                  {selectedLocation}
                  <X className="h-3 w-3" />
                </Badge>
              )}
              {selectedLanguage !== 'all' && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer gap-1"
                  onClick={() => setSelectedLanguage('all')}
                >
                  {selectedLanguage}
                  <X className="h-3 w-3" />
                </Badge>
              )}
              <button
                onClick={clearFilters}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Limpiar todo
              </button>
            </div>
          )}

          {/* Grid de usuarios */}
          {filteredUsers.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  calcMembershipTime={calcMembershipTime(user.createdAt)}
                />
              ))}
            </div>
          ) : (
            <p className="py-12 text-center text-muted-foreground">
              No se encontraron usuarios con estos filtros.
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default CommunityPage;
