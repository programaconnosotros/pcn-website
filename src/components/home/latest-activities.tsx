import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';

export const LatestArticles = () => (
  <div className="mt-6">
    <Card>
      <CardHeader>
        <CardTitle>Últimos artículos publicados</CardTitle>
        <CardDescription> Mantente al día con las novedades de nuestra comunidad</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
          {[
            {
              title: 'Cómo nació nuestra comunidad',
              author: 'Agustín Sánchez',
              readTime: '5 min',
            },
            {
              title: 'Cómo nació nuestra comunidad',
              author: 'Agustín Sánchez',
              readTime: '5 min',
            },
          ].map((post, index) => (
            <div key={index} className="flex items-start space-x-4">
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback>{post.author.slice(0, 2)}</AvatarFallback>
              </Avatar>

              <div className="space-y-2">
                <h3 className="font-medium leading-none">{post.title}</h3>

                <p className="text-sm text-muted-foreground">
                  Publicado por {post.author} • Lectura de {post.readTime}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);
