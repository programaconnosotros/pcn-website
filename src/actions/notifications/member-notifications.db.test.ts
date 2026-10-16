import prisma from '@/lib/prisma';
import { awardBadge, createBadge } from '@/actions/badges/badge-actions';
import { createProject } from '@/actions/projects/create-project';
import { updateProject } from '@/actions/projects/update-project';
import { toggleFeatured } from '@/actions/testimonials/toggle-featured';
import type { ProjectFormData } from '@/schemas/project-schema';
import { actAs } from '@/test/db/fixtures';
import { quickUser, uid } from '@/test/db/actions-fixtures';

// What members hear about against a real Postgres: a badge, a spot on a project's team and a
// featured testimonial each notify the person once.

const inbox = (userId: string, type: string) =>
  prisma.notification.findMany({ where: { userId, type } });

const projectData = (members: ProjectFormData['members']): ProjectFormData => ({
  title: `Proyecto ${uid()}`,
  description: 'Una descripción suficientemente larga',
  url: 'https://example.com',
  logoUrl: '',
  techStack: ['Next.js'],
  isOpenSource: false,
  repoUrl: '',
  startYear: 2024,
  endYear: '',
  authorRole: 'Tech lead',
  members,
});

it('tells a member about a badge the first time they get it', async () => {
  const [admin, member] = [await quickUser({ role: 'ADMIN' }), await quickUser()];
  await actAs(admin.id);
  const badge = await createBadge({
    name: `Mentor ${uid().slice(0, 4)}`,
    description: 'Ayudó a muchas personas',
    icon: 'award',
    tone: 'green',
  });

  await awardBadge(member.id, badge.id);
  await awardBadge(member.id, badge.id);

  const [notification] = await inbox(member.id, 'badge_awarded');
  expect(await inbox(member.id, 'badge_awarded')).toHaveLength(1);
  expect(notification.message).toContain(badge.name);
  expect(JSON.parse(notification.metadata!)).toMatchObject({ href: `/perfil/${member.id}` });
});

it('tells the people added to a project, once, and not the author', async () => {
  const [author, first, second] = [await quickUser(), await quickUser(), await quickUser()];
  await actAs(author.id);
  const { projectId } = await createProject(
    projectData([
      { userId: first.id, memberName: first.name, role: '' },
      { userId: null, memberName: 'Sin cuenta', role: '' },
    ]),
  );
  expect(await inbox(first.id, 'project_member_added')).toHaveLength(1);
  expect(await inbox(author.id, 'project_member_added')).toHaveLength(0);

  // Editing the team only tells whoever is new on it.
  await updateProject(
    projectId,
    projectData([
      { userId: first.id, memberName: first.name, role: '' },
      { userId: second.id, memberName: second.name, role: '' },
    ]),
  );
  expect(await inbox(first.id, 'project_member_added')).toHaveLength(1);
  const [added] = await inbox(second.id, 'project_member_added');
  expect(JSON.parse(added.metadata!)).toMatchObject({ href: `/proyectos/${projectId}` });
});

it('tells the author when their testimonial gets featured, not when it is unfeatured', async () => {
  const [admin, author] = [await quickUser({ role: 'ADMIN' }), await quickUser()];
  const testimonial = await prisma.testimonial.create({
    data: { userId: author.id, body: 'La comunidad me ayudó a conseguir mi primer trabajo.' },
  });
  await actAs(admin.id);

  await toggleFeatured(testimonial.id);
  await toggleFeatured(testimonial.id);

  const notifications = await inbox(author.id, 'testimonial_featured');
  expect(notifications).toHaveLength(1);
  expect(JSON.parse(notifications[0].metadata!)).toMatchObject({
    href: `/testimonios/${testimonial.id}`,
  });
});
