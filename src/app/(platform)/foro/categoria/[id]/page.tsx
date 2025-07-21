import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Heading2 } from '@/components/ui/heading-2';
import { ArrowLeft, Search, Pin, Heart, MessageCircle, Filter, SortDesc, Plus } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { notFound } from 'next/navigation';

const CategoryPage = async ({ params }: { params: { id: string } }) => {
  const category = await prisma.postCategory.findUnique({
    where: { slug: params.id },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  if (!category) {
    notFound();
  }

  const posts = await prisma.post.findMany({
    where: { categoryId: category.id },
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    include: {
      author: true,
      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
    },
  });

  // Estadísticas de la categoría
  const totalPosts = posts.length;
  const totalComments = await prisma.postComment.count({
    where: {
      post: {
        categoryId: category.id,
      },
    },
  });
  return (
    <div className="container mx-auto max-w-7xl p-6">
      <div className="mb-6">
        <Link
          href="/foro"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al foro
        </Link>
      </div>

      <div className="mb-8">
        <div className="mb-4 flex items-center gap-4">
          <div
            className={`h-16 w-16 rounded-xl ${category.color} flex items-center justify-center text-2xl text-white`}
          >
            {category.icon}
          </div>
          <div className="flex-1">
            <Heading2 className="mb-2">{category.name}</Heading2>
            <p className="text-muted-foreground">{category.description}</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo tema
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 md:w-96">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold text-primary">{totalPosts}</div>
              <div className="text-xs text-muted-foreground">Temas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold text-primary">{totalComments}</div>
              <div className="text-xs text-muted-foreground">Mensajes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold text-primary">{category._count.posts}</div>
              <div className="text-xs text-muted-foreground">Total Posts</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}

        <div className="space-y-6 lg:col-span-2">
          {/* SearchBar y Filtros */}

          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                  <Input placeholder="Buscar en Desarrollo Web..." className="pl-10" />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filtrar
                  </Button>
                  <Button variant="outline" size="sm">
                    <SortDesc className="mr-2 h-4 w-4" />
                    Ordenar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de posts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Posts recientes</CardTitle>
                <Badge variant="outline">{posts.length} Posts</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {posts.map((post) => (
                <Link key={post.id} href={`/foro/tema/${post.id}`}>
                  <Card className="cursor-pointer transition-all hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="mt-1 h-10 w-10">
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

                          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                            {post.content.substring(0, 200)}...
                          </p>

                          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{post.author.name}</span>
                            <span>•</span>
                            <span className="text-xs">
                              {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: es })}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4 text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <MessageCircle className="h-4 w-4" />
                                <span>{post._count.comments}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="h-4 w-4" />
                                <span>{post._count.likes}</span>
                              </div>
                            </div>
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
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full">
                🔔 Seguir categoría
              </Button>
            </CardContent>
          </Card>

          {/* Reglas de Categorias */}

          <Card>
            <CardHeader>
              <CardTitle>Reglas de la categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Mantén las discusiones relacionadas con {category.name.toLowerCase()}</li>
                <li>• Incluye código relevante cuando sea posible</li>
                <li>• Sé específico en los títulos de tus posts</li>
                <li>• Busca antes de crear un tema duplicado</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Moderadores activos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: 'Agustín Sánchez', avatar: '/agus.webp', status: 'online' },
                { name: 'German Navarro', avatar: '/german.webp', status: 'online' },
                { name: 'Mauricio Chaile', avatar: '/mauri.webp', status: 'away' },
              ].map((moderator) => (
                <div key={moderator.name} className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={moderator.avatar} alt={moderator.name} />
                      <AvatarFallback>{moderator.name[0]}</AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${
                        moderator.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{moderator.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {moderator.status === 'online' ? 'En línea' : 'Ausente'}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categorías relacionadas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { name: 'Móviles', icon: '📱', threads: 28 },
                { name: 'DevOps', icon: '⚙️', threads: 19 },
                { name: 'Bases de Datos', icon: '🗄️', threads: 22 },
              ].map((category) => (
                <Link key={category.name} href={`/foro/categoria/${category.name.toLowerCase()}`}>
                  <div className="flex cursor-pointer items-center justify-between rounded-lg p-2 hover:bg-muted">
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{category.threads}</span>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
