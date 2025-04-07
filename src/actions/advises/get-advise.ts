import prisma from '@/lib/prisma';

type Content = {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    email: string;
    name: string;
    image: string | null;
  };
};

type Comment = Content & {
  replies: Comment[];
};

export type Advise = Content & {
  comments?: Comment[];
};

export type GetAdviseOptions = {
  includeComments?: boolean;
};

const getReplies = async (commentId: string): Promise<Comment[]> => {
  const replies = await prisma.comment.findMany({
    where: {
      parentCommentId: commentId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  const repliesWithNestedReplies = await Promise.all(
    replies.map(async (reply) => ({
      id: reply.id,
      content: reply.content,
      createdAt: reply.createdAt,
      author: reply.author,
      replies: await getReplies(reply.id),
    })),
  );

  return repliesWithNestedReplies;
};

export const getAdviseById = async (
  id: string,
  options: GetAdviseOptions = { includeComments: true },
): Promise<Advise | null> => {
  const advise = await prisma.advise.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  if (!advise) return null;

  if (!options.includeComments) {
    return advise;
  }

  const comments = await prisma.comment.findMany({
    where: {
      adviseId: id,
      parentCommentId: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  const commentsWithReplies = await Promise.all(
    comments.map(async (comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      author: comment.author,
      replies: await getReplies(comment.id),
    })),
  );

  return {
    ...advise,
    comments: commentsWithReplies,
  };
};
