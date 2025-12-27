'use server';
import prisma from '@/lib/prisma';

type UserWithoutPassword = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  image: string | null;
  languages: {
    language: string;
    color: string;
    logo: string;
  }[];
  linkedinUrl: string | null;
  xAccountUrl: string | null;
  gitHubUrl: string | null;
  countryOfOrigin: string | null;
  slogan: string | null;
  jobTitle: string | null;
  enterprise: string | null;
  career: string | null;
  studyPlace: string | null;
};

export const getUsers = async (): Promise<UserWithoutPassword[]> => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      image: true,
      languages: {
        select: {
          language: true,
          color: true,
          logo: true,
        },
      },
      xAccountUrl: true,
      linkedinUrl: true,
      gitHubUrl: true,
      countryOfOrigin: true,
      slogan: true,
      jobTitle: true,
      enterprise: true,
      career: true,
      studyPlace: true,
    },
  });

  return users;
};
