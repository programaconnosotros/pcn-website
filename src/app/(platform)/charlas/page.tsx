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
import { Calendar, FileText, MapPin, MicVocal, User, Youtube } from 'lucide-react';
import Link from 'next/link';
import { talks } from './talks';

const Talks = () => (
  <>
    <header className="flex h-16 shrink-0 items-center gap-2">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/home">Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Charlas</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="mt-4">
        <div className="mb-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex w-full flex-row items-center justify-between">
            <Heading2 className="m-0">Charlas</Heading2>

            <Link className="block" href="https://wa.me/5493815777562">
              <Button className="flex flex-row items-center gap-2">
                Quiero dar una charla
                <MicVocal className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="my-5 ml-0 grid grid-cols-1 gap-5 xl:grid-cols-2">
          {talks
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .map((talk, index) => (
              <Card key={index} className="flex flex-col overflow-hidden md:flex-row transition-all duration-300 hover:scale-105 hover:shadow-xl dark:hover:shadow-pcnGreen/20 border-2 border-transparent hover:border-pcnPurple dark:hover:border-pcnGreen bg-gradient-to-br from-white to-gray-50 dark:from-neutral-900 dark:to-neutral-800 dark:border-neutral-800">
                {talk.portrait && (
                  <div className="relative h-48 w-full shrink-0 md:h-auto md:w-64">
                    <img
                      src={talk.portrait}
                      alt={`${talk.speakerName}'s photo`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <div className="flex flex-1 flex-col">
                  <CardHeader>
                    <CardTitle className="text-lg">{talk.name}</CardTitle>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-pcnPurple dark:text-pcnGreen" />
                      <p className="text-sm text-muted-foreground">{talk.speakerName}</p>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-pcnPurple dark:text-pcnGreen" />
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
                        <MapPin className="h-4 w-4 text-pcnPurple dark:text-pcnGreen" />
                        <p className="text-sm text-muted-foreground">{talk.location}</p>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="mt-auto flex flex-col items-start gap-2">
                    {talk.youtubeUrl && (
                      <Link href={talk.youtubeUrl} target="_blank" rel="noopener noreferrer">
                        <Button className="flex items-center gap-2" variant="youtube">
                          Ver en YouTube
                          <Youtube className="h-4 w-4 text-pcnPurple dark:text-pcnGreen" />
                        </Button>
                      </Link>
                    )}

                    {talk.slides && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="flex items-center gap-2" variant="outline">
                            Ver slides
                            <FileText className="h-4 w-4 text-pcnPurple dark:text-pcnGreen" />
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
                </div>
              </Card>
            ))}
        </div>
      </div>
    </div>
  </>
);

export default Talks;
