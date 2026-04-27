import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request, props: { params: Promise<{ userId: string }> }) {
  const params = await props.params;
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
