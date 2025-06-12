'use client';

import { Heading2 } from '@/components/ui/heading-2';

import { useState, useMemo, useEffect } from 'react';
import { Search, Users, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  countryOfOrigin: string | null;
  slogan: string | null;
  jobTitle: string | null;
  enterprise: string | null;
  university: string | null;
  career: string | null;
};

const CommunityPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [users, setUsers] = useState<UserWithoutPassword[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    };
    fetchUsers();
  }, []);

  // Obtener todas las tecnologías y ubicaciones únicas
  const allLanguages = useMemo(() => {
    const languages = new Set<string>();
    users.forEach((user) => {
      user.languages.forEach((lang) => {
        languages.add(lang.language);
      });
    });
    return Array.from(languages);
  }, [users]);

  const allLocations = useMemo(() => {
    const locations = new Set<string>();
    users.forEach((user) => {
      if (user.countryOfOrigin) {
        locations.add(user.countryOfOrigin);
      }
    });
    return Array.from(locations);
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
      const matchesLanguages =
        selectedLanguages.length === 0 ||
        selectedLanguages.some((lang) => user.languages.some((l) => l.language === lang));

      return matchesSearch && matchesLocation && matchesLanguages;
    });
  }, [users, searchTerm, selectedLocation, selectedLanguages]);

  const handleLanguageToggle = (language: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(language) ? prev.filter((l) => l !== language) : [...prev, language],
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLocation('all');
    setSelectedLanguages([]);
  };

  const calcMembershipTime = (creationDate: Date): string => {
    const today = new Date();
    const diffInMs = today.getTime() - creationDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
    return rtf.format(-diffInDays, 'day');
  };

  return (
    <div className="mt-4 md:px-20">
      <div className="relative">
        <div className="sticky top-0 z-10 bg-background/95 pb-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between">
            <Heading2>Conoce a la comunidad!</Heading2>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}

          <div className="relative mb-12 text-center">
            {/* Main content */}
            <div className="relative z-10">
              {/* Logo/Icon section */}

              <div className="flex flex-col items-center">
                <img
                  src="/logo.webp"
                  alt="programaConNosotros"
                  className="w-[100px] md:w-[140px]"
                />
              </div>

              {/* Title with gradient */}
              <h1 className="mb-4 bg-gradient-to-r bg-clip-text text-5xl font-bold dark:text-white md:text-6xl">
                Miembros de PCN
              </h1>

              {/* Subtitle */}
              <div className="mb-6">
                <p className="mb-2 text-xl font-medium dark:text-gray-300 md:text-2xl">
                  Programa con Nosotros
                </p>
                <p className="mx-auto max-w-2xl text-lg dark:text-gray-300">
                  Conoce a nuestra increíble comunidad de apasionados por la tecnología
                </p>
              </div>

              {/* Stats section */}
              <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/80 px-6 py-3 shadow-lg backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 animate-pulse rounded-full bg-green-500"></div>
                  <Users className="h-5 w-5 text-gray-600" />
                </div>
                <span className="font-semibold text-gray-700">
                  {users.length} de {users.length} miembros
                </span>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Filtros</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, email o lenguaje..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtros en fila */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                {/* Ubicación */}
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las ubicaciones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las ubicaciones</SelectItem>
                    {allLocations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Lenguajes */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="justify-between">
                      <span>
                        {selectedLanguages.length === 0
                          ? 'Lenguajes'
                          : `${selectedLanguages.length} seleccionados`}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Lenguajes</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {allLanguages.map((lang) => (
                      <DropdownMenuCheckboxItem
                        key={lang}
                        checked={selectedLanguages.includes(lang)}
                        onCheckedChange={() => handleLanguageToggle(lang)}
                      >
                        {lang}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Limpiar filtros */}
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  Limpiar filtros
                </Button>
              </div>

              {/* Lenguajes seleccionados */}
              {selectedLanguages.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedLanguages.map((lang) => (
                    <Badge
                      key={lang}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleLanguageToggle(lang)}
                    >
                      {lang} ×
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Grid de miembros */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredUsers.map((user) => (
              <UserCard key={user.id} user={user} calcMembershipTime={calcMembershipTime} />
            ))}
          </div>

          {/* Mensaje cuando no hay resultados */}
          {filteredUsers.length === 0 && (
            <div className="py-12 text-center">
              <Users className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <h3 className="mb-2 text-xl font-semibold text-gray-600">
                No se encontraron miembros
              </h3>
              <p className="mb-4 text-gray-500">
                Intenta ajustar los filtros para encontrar más resultados
              </p>
              <Button onClick={clearFilters} variant="outline">
                Limpiar todos los filtros
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
