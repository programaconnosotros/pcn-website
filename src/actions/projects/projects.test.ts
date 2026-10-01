import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { createProject } from './create-project';
import { updateProject } from './update-project';
import { deleteProject } from './delete-project';
import { reorderProjects } from './reorder-projects';

const baseUser = {
  id: 'cm0000000000000000author01',
  name: 'Autora',
  email: 'autora@pcn.com',
  role: 'REGULAR' as const,
};
const adminUser = { ...baseUser, id: 'cm0000000000000000admin001', role: 'ADMIN' as const };
const otherUser = { ...baseUser, id: 'cm0000000000000000other001' };
const collaboratorId = 'cm0000000000000000collab01';

const sessionFor = (user: typeof baseUser | typeof adminUser) => ({
  id: `session-${user.id}`,
  userId: user.id,
  user,
});

const loginAs = (user: typeof baseUser | typeof adminUser) => {
  mockCookies({ sessionId: `session-${user.id}` });
  prismaMock.session.findUnique.mockResolvedValue(sessionFor(user) as any);
};

const validInput = {
  title: 'Mi proyecto',
  description: 'Un proyecto de la comunidad',
  url: 'https://github.com/pcn/proyecto',
  logoUrl: '',
  techStack: ['Next.js'],
  members: [
    { userId: collaboratorId, memberName: 'Compañero' },
    { userId: null, memberName: 'Sin cuenta' },
  ],
};

const existingProject = {
  id: 'project-1',
  title: 'Mi proyecto',
  description: 'Un proyecto de la comunidad',
  url: 'https://github.com/pcn/proyecto',
  logoUrl: '',
  techStack: [],
  order: 2,
  authorId: baseUser.id,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('createProject', () => {
  beforeEach(() => {
    prismaMock.project.aggregate.mockResolvedValue({ _max: { order: null } } as any);
  });

  it('requires a logged-in user', async () => {
    mockCookies();

    await expect(createProject(validInput)).rejects.toThrow('Debes estar autenticado');
    expect(prismaMock.project.create).not.toHaveBeenCalled();
  });

  it('lets a regular user publish a project and sets them as the author', async () => {
    loginAs(baseUser);
    prismaMock.project.aggregate.mockResolvedValue({ _max: { order: 7 } } as any);
    prismaMock.project.create.mockResolvedValue({ id: 'project-1' } as any);

    await createProject(validInput);

    const { data } = prismaMock.project.create.mock.calls[0][0];
    expect(data.authorId).toBe(baseUser.id);
    // Los proyectos nuevos van al final de la lista
    expect(data.order).toBe(8);
    expect(data.members).toEqual({
      create: [
        { userId: collaboratorId, memberName: 'Compañero', order: 0 },
        { userId: null, memberName: 'Sin cuenta', order: 1 },
      ],
    });
  });

  it('never lists the author as a collaborator and removes duplicates', async () => {
    loginAs(baseUser);
    prismaMock.project.create.mockResolvedValue({ id: 'project-1' } as any);

    await createProject({
      ...validInput,
      members: [
        { userId: baseUser.id, memberName: 'Autora' },
        { userId: collaboratorId, memberName: 'Compañero' },
        { userId: collaboratorId, memberName: 'Compañero' },
      ],
    });

    const { data } = prismaMock.project.create.mock.calls[0][0];
    expect(data.members).toEqual({
      create: [{ userId: collaboratorId, memberName: 'Compañero', order: 0 }],
    });
  });

  it('saves the GitHub repo of an open-source project', async () => {
    loginAs(baseUser);
    prismaMock.project.create.mockResolvedValue({ id: 'project-1' } as any);

    await createProject({
      ...validInput,
      isOpenSource: true,
      repoUrl: 'https://github.com/pcn/proyecto',
    });

    const { data } = prismaMock.project.create.mock.calls[0][0];
    expect(data.isOpenSource).toBe(true);
    expect(data.repoUrl).toBe('https://github.com/pcn/proyecto');
  });

  it('drops the repo of a project that is not open-source', async () => {
    loginAs(baseUser);
    prismaMock.project.create.mockResolvedValue({ id: 'project-1' } as any);

    await createProject({
      ...validInput,
      isOpenSource: false,
      repoUrl: 'https://github.com/pcn/proyecto',
    });

    const { data } = prismaMock.project.create.mock.calls[0][0];
    expect(data.isOpenSource).toBe(false);
    expect(data.repoUrl).toBeNull();
  });

  it('rejects a repo URL that is not a GitHub repository', async () => {
    loginAs(baseUser);

    await expect(
      createProject({ ...validInput, isOpenSource: true, repoUrl: 'https://gitlab.com/pcn/x' }),
    ).rejects.toThrow('repositorio de GitHub');
    await expect(
      createProject({ ...validInput, isOpenSource: true, repoUrl: 'https://github.com/pcn' }),
    ).rejects.toThrow('repositorio de GitHub');
    expect(prismaMock.project.create).not.toHaveBeenCalled();
  });

  it('puts the first project at the top', async () => {
    loginAs(adminUser);
    prismaMock.project.create.mockResolvedValue({ id: 'project-1' } as any);

    await createProject(validInput);

    const { data } = prismaMock.project.create.mock.calls[0][0];
    expect(data.order).toBe(0);
    expect(data.authorId).toBe(adminUser.id);
  });
});

describe('updateProject', () => {
  it('lets the author edit their project without changing its position', async () => {
    loginAs(baseUser);
    prismaMock.project.findUnique.mockResolvedValue(existingProject as any);
    prismaMock.$transaction.mockResolvedValue([] as any);

    await updateProject(existingProject.id, validInput);

    const { data } = prismaMock.project.update.mock.calls[0][0];
    expect(data).not.toHaveProperty('order');
    expect(data).not.toHaveProperty('authorId');
  });

  it('rejects users who are neither the author nor an admin', async () => {
    loginAs(otherUser);
    prismaMock.project.findUnique.mockResolvedValue(existingProject as any);

    await expect(updateProject(existingProject.id, validInput)).rejects.toThrow(
      'No tenés permisos',
    );
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('lets admins edit any project', async () => {
    loginAs(adminUser);
    prismaMock.project.findUnique.mockResolvedValue(existingProject as any);
    prismaMock.$transaction.mockResolvedValue([] as any);

    await updateProject(existingProject.id, validInput);

    expect(prismaMock.$transaction).toHaveBeenCalled();
  });
});

describe('deleteProject', () => {
  it('lets the author delete their project', async () => {
    loginAs(baseUser);
    prismaMock.project.findUnique.mockResolvedValue(existingProject as any);

    await deleteProject(existingProject.id);

    expect(prismaMock.project.delete).toHaveBeenCalledWith({ where: { id: existingProject.id } });
  });

  it('rejects users who are neither the author nor an admin', async () => {
    loginAs(otherUser);
    prismaMock.project.findUnique.mockResolvedValue(existingProject as any);

    await expect(deleteProject(existingProject.id)).rejects.toThrow('No tenés permisos');
    expect(prismaMock.project.delete).not.toHaveBeenCalled();
  });

  it('does not let regular users delete legacy projects without an author', async () => {
    loginAs(baseUser);
    prismaMock.project.findUnique.mockResolvedValue({ ...existingProject, authorId: null } as any);

    await expect(deleteProject(existingProject.id)).rejects.toThrow('No tenés permisos');
  });
});

describe('reorderProjects', () => {
  it('only lets admins reorder the list', async () => {
    loginAs(baseUser);

    await expect(reorderProjects(['project-1', 'project-2'])).rejects.toThrow('Solo los admins');
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('saves each project at its position in the list', async () => {
    loginAs(adminUser);
    prismaMock.project.findMany.mockResolvedValue([
      { id: 'project-1' },
      { id: 'project-2' },
    ] as any);
    prismaMock.$transaction.mockResolvedValue([] as any);

    await reorderProjects(['project-2', 'project-1']);

    expect(prismaMock.project.update.mock.calls.map(([args]) => args)).toEqual([
      { where: { id: 'project-2' }, data: { order: 0 } },
      { where: { id: 'project-1' }, data: { order: 1 } },
    ]);
  });

  it('rejects a list that no longer matches the projects', async () => {
    loginAs(adminUser);
    prismaMock.project.findMany.mockResolvedValue([
      { id: 'project-1' },
      { id: 'project-2' },
    ] as any);

    await expect(reorderProjects(['project-1'])).rejects.toThrow('La lista cambió');
    await expect(reorderProjects(['project-1', 'project-1'])).rejects.toThrow('Orden inválido');
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
});
