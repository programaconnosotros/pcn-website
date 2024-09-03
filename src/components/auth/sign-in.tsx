'use client';
import { Button } from '@/components/ui/button';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { signInWithGithub } from '@/actions/auth/sign-in-with-github';
import { Github } from 'lucide-react';

export const SignIn = () => {
  const [disabled, setDisabled] = useState(false);

  const handleSubmit = useCallback(async () => {
    setDisabled(true);

    toast.loading('Ingresando...');

    try {
      await signInWithGithub();
    } catch (error) {
      setDisabled(false);
      toast.error('No pudimos iniciar la sesión.');
    }
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      <Button className="flex items-center justify-between gap-2" type="submit" disabled={disabled}>
        Autenticarme con GitHub
        <Github className="h-4 w-4" />
      </Button>
    </form>
  );
};
