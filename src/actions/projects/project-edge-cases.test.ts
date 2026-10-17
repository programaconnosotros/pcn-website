import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { createProject } from './create-project';
import { updateProject } from './update-project';
import { deleteProject } from './delete-project';
import { leaveProject } from './leave-project';
import { fetchPublicProjects } from './fetch-public-projects';
import { getSessionUser } from './get-session-user';

const author = { id: 'cm0000000000000000author01', name: 'Autora', role: 'REGULAR' };

const loginAsAuthor = () => {
  mockCookies({ sessionId: 'session-1' });
  prismaMock.session.findUnique.mockResolvedValue({
    id: 'session-1',
    userId: author.id,
    user: author,
  } as never);
};

const validInput = {
  title: 'Mi proyecto',
  description: 'Un proyecto de la comunidad',
  url: 'https://pcn.dev',
  techStack: [],
};

const existing = {
  id: 'project-1',
  authorId: author.id,
  logoUrl: 'https://old/logo.png',
  members: [],
};

describe('getSessionUser', () => {
  it('returns null when the cookie points to no live session', async () => {
    mockCookies({ sessionId: 'expired' });
    prismaMock.session.findUnique.mockResolvedValue(null);

    await expect(getSessionUser()).resolves.toBeNull();
  });
});

describe('createProject edge cases', () => {
  beforeEach(() => {
    prismaMock.project.aggregate.mockResolvedValue({ _max: { order: 3 } } as never);
    prismaMock.project.create.mockResolvedValue({ id: 'new' } as never);
  });

  it('rejects invalid data with the first validation message', async () => {
    loginAsAuthor();

    await expect(createProject({ ...validInput, title: 'x' })).rejects.toThrow(
      'El título debe tener al menos 3 caracteres',
    );
    expect(prismaMock.project.create).not.toHaveBeenCalled();
  });

  it('stores the repo URL only for open-source projects and an empty logo by default', async () => {
    loginAsAuthor();

    await createProject({
      ...validInput,
      isOpenSource: true,
      repoUrl: 'https://github.com/pcn/repo',
    });
    await createProject({ ...validInput, isOpenSource: true });
    await createProject({ ...validInput, repoUrl: 'https://github.com/pcn/repo' });

    const calls = prismaMock.project.create.mock.calls.map(([args]) => args.data);
    expect(calls[0]).toMatchObject({ repoUrl: 'https://github.com/pcn/repo', logoUrl: '' });
    expect(calls[1].repoUrl).toBeNull();
    expect(calls[2].repoUrl).toBeNull();
    expect(calls[0].order).toBe(4);
  });
});

describe('updateProject edge cases', () => {
  it('rejects invalid data before loading the project', async () => {
    loginAsAuthor();

    await expect(
      updateProject('project-1', { ...validInput, startYear: 2020, endYear: 2019 }),
    ).rejects.toThrow('El año de cierre no puede ser anterior al de inicio');
    expect(prismaMock.project.findUnique).not.toHaveBeenCalled();
  });

  it('throws when the project does not exist', async () => {
    loginAsAuthor();
    prismaMock.project.findUnique.mockResolvedValue(null);

    await expect(updateProject('missing', validInput)).rejects.toThrow('Proyecto no encontrado');
  });

  it('keeps the existing logo when none is sent and the repo URL for open-source projects', async () => {
    loginAsAuthor();
    prismaMock.project.findUnique.mockResolvedValue(existing as never);
    prismaMock.$transaction.mockResolvedValue([] as never);

    await updateProject('project-1', {
      ...validInput,
      logoUrl: '',
      isOpenSource: true,
      repoUrl: 'https://github.com/pcn/repo',
    });
    await updateProject('project-1', { ...validInput, isOpenSource: true });

    const [first, second] = prismaMock.project.update.mock.calls.map(([args]) => args.data);
    expect(first).toMatchObject({
      logoUrl: 'https://old/logo.png',
      repoUrl: 'https://github.com/pcn/repo',
    });
    expect(second.repoUrl).toBeNull();
  });

  it('requires a session', async () => {
    mockCookies();

    await expect(updateProject('project-1', validInput)).rejects.toThrow('Debes estar autenticado');
  });
});

describe('deleteProject / leaveProject not found', () => {
  it('deleteProject throws when the project does not exist', async () => {
    loginAsAuthor();
    prismaMock.project.findUnique.mockResolvedValue(null);

    await expect(deleteProject('missing')).rejects.toThrow('Proyecto no encontrado');
    expect(prismaMock.project.delete).not.toHaveBeenCalled();
  });

  it('leaveProject throws when the project does not exist', async () => {
    loginAsAuthor();
    prismaMock.project.findUnique.mockResolvedValue(null);

    await expect(leaveProject('missing')).rejects.toThrow('Proyecto no encontrado');
  });

  it('both require a session', async () => {
    mockCookies();

    await expect(deleteProject('project-1')).rejects.toThrow('Debes estar autenticado');
    await expect(leaveProject('project-1')).rejects.toThrow('Debes estar autenticado');
  });
});

describe('fetchPublicProjects', () => {
  it('lists projects in their manual order with author and members', async () => {
    const createdAt = new Date('2025-01-01');
    prismaMock.project.findMany.mockResolvedValue([{ id: 'p-1', createdAt }] as never);

    await expect(fetchPublicProjects()).resolves.toEqual([{ id: 'p-1', createdAt }]);
    expect(prismaMock.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] }),
    );
  });
});
