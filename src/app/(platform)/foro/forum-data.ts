import prisma from '@/lib/prisma';
import { User } from '@prisma/client';
import { cookies } from 'next/headers';

export interface ForumData {
  totalPosts: number;
  totalUsers: number;
  categories: Array<{
    id: string;
    name: string;
    description: string;
    slug: string;
    icon: string;
    color: string;
    _count: { posts: number };
  }>;
  recentPosts: Array<{
    id: string;
    title: string;
    isPinned: boolean;
    createdAt: Date;
    author: User;
    category: {
      id: string;
      name: string;
    };
    _count: {
      comments: number;
      likes: number;
    };
  }>;
  currentUser: User | null;
}

export async function getForumData(): Promise<ForumData> {
  const sessionId = cookies().get('sessionId')?.value;

  let currentUser: User | null = null;

  if (sessionId) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (session) {
      currentUser = session.user;
    }
  }

  const [totalPosts, totalUsers, categories, recentPosts] = await Promise.all([
    prisma.post.count(),
    prisma.user.count(),
    prisma.postCategory.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.post.findMany({
      take: 5,
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      include: {
        author: true,
        category: true,
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    }),
  ]);

  return {
    totalPosts,
    totalUsers,
    categories,
    recentPosts,
    currentUser,
  };
}
