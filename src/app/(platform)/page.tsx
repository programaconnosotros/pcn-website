import prisma from '@/lib/prisma';
import { Session, User } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { cookies } from 'next/headers';
import HomeClientSide from './home-client-side';

const Home = async () => {
  const sessionId = cookies().get('sessionId')?.value;

  let session: (Session & { user: User }) | null = null;

  if (sessionId) {
    session = await prisma.session.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        user: true,
      },
    });
  }

  // Leer las imágenes de la carpeta gallery-photos
  const galleryPath = path.join(process.cwd(), 'public', 'gallery-photos');
  const files = fs.readdirSync(galleryPath);

  const images = files
    .filter((file) => /\.(webp|jpg|jpeg|png|gif)$/i.test(file))
    .map((file) => `/gallery-photos/${file}`);

  return <HomeClientSide session={session} />;
};

export default Home;
