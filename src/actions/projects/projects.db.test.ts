import prisma from '@/lib/prisma';
import { createProject } from '@/actions/projects/create-project';
import { updateProject } from '@/actions/projects/update-project';
import { deleteProject } from '@/actions/projects/delete-project';
import { leaveProject } from '@/actions/projects/leave-project';
import { reorderProjects } from '@/actions/projects/reorder-projects';
import { fetchPublicProjects } from '@/actions/projects/fetch-public-projects';
import type { ProjectFormData } from '@/schemas/project-schema';
import { actAs } from '@/test/db/fixtures';
import { expiredModel, quickUser, uid } from '@/test/db/actions-fixtures';

// Proyectos contra Postgres real: autoría, equipo, permisos de autor/colaborador/admin, orden y
// borrado en cascada.

const projectData = (overrides: Partial<ProjectFormData> = {}): ProjectFormData => ({
  title: `Proyecto ${uid()}`,
  description: 'Una descripción suficientemente larga',
  url: 'https://example.com',
  logoUrl: '',
  techStack: ['Next.js', 'Postgres'],
  isOpenSource: true,
  repoUrl: 'https://github.com/pcn/proyecto',
  startYear: 2022,
  endYear: '',
  authorRole: 'Tech lead',
  members: [],
  ...overrides,
});

const membersOf = (projectId: string) =>
  prisma.projectMember.findMany({ where: { projectId }, orderBy: { order: 'asc' } });

/** Un proyecto de `author` con `collaborator` en el equipo, creado por la action. */
const teamProject = async () => {
  const author = await quickUser();
  const collaborator = await quickUser();
  await actAs(author.id);
  const { projectId } = await createProject(
    projectData({
      members: [
        { userId: collaborator.id, memberName: collaborator.name, role: 'Frontend' },
        { userId: null, memberName: 'Invitada sin cuenta', role: '' },
      ],
    }),
  );
  return { author, collaborator, projectId };
};

describe('createProject', () => {
  it('stores the project with the session user as author, last in order, with its team', async () => {
    const author = await quickUser();
    const mate = await quickUser();
    const { _max } = await prisma.project.aggregate({ _max: { order: true } });
    await actAs(author.id);

    const result = await createProject(
      projectData({
        title: 'Mi proyecto',
        members: [
          // El autor y los duplicados se descartan
          { userId: author.id, memberName: author.name, role: 'Yo' },
          { userId: mate.id, memberName: mate.name, role: ' Backend ' },
          { userId: mate.id, memberName: mate.name, role: 'Duplicado' },
          { userId: null, memberName: 'Sin cuenta', role: '' },
        ],
      }),
    );

    expect(result.success).toBe(true);
    const project = await prisma.project.findUniqueOrThrow({ where: { id: result.projectId } });
    expect(project).toMatchObject({
      title: 'Mi proyecto',
      authorId: author.id,
      authorRole: 'Tech lead',
      logoUrl: '',
      repoUrl: 'https://github.com/pcn/proyecto',
      startYear: 2022,
      endYear: null,
      techStack: ['Next.js', 'Postgres'],
      order: (_max.order ?? -1) + 1,
    });
    expect(
      (await membersOf(project.id)).map(({ userId, memberName, role, order }) => ({
        userId,
        memberName,
        role,
        order,
      })),
    ).toEqual([
      { userId: mate.id, memberName: mate.name, role: 'Backend', order: 0 },
      { userId: null, memberName: 'Sin cuenta', role: null, order: 1 },
    ]);
    expect(expiredModel('Project')).toBe(true);
    expect(expiredModel('ProjectMember')).toBe(true);
  });

  it('drops the repo URL of a project that is not open source', async () => {
    const author = await quickUser();
    await actAs(author.id);

    const { projectId } = await createProject(projectData({ isOpenSource: false }));

    expect(
      (await prisma.project.findUniqueOrThrow({ where: { id: projectId } })).repoUrl,
    ).toBeNull();
  });

  it('ignores an authorId sent by the client', async () => {
    const author = await quickUser();
    const victim = await quickUser();
    await actAs(author.id);

    const { projectId } = await createProject({
      ...projectData(),
      authorId: victim.id,
    } as unknown as ProjectFormData);

    expect((await prisma.project.findUniqueOrThrow({ where: { id: projectId } })).authorId).toBe(
      author.id,
    );
  });

  it.each([
    ['a short title', { title: 'ab' }],
    ['a non-GitHub repo', { repoUrl: 'https://gitlab.com/a/b' }],
    ['an end year before the start', { startYear: 2022, endYear: 2020 }],
    ['an invalid member id', { members: [{ userId: 'no-es-cuid!', memberName: 'Ana' }] }],
  ])('rejects %s without creating anything', async (_case, override) => {
    const author = await quickUser();
    await actAs(author.id);

    await expect(
      createProject(projectData(override as Partial<ProjectFormData>)),
    ).rejects.toThrow();
    expect(await prisma.project.count({ where: { authorId: author.id } })).toBe(0);
  });

  it('rejects anonymous visitors', async () => {
    await actAs();
    const title = `Anónimo ${uid()}`;

    await expect(createProject(projectData({ title }))).rejects.toThrow('Debes estar autenticado');
    expect(await prisma.project.count({ where: { title } })).toBe(0);
  });

  it('fails when a member is a user that does not exist, without a half-created project', async () => {
    const author = await quickUser();
    await actAs(author.id);

    await expect(
      createProject(
        projectData({
          members: [{ userId: 'cjld2cjxh0000qzrmn831i7rn', memberName: 'Fantasma' }],
        }),
      ),
    ).rejects.toThrow();
    expect(await prisma.project.count({ where: { authorId: author.id } })).toBe(0);
  });
});

describe('updateProject', () => {
  it('lets the author change everything, including the team', async () => {
    const { author, collaborator, projectId } = await teamProject();
    const newcomer = await quickUser();
    await actAs(author.id);

    await updateProject(
      projectId,
      projectData({
        title: 'Título nuevo',
        authorRole: 'Fundadora',
        isOpenSource: false,
        members: [{ userId: newcomer.id, memberName: newcomer.name, role: 'QA' }],
      }),
    );

    const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
    expect(project).toMatchObject({
      title: 'Título nuevo',
      authorRole: 'Fundadora',
      repoUrl: null,
      authorId: author.id,
    });
    const members = await membersOf(projectId);
    expect(members.map((member) => member.userId)).toEqual([newcomer.id]);
    expect(members.some((member) => member.userId === collaborator.id)).toBe(false);
  });

  it('keeps the logo when none is sent', async () => {
    const { author, projectId } = await teamProject();
    await prisma.project.update({
      where: { id: projectId },
      data: { logoUrl: 'https://cdn.example.com/logo.png' },
    });
    await actAs(author.id);

    await updateProject(projectId, projectData({ logoUrl: '' }));

    expect((await prisma.project.findUniqueOrThrow({ where: { id: projectId } })).logoUrl).toBe(
      'https://cdn.example.com/logo.png',
    );
  });

  it('lets a collaborator edit the basic info but not the team or the author role', async () => {
    const { collaborator, projectId } = await teamProject();
    const intruder = await quickUser();
    await actAs(collaborator.id);

    await updateProject(
      projectId,
      projectData({
        title: 'Editado por colaborador',
        authorRole: 'Rol cambiado',
        members: [{ userId: intruder.id, memberName: intruder.name }],
      }),
    );

    const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
    expect(project.title).toBe('Editado por colaborador');
    expect(project.authorRole).toBe('Tech lead');
    expect((await membersOf(projectId)).map((member) => member.memberName)).toEqual([
      collaborator.name,
      'Invitada sin cuenta',
    ]);
  });

  it('lets an admin manage the team, keeping the original author out of it', async () => {
    const { author, projectId } = await teamProject();
    const admin = await quickUser({ role: 'ADMIN' });
    await actAs(admin.id);

    await updateProject(
      projectId,
      projectData({
        members: [
          { userId: author.id, memberName: author.name },
          { userId: admin.id, memberName: admin.name },
        ],
      }),
    );

    expect((await prisma.project.findUniqueOrThrow({ where: { id: projectId } })).authorId).toBe(
      author.id,
    );
    expect((await membersOf(projectId)).map((member) => member.userId)).toEqual([admin.id]);
  });

  it('forbids someone outside the team', async () => {
    const { projectId } = await teamProject();
    const outsider = await quickUser();
    await actAs(outsider.id);

    await expect(updateProject(projectId, projectData({ title: 'Hackeado' }))).rejects.toThrow(
      'No tenés permisos para realizar esta acción',
    );
    expect((await prisma.project.findUniqueOrThrow({ where: { id: projectId } })).title).not.toBe(
      'Hackeado',
    );
    expect(await membersOf(projectId)).toHaveLength(2);
  });

  it('rolls the whole team update back when a member cannot be stored', async () => {
    const { author, collaborator, projectId } = await teamProject();
    const before = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
    await actAs(author.id);

    await expect(
      updateProject(
        projectId,
        projectData({
          title: 'No debería quedar',
          members: [{ userId: 'cjld2cjxh0000qzrmn831i7rn', memberName: 'Fantasma' }],
        }),
      ),
    ).rejects.toThrow();

    expect((await prisma.project.findUniqueOrThrow({ where: { id: projectId } })).title).toBe(
      before.title,
    );
    expect((await membersOf(projectId)).map((member) => member.userId)).toEqual([
      collaborator.id,
      null,
    ]);
  });

  it('fails for a project that does not exist and for anonymous visitors', async () => {
    const user = await quickUser();
    await actAs(user.id);
    await expect(updateProject('no-existe', projectData())).rejects.toThrow(
      'Proyecto no encontrado',
    );

    const { projectId } = await teamProject();
    await actAs();
    await expect(updateProject(projectId, projectData())).rejects.toThrow(
      'Debes estar autenticado',
    );
  });
});

describe('deleteProject', () => {
  it('lets the author delete it, cascading its members but not the users', async () => {
    const { author, collaborator, projectId } = await teamProject();
    await actAs(author.id);

    await expect(deleteProject(projectId)).resolves.toEqual({ success: true });

    expect(await prisma.project.findUnique({ where: { id: projectId } })).toBeNull();
    expect(await prisma.projectMember.count({ where: { projectId } })).toBe(0);
    expect(await prisma.user.findUnique({ where: { id: collaborator.id } })).not.toBeNull();
  });

  it('lets an admin delete any project', async () => {
    const { projectId } = await teamProject();
    const admin = await quickUser({ role: 'ADMIN' });
    await actAs(admin.id);

    await deleteProject(projectId);

    expect(await prisma.project.findUnique({ where: { id: projectId } })).toBeNull();
  });

  it('forbids a collaborator and an outsider', async () => {
    const { collaborator, projectId } = await teamProject();
    const outsider = await quickUser();

    for (const user of [collaborator, outsider]) {
      await actAs(user.id);
      await expect(deleteProject(projectId)).rejects.toThrow(
        'No tenés permisos para realizar esta acción',
      );
    }
    expect(await prisma.project.findUnique({ where: { id: projectId } })).not.toBeNull();
  });

  it('fails for a project that does not exist', async () => {
    const user = await quickUser();
    await actAs(user.id);

    await expect(deleteProject('no-existe')).rejects.toThrow('Proyecto no encontrado');
  });
});

describe('leaveProject', () => {
  it('removes only the collaborator’s own membership', async () => {
    const { collaborator, projectId } = await teamProject();
    await actAs(collaborator.id);

    await expect(leaveProject(projectId)).resolves.toEqual({ success: true });

    expect((await membersOf(projectId)).map((member) => member.memberName)).toEqual([
      'Invitada sin cuenta',
    ]);
  });

  it('refuses someone who is not on the team, including the author', async () => {
    const { author, projectId } = await teamProject();
    const outsider = await quickUser();

    for (const user of [author, outsider]) {
      await actAs(user.id);
      await expect(leaveProject(projectId)).rejects.toThrow(
        'No formás parte del equipo de este proyecto',
      );
    }
    expect(await membersOf(projectId)).toHaveLength(2);
  });
});

describe('reorderProjects', () => {
  const allIds = async () =>
    (await prisma.project.findMany({ select: { id: true }, orderBy: { order: 'asc' } })).map(
      (project) => project.id,
    );

  it('lets an admin save the full order', async () => {
    await teamProject();
    await teamProject();
    const admin = await quickUser({ role: 'ADMIN' });
    await actAs(admin.id);
    const reversed = (await allIds()).reverse();

    await expect(reorderProjects(reversed)).resolves.toEqual({ success: true });

    const stored = await prisma.project.findMany({ select: { id: true, order: true } });
    const orderById = new Map(stored.map((project) => [project.id, project.order]));
    expect(reversed.map((id) => orderById.get(id))).toEqual(reversed.map((_, index) => index));

    // La lista pública sigue ese orden
    expect((await fetchPublicProjects()).map((project) => project.id)).toEqual(reversed);
  });

  it('refuses a stale or partial list without changing the order', async () => {
    await teamProject();
    const admin = await quickUser({ role: 'ADMIN' });
    await actAs(admin.id);
    const ids = await allIds();
    const before = await prisma.project.findMany({ select: { id: true, order: true } });

    await expect(reorderProjects(ids.slice(1))).rejects.toThrow('La lista cambió');
    await expect(reorderProjects([...ids.slice(1), 'no-existe'])).rejects.toThrow(
      'La lista cambió',
    );
    await expect(reorderProjects([ids[0], ...ids])).rejects.toThrow('Orden inválido');

    expect(await prisma.project.findMany({ select: { id: true, order: true } })).toEqual(
      expect.arrayContaining(before),
    );
  });

  it('forbids non-admins', async () => {
    const { author } = await teamProject();
    await actAs(author.id);

    await expect(reorderProjects(await allIds())).rejects.toThrow(
      'Solo los admins pueden ordenar los proyectos',
    );
  });
});

describe('fetchPublicProjects', () => {
  it('includes the public author and team, ordered, without contact data', async () => {
    const { author, collaborator, projectId } = await teamProject();

    const project = (await fetchPublicProjects()).find((p) => p.id === projectId);

    expect(project?.author).toEqual({ id: author.id, name: author.name, image: null });
    expect(project?.members.map((member) => member.user)).toEqual([
      { id: collaborator.id, name: collaborator.name, image: null },
      null,
    ]);
    expect(project?.createdAt).toBeInstanceOf(Date);
  });
});
