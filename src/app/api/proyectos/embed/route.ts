import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { EMBED_CACHE_HEADERS, isEmbeddable } from '@/lib/embeddable';

export const runtime = 'nodejs';

/** Tells the projects page whether a project's site can be shown in an iframe. */
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  // The URL comes from the project in the database, never from the request, and isEmbeddable
  // refuses private addresses since any member can publish a project.
  const project = await prisma.project.findUnique({ where: { id }, select: { url: true } });
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json(
    { embeddable: await isEmbeddable(project.url) },
    { headers: EMBED_CACHE_HEADERS },
  );
}
