import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // const sessionId = request.cookies.get('sessionId')?.value;

  // if (!sessionId) {
  //   return NextResponse.redirect(new URL('/autenticacion/iniciar-sesion', request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ['/perfil/:path*'],
};
