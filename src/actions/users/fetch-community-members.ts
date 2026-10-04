'use server';

import prisma from '@/lib/prisma';
import { cached } from '@/lib/cache';

// Public directory of the community: only what a public profile already shows, never contact
// data. Counts drive the "dieron charlas", "organizaron eventos" and "construyeron proyectos" lists.
export const fetchCommunityMembers = async () => listCommunityMembers();

const listCommunityMembers = cached(
  'community-members',
  async () => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        jobTitle: true,
        enterprise: true,
        positions: { select: { jobTitle: true, enterprise: true }, orderBy: { order: 'asc' } },
        slogan: true,
        career: true,
        studyPlace: true,
        isCofounder: true,
        isAmbassador: true,
        createdAt: true,
        authoredProjects: { select: { id: true } },
        projectMemberships: { select: { projectId: true } },
        _count: {
          select: {
            speakerTalks: true,
            organizedEvents: { where: { event: { deletedAt: null } } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return users.map(({ authoredProjects, projectMemberships, _count, ...user }) => ({
      ...user,
      talks: _count.speakerTalks,
      events: _count.organizedEvents,
      projects: new Set([
        ...authoredProjects.map(({ id }) => id),
        ...projectMemberships.map(({ projectId }) => projectId),
      ]).size,
    }));
  },
  {
    models: [
      'User',
      'UserPosition',
      'Project',
      'ProjectMember',
      'TalkSpeaker',
      'EventOrganizer',
      'Event',
    ],
  },
);

export type CommunityMember = Awaited<ReturnType<typeof listCommunityMembers>>[number];
