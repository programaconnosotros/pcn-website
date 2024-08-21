'use server';

import { signIn } from '@/auth';

export const signInWithGithub = () => signIn('github', { redirectTo: '/feed' });
