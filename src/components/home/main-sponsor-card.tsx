'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { HandHeart } from 'lucide-react';

export const MainSponsorCard = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sponsors</CardTitle>

        <CardDescription>
          Estamos en búsqueda de sponsors que quieran apoyar a nuestra comunidad. Necesitamos el
          dinero para mantener la infraestructura de este sitio web y para organizar nuestras
          actividades. Si te gustaría que tu logo esté aquí y en nuestros eventos, clickeá el botón
          de acá abajo!
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col">
        <Button
          className="mt-4 flex flex-row items-center gap-2"
          onClick={() => setIsDialogOpen(true)}
        >
          Quiero ser sponsor
          <HandHeart className="h-4 w-4" />
        </Button>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gracias por querer ser sponsor!</DialogTitle>
            <DialogDescription>Dejanos tus datos y nos comunicaremos con vos</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
