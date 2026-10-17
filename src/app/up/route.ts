import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// kamal-proxy asks this before sending traffic to a new container (config/deploy.yml uses its
// default path, /up). Answering OK without the database let a deploy with a wrong DATABASE_URL, or
// a Postgres that's down, go live and fail on every page; now the old container keeps serving.

export const dynamic = 'force-dynamic';

/** Longer than this and the database counts as down: the proxy retries anyway. */
const DATABASE_TIMEOUT_MS = 3000;

const pingDatabase = async () => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_resolve, reject) => {
        timer = setTimeout(() => reject(new Error('timeout')), DATABASE_TIMEOUT_MS);
      }),
    ]);
  } finally {
    // Si la base contesta antes, el timer no queda vivo 3 segundos por cada chequeo
    clearTimeout(timer);
  }
};

export async function GET() {
  try {
    await pingDatabase();
    return NextResponse.json({ status: 'OK', database: 'OK' }, { status: 200 });
  } catch (error) {
    console.error('Health check: database unreachable', error);
    return NextResponse.json({ status: 'ERROR', database: 'DOWN' }, { status: 503 });
  }
}
