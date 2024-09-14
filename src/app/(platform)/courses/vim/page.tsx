import { Heading2 } from '@/components/ui/heading-2';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

// TODO: Agregar botón para donar al profesor del curso.

const classes = [
  'https://www.youtube.com/embed/C-C4xoCj_Lw?si=ik0XqUGkz4Xw7hZ4',
  'https://www.youtube.com/embed/0s1ccWvLGYw?si=ph1rPlNvBoobmbG8',
  'https://www.youtube.com/embed/9VIma5G-gUc?si=dHyZoKRqvc3Vpi0S',
  'https://www.youtube.com/embed/WVzklaR68PM?si=1b4QIepxrw44Tw45',
];

const VimCourse = () => (
  <div className="mt-4 md:px-20">
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/home">Inicio</BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        <BreadcrumbItem>
          <BreadcrumbLink href="/courses">Cursos</BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        <BreadcrumbItem>
          <BreadcrumbPage>Vim</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <Heading2>Vim</Heading2>

    <div className="mt-12 pr-20">
      <Carousel>
        <CarouselContent>
          {classes.map((classUrl) => (
            <CarouselItem key={classUrl}>
              <div className="w-full" style={{ aspectRatio: '16/9' }}>
                <iframe
                  className="h-full w-full"
                  src={classUrl}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  </div>
);

export default VimCourse;
