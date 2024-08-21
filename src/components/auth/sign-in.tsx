'use client';
import { Button } from '@/components/ui/button';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { signInWithGithub } from '@/actions/sign-in-with-github';

export const SignIn = () => {
  const [disabled, setDisabled] = useState(false);

  const handleSubmit = useCallback(() => {
    setDisabled(true);

    toast.promise(signInWithGithub, {
      loading: 'Iniciando sesión...',
      success: 'Sesión iniciada!',
      error: () => {
        setDisabled(false);
        return 'No pudimos iniciar la sesión.';
      },
    });
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      <Button type="submit" disabled={disabled}>
        Iniciar sesión
      </Button>
    </form>
  );
};
