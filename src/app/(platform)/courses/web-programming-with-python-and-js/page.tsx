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

const WebProgrammingWithPythonAndJavaScript = () => {
  const videoSources = [
    'https://www.youtube.com/embed/EOZDjqwvVG8?si=XiK7kgqIgmhl1tHc',
    'https://www.youtube.com/embed/1u2qu-EmIRc?si=EJbkFAbSaUCa5aQ2',
    'https://www.youtube.com/embed/XQs5KcUj-Do?si=Y8wf9nKEQoCTTRIX',
    'https://www.youtube.com/embed/j5wysXqaIV8?si=bF36BJdeDxmoy1Jq',
    'https://www.youtube.com/embed/Eda-NmcE5mQ?si=__0xIv2cARYK5Q4V',
    'https://www.youtube.com/embed/24Kf3v7kZyE?si=aUwVLbn4FVF5p5aw',
    'https://www.youtube.com/embed/xMs4ER1rcLg?si=IBbTdO9QEfvF5Zeo',
    'https://www.youtube.com/embed/ZRV7JCXAFTs?si=fICWtDWWWJ0rl_ZL',
    'https://www.youtube.com/embed/ZjAMRnCu-84?si=sLxZIEEUSTI-_u8q',
    'https://www.youtube.com/embed/alMRNeRJKUE?si=ZtvDhk1UPeultej4',
    'https://www.youtube.com/embed/2A7nVdAoqqk?si=phCZIsdMKsak4lxO',
    'https://www.youtube.com/embed/9dLTFp-1w_A?si=YUy9SKs7RPa0AOKv',
  ];

  return (
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
            <BreadcrumbPage>Desarrollo web con Python y JavaScript</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Heading2>Desarrollo web con Python y JavaScript</Heading2>

      <div className="mt-4 w-full" style={{ aspectRatio: '16/9' }}>
        {videoSources.map((src, index) => (
          <Card key={index} className="mb-8 h-full w-full p-8">
            <iframe
              className="h-full w-full"
              src={src}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WebProgrammingWithPythonAndJavaScript;
