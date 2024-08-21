import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ThumbsUp, MessageCircle, Share2, PlusCircle } from 'lucide-react';
import { SignOut } from '@/components/auth/sign-out';
import { ThemeToggle } from '../themes/theme-toggle';

const advicePosts = [
  {
    id: 1,
    author: {
      name: 'Jane Doe',
      avatar: '/placeholder.svg?height=40&width=40',
      subtitle: 'Senior Developer @TechCorp',
    },
    content:
      'Siempre escribe código autodescriptivo. Usa nombres de variables y funciones claros que describan lo que hacen. Te ahorrará a ti y a tu equipo mucho tiempo a largo plazo.',
    likes: 42,
    comments: 5,
  },
  {
    id: 2,
    author: {
      name: 'John Smith',
      avatar: '/placeholder.svg?height=40&width=40',
      subtitle: 'Software Architect @InnovativeSolutions',
    },
    content:
      'No optimices prematuramente. Primero haz que funcione, luego hazlo bien, y finalmente hazlo rápido. Pero solo si no es lo suficientemente rápido ya.',
    likes: 38,
    comments: 7,
  },
  {
    id: 3,
    author: {
      name: 'Alice Johnson',
      avatar: '/placeholder.svg?height=40&width=40',
      subtitle: 'Full Stack Developer @Eagerworks',
    },
    content:
      'Aprende a usar el control de versiones de manera efectiva. Git no es solo para hacer copias de seguridad de tu código, es una herramienta poderosa para la colaboración y la gestión del historial de tu proyecto.',
    likes: 55,
    comments: 10,
  },
];

export default function Advises() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-2">
          <h1 className="text-lg font-semibold">
            <code>programaConNosotros</code>
          </h1>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SignOut />
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-2xl p-4">
        <div className="mb-4">
          <Button className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" />
            Postear consejo
          </Button>
        </div>

        <div className="space-y-4">
          {advicePosts.map((post) => (
            <Card key={post.id} className="w-full">
              <CardHeader className="flex flex-row items-center gap-3 px-4 py-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                  <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <h3 className="text-base font-semibold leading-tight">{post.author.name}</h3>
                  <p className="text-xs text-muted-foreground">{post.author.subtitle}</p>
                </div>
              </CardHeader>
              <CardContent className="px-4 py-2">
                <p className="text-sm">{post.content}</p>
              </CardContent>
              <CardFooter className="flex justify-between px-4 py-2">
                <Button variant="ghost" size="sm" className="text-xs">
                  <ThumbsUp className="mr-1 h-3 w-3" />
                  {post.likes}
                </Button>
                <Button variant="ghost" size="sm" className="text-xs">
                  <MessageCircle className="mr-1 h-3 w-3" />
                  {post.comments}
                </Button>
                <Button variant="ghost" size="sm" className="text-xs">
                  <Share2 className="mr-1 h-3 w-3" />
                  Share
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
