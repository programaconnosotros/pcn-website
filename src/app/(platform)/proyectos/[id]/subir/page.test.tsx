import { getCurrentSession } from '@/actions/auth/get-current-session';
import { ProjectMediaUploader } from '@/components/projects/project-media-uploader';
import { fetchProject } from '@/lib/projects';
import { renderInPlatform } from '@/test/platform';
import UploadProjectMediaPage from './page';

jest.mock('@/actions/auth/get-current-session', () => ({ getCurrentSession: jest.fn() }));
jest.mock('@/lib/projects', () => ({ fetchProject: jest.fn() }));
// The real module reads the session through Prisma; the rule is the same.
jest.mock('@/actions/projects/get-session-user', () => ({
  canEditProject: (
    user: { id: string; role: string } | null,
    project: { authorId: string; members: { userId: string }[] },
  ) =>
    !!user &&
    (user.role === 'ADMIN' ||
      project.authorId === user.id ||
      project.members.some((member) => member.userId === user.id)),
}));
jest.mock('@/components/projects/project-media-uploader', () => ({
  ProjectMediaUploader: jest.fn(() => null),
}));

const project = {
  id: 'p1',
  title: 'PCN Website',
  authorId: 'author',
  members: [{ userId: 'collab' }],
  media: [{ id: 'm1' }, { id: 'm2' }],
};
const props = { params: Promise.resolve({ id: 'p1' }) };
const signIn = (id: string | null, role = 'USER') =>
  jest
    .mocked(getCurrentSession)
    .mockResolvedValue((id && { user: { id, role, name: 'X' } }) as never);

beforeEach(() => jest.mocked(fetchProject).mockResolvedValue(project as never));

describe('/proyectos/[id]/subir', () => {
  it('is not found for a missing project', async () => {
    jest.mocked(fetchProject).mockResolvedValue(null);
    signIn('author');
    await expect(UploadProjectMediaPage(props)).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('asks visitors to log in and sends back whoever cannot edit the project', async () => {
    signIn(null);
    await expect(UploadProjectMediaPage(props)).rejects.toThrow(
      `NEXT_REDIRECT:/autenticacion/iniciar-sesion?redirect=${encodeURIComponent('/proyectos/p1/subir')}`,
    );
    signIn('stranger');
    await expect(UploadProjectMediaPage(props)).rejects.toThrow('NEXT_REDIRECT:/proyectos/p1');
  });

  it.each(['author', 'collab'])(
    'lets the team (%s) upload, with what is already there',
    async (id) => {
      signIn(id);
      const { container } = renderInPlatform(await UploadProjectMediaPage(props));
      expect(container).toHaveTextContent('2/24 fotos y videos');
      expect(jest.mocked(ProjectMediaUploader).mock.calls.at(-1)![0]).toEqual({
        projectId: 'p1',
        count: 2,
      });
    },
  );
});
