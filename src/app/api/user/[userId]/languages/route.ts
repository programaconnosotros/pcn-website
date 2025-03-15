import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const languages = await prisma.userLanguage.findMany({
      where: {
        userId: params.userId,
      },
    });

    return NextResponse.json(languages);
  } catch (error) {
    console.error('Error fetching user languages:', error);
    return NextResponse.json({ error: 'Error fetching user languages' }, { status: 500 });
  }
}
