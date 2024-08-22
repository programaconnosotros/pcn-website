import { ThumbsUp, MessageCircle, Share2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const Advise = ({
  advise,
}: {
  advise: {
    id: number;
    author: {
      name: string;
      subtitle: string;
      avatar: string;
    };
    content: string;
    likes: number;
    comments: number;
  };
}) => (
  <Card key={advise.id} className="w-full">
    <CardHeader className="flex flex-row items-center gap-3 px-4 py-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={advise.author.avatar} alt={advise.author.name} />
        <AvatarFallback>{advise.author.name.charAt(0)}</AvatarFallback>
      </Avatar>

      <div className="flex flex-col">
        <h3 className="text-base font-semibold leading-tight">{advise.author.name}</h3>
        <p className="text-xs text-muted-foreground">{advise.author.subtitle}</p>
      </div>
    </CardHeader>

    <CardContent className="px-4 py-2">
      <p className="text-sm">{advise.content}</p>
    </CardContent>

    <CardFooter className="flex justify-between px-4 py-2">
      <Button variant="ghost" size="sm" className="text-xs">
        <ThumbsUp className="mr-1 h-3 w-3" />
        {advise.likes}
      </Button>

      <Button variant="ghost" size="sm" className="text-xs">
        <MessageCircle className="mr-1 h-3 w-3" />
        {advise.comments}
      </Button>

      <Button variant="ghost" size="sm" className="text-xs">
        <Share2 className="mr-1 h-3 w-3" />
        Share
      </Button>
    </CardFooter>
  </Card>
);
