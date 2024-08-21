'use client';
import { Button } from '@/components/ui/button';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { signInWithGithub } from '@/actions/sign-in-with-github';
import { LogIn } from 'lucide-react';

export const SignIn = () => {
  const [disabled, setDisabled] = useState(false);

  const handleSubmit = useCallback(async () => {
    setDisabled(true);

    toast.loading('Iniciando sesión...');

    try {
      await signInWithGithub();
    } catch (error) {
      setDisabled(false);
      toast.error('No pudimos iniciar la sesión.');
    }
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      <Button className="flex gap-2" type="submit" disabled={disabled}>
        Iniciar sesión con GitHub
        <LogIn className="mr-2 h-4 w-4" />
      </Button>
    </form>
  );
};
