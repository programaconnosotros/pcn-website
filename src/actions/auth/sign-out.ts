'use server';

import { signOut as _signOut } from '@/auth';

export const signOut = async () => await _signOut({ redirectTo: '/' });
