'use client';

import { Button } from '@/components/ui/button';
import { cancelRegistration } from '@/actions/events/cancel-registration';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type CancelRegistrationButtonProps = {
  eventId: string;
  registrationId?: string;
  isLoggedIn: boolean;
};

export function CancelRegistrationButton({
  eventId,
  registrationId,
  isLoggedIn,
}: CancelRegistrationButtonProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    if (!isLoggedIn && !email.trim()) {
      toast.error('Por favor ingresa tu correo electrónico');
      return;
    }

    setIsLoading(true);
    try {
      await toast.promise(
        cancelRegistration({
          registrationId: isLoggedIn ? registrationId : undefined,
          eventId,
          email: isLoggedIn ? undefined : email.trim(),
        }),
        {
          loading: 'Cancelando inscripción...',
          success: 'Inscripción cancelada exitosamente',
          error: (error) => {
            console.error('Error al cancelar inscripción', error);
            return error.message || 'Ocurrió un error al cancelar la inscripción';
          },
        },
      );
      setOpen(false);
      setEmail('');
      router.refresh();
    } catch (error) {
      // El error ya se maneja en toast.promise
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoggedIn) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={handleCancel}
        disabled={isLoading}
      >
        <X className="mr-2 h-4 w-4" />
        Cancelar inscripción
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <X className="mr-2 h-4 w-4" />
          Cancelar inscripción
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar inscripción</DialogTitle>
          <DialogDescription>
            Para cancelar tu inscripción, por favor ingresa el correo electrónico con el que te
            inscribiste.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && email.trim()) {
                  handleCancel();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Cerrar
          </Button>
          <Button onClick={handleCancel} disabled={isLoading || !email.trim()}>
            Cancelar inscripción
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
