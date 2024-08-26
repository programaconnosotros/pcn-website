import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';

const articles = [
  {
    title: 'Cómo nació nuestra comunidad',
    author: 'Agustín Sánchez',
    readTime: '5 min',
  },
];

export const LatestArticles = () => (
  <div className="mt-6">
    <Card>
      <CardHeader>
        <CardTitle>Últimos artículos publicados</CardTitle>
        <CardDescription> Mantente al día con las novedades de nuestra comunidad</CardDescription>
      </CardHeader>

      <CardContent>
        {articles.length === 0 ? (
          <p>No hay artículos publicados aún.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {articles.map((article, index) => (
              <div key={index} className="flex items-start space-x-4">
                <Avatar>
                  <AvatarImage src="/placeholder.svg?height=40&width=40" />
                  <AvatarFallback>{article.author.slice(0, 2)}</AvatarFallback>
                </Avatar>

                <div className="space-y-2">
                  <h3 className="font-medium leading-none">{article.title}</h3>

                  <p className="text-sm text-muted-foreground">
                    Publicado por {article.author} • Lectura de {article.readTime}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  </div>
);
