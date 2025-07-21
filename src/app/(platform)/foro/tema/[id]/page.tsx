import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Heading2 } from '@/components/ui/heading-2';
import { ArrowLeft, Heart, MessageCircle, Share2, Bookmark, Flag, Quote } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { renderMarkdown } from '@/lib/render-markdown';
import { PostActionsButton } from './delete-post-button';
import { cookies } from 'next/headers';

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

const ThreadDetailPage = async ({ params }: { params: { id: string } }) => {
  // Obtener usuario actual
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('sessionId')?.value;
  let currentUserId: string | null = null;

  if (sessionId) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { userId: true },
    });
    currentUserId = session?.userId || null;
  }

  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      author: true,
      category: true,
      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  const comments = await prisma.postComment.findMany({
    where: {
      postId: params.id,
      parentCommentId: null,
    },
    orderBy: { createdAt: 'asc' },
    include: {
      author: true,
      _count: {
        select: { likes: true },
      },
      replies: {
        include: {
          author: true,
          _count: {
            select: { likes: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
  return (
    <div className="container mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <Link
          href="/foro"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al foro
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                {post.isPinned && (
                  <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
                    📌 Fijado
                  </Badge>
                )}
                <Badge variant="outline">{post.category.name}</Badge>
              </div>

              <Heading2 className="mb-3">{post.title}</Heading2>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Bookmark className="mr-2 h-4 w-4" />
                Guardar
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Compartir
              </Button>
              <PostActionsButton
                postId={post.id}
                authorId={post.authorId}
                currentUserId={currentUserId}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={post.author.image || undefined} alt={post.author.name} />
              <AvatarFallback>{post.author.name[0]}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <span className="font-semibold">{post.author.name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(post.createdAt)}
                </span>
              </div>

              <div className="prose prose-sm dark:prose-invert max-w-none">
                {renderMarkdown(post.content)}
              </div>

              <div className="mt-6 flex items-center gap-4 border-t pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-red-500"
                >
                  <Heart className="mr-2 h-4 w-4" />
                  {post._count.likes}
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {post._count.comments}
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Quote className="mr-2 h-4 w-4" />
                  Citar
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Flag className="mr-2 h-4 w-4" />
                  Reportar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Respuestas ({comments.length})</h3>
          <Button variant="outline" size="sm">
            Ordenar por más recientes
          </Button>
        </div>

        {comments.map((comment) => (
          <Card key={comment.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={comment.author.image || undefined} alt={comment.author.name} />
                  <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="font-semibold">{comment.author.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(comment.createdAt)}
                    </span>
                  </div>

                  <div className="prose prose-sm dark:prose-invert mb-4 max-w-none">
                    {renderMarkdown(comment.content)}
                  </div>

                  <div className="flex items-center gap-4 border-t pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-red-500"
                    >
                      <Heart className="mr-2 h-4 w-4" />
                      {comment._count.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <Quote className="mr-2 h-4 w-4" />
                      Citar
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <Flag className="mr-2 h-4 w-4" />
                      Reportar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Agregar respuesta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Escribe tu respuesta aquí... Sé respetuoso y constructivo."
            className="min-h-[120px]"
          />
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Puedes usar Markdown para dar formato a tu respuesta
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Vista previa</Button>
              <Button>Publicar respuesta</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Temas similares</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { title: 'Recursos para aprender TypeScript', replies: 12 },
            { title: 'Mi primer proyecto en React - Feedback', replies: 8 },
            { title: 'Diferencias entre React y Vue.js', replies: 15 },
          ].map((thread, index) => (
            <Link key={index} href={`/foro/tema/${index + 2}`}>
              <div className="flex cursor-pointer items-center justify-between rounded-lg p-3 hover:bg-muted">
                <span className="text-sm font-medium">{thread.title}</span>
                <span className="text-xs text-muted-foreground">{thread.replies} respuestas</span>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ThreadDetailPage;
