import { Card } from '@/components/ui/card';
import { Heading2 } from '@/components/ui/heading-2';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const JavaScript = () => (
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
          <BreadcrumbPage>JavaScript</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <Heading2>JavaScript</Heading2>

    <div className="mt-4 w-full" style={{ aspectRatio: '16/9' }}>
      <Card className="mb-8 h-full w-full p-8">
        <iframe
          className="h-full w-full"
          src="https://www.youtube.com/embed/z95mZVUcJ-E?si=IQ2RwTRAe2cLp754"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </Card>

      <Card className="mb-8 h-full w-full p-8">
        <iframe
          className="h-full w-full"
          src="https://www.youtube.com/embed/xOinGb2MZSk?si=5CL18bgx-m8mURCf"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </Card>

      <Card className="mb-8 h-full w-full p-8">
        <iframe
          className="h-full w-full"
          src="https://www.youtube.com/embed/EbMi1Qj4rVE?si=VZP36Vkh_qIW1kRt"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </Card>
    </div>
  </div>
);

export default JavaScript;
