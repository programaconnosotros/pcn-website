import prisma from '@/lib/prisma';
import { Like } from '@/generated/prisma/client';

type Content = {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    name: string;
    image: string | null;
  };
};

type Comment = Content & {
  replies: Comment[];
};

export type Advice = Content & {
  comments?: Comment[];
  likes: Like[];
};

export type GetAdviceOptions = {
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

export const getAdviceById = async (
  id: string,
  options: GetAdviceOptions = { includeComments: true },
): Promise<Advice | null> => {
  const advice = await prisma.advice.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, image: true } },
      likes: true,
    },
  });

  if (!advice) return null;

  const adviceWithLikes = {
    id: advice.id,
    content: advice.content,
    createdAt: advice.createdAt,
    author: advice.author,
    likes: advice.likes,
  };

  if (!options.includeComments) {
    return adviceWithLikes;
  }

  const comments = await prisma.comment.findMany({
    where: {
      adviceId: id,
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
    ...adviceWithLikes,
    comments: commentsWithReplies,
  };
};
