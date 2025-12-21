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
import { Button } from '@/components/ui/button';
import { BookOpen, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Lectura - PCN',
  description: 'Recursos de lectura recomendados.',
};

const ReadingPage = () => {
  return (
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
                <BreadcrumbPage>Lectura</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4">
          <div className="mb-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Heading2 className="m-0">Lectura</Heading2>
          </div>

          <div className="mb-6 rounded-lg border bg-gradient-to-r from-primary/10 to-primary/5 p-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-semibold">Club de Lectura PCN</h3>
                <p className="mb-4 text-muted-foreground">
                  En PCN tenemos un club de lectura donde compartimos y discutimos libros sobre
                  programación, tecnología y desarrollo profesional. ¡Sumate al grupo de WhatsApp
                  y participá de nuestras lecturas!
                </p>
                <div>
                  <Link
                    href="https://chat.whatsapp.com/FX1o4keOhJbFgB8mS1Sxem"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                      <MessageCircle className="h-4 w-4" />
                      Unirme al grupo
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-lg text-muted-foreground">Esta página está en construcción.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReadingPage;

