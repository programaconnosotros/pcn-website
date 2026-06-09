'use server';
import prisma from '@/lib/prisma';

export type UserWithoutPassword = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  phoneNumber: string | null;
  role: 'REGULAR' | 'ADMIN';
  image: string | null;
  countryOfOrigin: string | null;
  province: string | null;
  xAccountUrl: string | null;
  linkedinUrl: string | null;
  gitHubUrl: string | null;
  slogan: string | null;
  jobTitle: string | null;
  enterprise: string | null;
  career: string | null;
  studyPlace: string | null;
  createdAt: Date;
  updatedAt: Date;
  languages: {
    language: string;
    color: string;
    logo: string;
  }[];
};

export const getUsers = async (): Promise<UserWithoutPassword[]> => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      phoneNumber: true,
      role: true,
      image: true,
      countryOfOrigin: true,
      province: true,
      xAccountUrl: true,
      linkedinUrl: true,
      gitHubUrl: true,
      slogan: true,
      jobTitle: true,
      enterprise: true,
      career: true,
      studyPlace: true,
      createdAt: true,
      updatedAt: true,
      languages: {
        select: {
          language: true,
          color: true,
          logo: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return users;
};
