import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Heading2 } from '@/components/ui/heading-2';
import { Calendar, FileText, MapPin, MicVocal, User, Youtube } from 'lucide-react';
import Link from 'next/link';
import { talks } from './talks';

const Talks = () => (
  <div className="mt-4 md:px-20">
    <div className="mb-8 flex w-full flex-row items-center justify-between">
      <Heading2>Charlas</Heading2>

      <Link className="block" href="https://wa.me/5493815777562">
        <Button className="flex flex-row items-center gap-2">
          Quiero dar una charla
          <MicVocal className="h-5 w-5" />
        </Button>
      </Link>
    </div>

    <div className="my-5 ml-0 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {talks
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .map((talk, index) => (
          <Card key={index} className="flex flex-col">
            {talk.portrait && (
              <div className="relative aspect-video">
                <img
                  src={talk.portrait}
                  alt={`${talk.speakerName}'s photo`}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            )}

            <CardHeader>
              <CardTitle className="text-lg">{talk.name}</CardTitle>
            </CardHeader>

            <CardContent className="flex-1">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <p className="text-sm text-muted-foreground">{talk.speakerName}</p>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <p className="text-sm text-muted-foreground">
                  {new Date(talk.date)
                    .toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })
                    .replace(/\//g, '/')}
                </p>
              </div>

              {talk.location && (
                <div className="mt-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <p className="text-sm text-muted-foreground">{talk.location}</p>
                </div>
              )}
            </CardContent>

            <CardFooter className="mt-auto justify-start">
              {talk.youtubeUrl && (
                <Link href={talk.youtubeUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="mt-2 flex w-full items-center gap-2" variant="youtube">
                    Ver en YouTube
                    <Youtube className="h-4 w-4" />
                  </Button>
                </Link>
              )}

              {talk.slides && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="mt-2 flex w-full items-center gap-2" variant="outline">
                      Ver slides
                      <FileText className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="max-w-4xl px-16">
                    <DialogHeader>
                      <DialogTitle>{talk.name}</DialogTitle>
                    </DialogHeader>

                    <Carousel>
                      <CarouselContent>
                        {talk.slides.map((slide, index) => (
                          <CarouselItem key={index}>
                            <img
                              key={index}
                              src={slide}
                              alt={`Slide ${index + 1}`}
                              className="h-auto w-full"
                            />
                          </CarouselItem>
                        ))}
                      </CarouselContent>

                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                  </DialogContent>
                </Dialog>
              )}
            </CardFooter>
          </Card>
        ))}
    </div>
  </div>
);

export default Talks;
