import { Heading2 } from '@/components/ui/heading-2';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const HTMLAndCSS = () => (
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
          <BreadcrumbPage>HTML & CSS</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <Heading2>HTML & CSS</Heading2>

    <div className="mt-4 w-full" style={{ aspectRatio: '16/9' }}>
      <iframe
        className="h-full w-full"
        src="https://www.youtube.com/embed/ELSm-G201Ls?si=bA1GvEDs_dcrYN-D"
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  </div>
);

export default HTMLAndCSS;
