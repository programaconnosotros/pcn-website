'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Heading2 } from '@/components/ui/heading-2';
import {
  Search,
  MessageSquare,
  Users,
  TrendingUp,
  Pin,
  Heart,
  MessageCircle,
  Clock,
  Filter,
  Monitor,
  Smartphone,
  Settings,
  Database,
  Rocket,
} from 'lucide-react';
import Link from 'next/link';
import { ForumData } from '@/app/(platform)/foro/forum-data';
import { NewPostButton } from './new-post-button';

// Función personalizada para formatear tiempo de manera mas exacta
const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'hace unos segundos';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `hace ${diffInMinutes} minuto${diffInMinutes === 1 ? '' : 's'}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `hace ${diffInHours} hora${diffInHours === 1 ? '' : 's'}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `hace ${diffInDays} día${diffInDays === 1 ? '' : 's'}`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `hace ${diffInMonths} mes${diffInMonths === 1 ? '' : 'es'}`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `hace ${diffInYears} año${diffInYears === 1 ? '' : 's'}`;
};

const getCategoryIcon = (iconString: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    '💻': <Monitor className="h-4 w-4" />,
    '📱': <Smartphone className="h-4 w-4" />,
    '⚙️': <Settings className="h-4 w-4" />,
    '🗄️': <Database className="h-4 w-4" />,
    '🚀': <Rocket className="h-4 w-4" />,
  };

  return iconMap[iconString] || <MessageSquare className="h-4 w-4" />;
};

const getCategoryBgColor = (color: string) => {
  const colorMap: { [key: string]: string } = {
    'bg-blue-500': 'bg-blue-500',
    'bg-green-500': 'bg-green-500',
    'bg-purple-500': 'bg-purple-500',
    'bg-orange-500': 'bg-orange-500',
    'bg-pink-500': 'bg-pink-500',
  };

  return colorMap[color] || 'bg-gray-500';
};

interface ForumClientProps {
  data: ForumData;
}

export function ForumClient({ data }: ForumClientProps) {
  const { totalPosts, totalUsers, categories, recentPosts, currentUser } = data;

  return (
    <div className="container mx-auto max-w-7xl p-6">
      {/* Header */}

      <div className="mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Heading2 className="mb-2">Foro de la Comunidad</Heading2>
            <p className="text-muted-foreground">
              Comparte conocimientos, haz preguntas y conecta con otros desarrolladores
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input placeholder="Buscar en el foro..." className="w-full pl-10 sm:w-80" />
            </div>
            <NewPostButton user={currentUser} />
          </div>
        </div>

        {/* Estadisticas */}
        <div className="mx-auto mt-6 flex max-w-4xl flex-wrap items-center justify-center gap-4">
          <Card className="min-w-[180px]">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{totalPosts}</div>
              <div className="text-sm text-muted-foreground">Posts</div>
            </CardContent>
          </Card>

          <Card className="min-w-[180px]">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{totalUsers}</div>
              <div className="text-sm text-muted-foreground">Miembros</div>
            </CardContent>
          </Card>

          <Card className="min-w-[180px]">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                <div className="text-2xl font-bold text-primary">{categories.length}</div>
              </div>
              <div className="text-sm text-muted-foreground">Conectados</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Posts Recientes
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentPosts.map((post) => (
                <Link key={post.id} href={`/foro/tema/${post.id}`}>
                  <Card className="cursor-pointer transition-all hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={post.author.image || undefined}
                            alt={post.author.name}
                          />
                          <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            {post.isPinned && <Pin className="h-4 w-4 text-primary" />}
                            <h3 className="truncate font-semibold">{post.title}</h3>
                          </div>

                          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{post.author.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {post.category.name}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4" />
                              <span>{post._count.comments}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              <span>{post._count.likes}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimeAgo(post.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar-Derecho */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Sobre la Comunidad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Bienvenido al foro oficial de programaConNosotros. Un espacio para compartir
                conocimientos, resolver dudas y conectar con otros desarrolladores.
              </p>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Reglas del foro:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Sé respetuoso al momento de hacer un post o comentar</li>
                  <li>• Usa las categorías correctas</li>
                  <li>• Busca antes de preguntar</li>
                  <li>• Comparte código cuando sea relevante</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Categorías
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categories.map((category) => (
                  <Link key={category.id} href={`/foro/categoria/${category.slug}`}>
                    <Card className="cursor-pointer transition-all hover:scale-105 hover:shadow-md">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-8 w-8 rounded-lg ${getCategoryBgColor(category.color)} flex items-center justify-center text-white`}
                          >
                            {getCategoryIcon(category.icon)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold">{category.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {category.description}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {category._count.posts} posts
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contribuidores Destacados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: 'Agustín Sánchez', posts: 45, avatar: '/agus.webp' },
                { name: 'Mauricio Sánchez', posts: 32, avatar: '/mauri.webp' },
                { name: 'German Navarro', posts: 28, avatar: '/german.webp' },
              ].map((contributor) => (
                <div key={contributor.name} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={contributor.avatar} alt={contributor.name} />
                    <AvatarFallback>{contributor.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{contributor.name}</div>
                    <div className="text-xs text-muted-foreground">{contributor.posts} posts</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
