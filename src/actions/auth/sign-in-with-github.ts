'use server';

import { signIn } from '@/auth';

export const signInWithGithub = async () => await signIn('github', { redirectTo: '/home' });
