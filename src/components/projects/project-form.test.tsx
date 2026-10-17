import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { toast } from 'sonner';
import { createProject } from '@/actions/projects/create-project';
import { updateProject } from '@/actions/projects/update-project';
import { buildProject, buildProjectMember } from '@/test/platform';
import { ProjectForm } from './project-form';

jest.mock('@/actions/projects/create-project', () => ({ createProject: jest.fn() }));
jest.mock('@/actions/projects/update-project', () => ({ updateProject: jest.fn() }));
jest.mock('@/actions/users/search-community-members', () => ({
  searchCommunityMembers: jest.fn(),
}));
jest.mock('@/components/ui/file-upload', () => ({
  FileUpload: ({ value, onChange }: { value: string; onChange: (_url: string) => void }) => (
    <button type="button" onClick={() => onChange('https://cdn.example.com/logo.png')}>
      subir logo {value}
    </button>
  ),
}));
jest.mock('sonner', () => require('@/test/platform').mockSonner());

const me = { id: 'author-1', name: 'Bruno Díaz', isAdmin: false };
const createMock = createProject as jest.Mock;
const updateMock = updateProject as jest.Mock;

const fill = async (user: UserEvent, label: string, value: string) => {
  const input = screen.getByLabelText(label);
  await user.clear(input);
  if (value) {
    await user.click(input);
    await user.paste(value);
  }
};

const fillBasics = async (user: UserEvent) => {
  await fill(user, 'Nombre del proyecto', 'Mi app');
  await fill(user, 'Descripción', 'Una app para organizar meetups');
  await fill(user, 'URL del proyecto', 'https://miapp.dev');
};

const submit = (user: UserEvent, name = /publicarProyecto/) =>
  user.click(screen.getByRole('button', { name }));

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('ProjectForm', () => {
  it('validates the required fields', async () => {
    const user = userEvent.setup();
    render(<ProjectForm currentUser={me} />);

    await submit(user);

    expect(
      await screen.findByText('El título debe tener al menos 3 caracteres'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('La descripción debe tener al menos 10 caracteres'),
    ).toBeInTheDocument();
    expect(screen.getByText('La URL del proyecto no es válida')).toBeInTheDocument();
    expect(createMock).not.toHaveBeenCalled();
  });

  it('publishes a new project with stack, repo, years, logo and author role', async () => {
    createMock.mockResolvedValue(undefined);
    const onSuccess = jest.fn();
    const user = userEvent.setup();
    render(<ProjectForm currentUser={me} onSuccess={onSuccess} />);

    expect(screen.getByText('Bruno Díaz')).toBeInTheDocument();
    await fillBasics(user);
    await user.click(screen.getByRole('button', { name: /subir logo/ }));

    const tech = screen.getByPlaceholderText('Ej: Next.js, PostgreSQL...');
    await user.type(tech, 'Next.js{Enter}');
    await user.type(tech, 'Postgres');
    await user.click(tech.nextElementSibling as HTMLElement);
    await user.type(tech, 'Next.js{Enter}');
    await user.type(tech, '   {Enter}');
    expect(screen.getAllByText(/^(Next\.js|Postgres)$/)).toHaveLength(2);

    await user.click(screen.getByLabelText('Es open-source'));
    await fill(user, 'Repositorio en GitHub', 'https://github.com/pcn/app');
    await fill(user, 'Año de inicio', '2023');
    await fill(user, 'Año de cierre', '2024');
    await fill(user, 'Rol del autor', 'Tech lead');
    await submit(user);

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Mi app',
        description: 'Una app para organizar meetups',
        url: 'https://miapp.dev',
        logoUrl: 'https://cdn.example.com/logo.png',
        techStack: ['Next.js', 'Postgres'],
        isOpenSource: true,
        repoUrl: 'https://github.com/pcn/app',
        startYear: 2023,
        endYear: 2024,
        authorRole: 'Tech lead',
        members: [],
      }),
    );
    expect(toast.success).toHaveBeenCalledWith('Proyecto publicado');
  });

  it('removes a tech tag', async () => {
    const user = userEvent.setup();
    render(<ProjectForm currentUser={me} project={buildProject({ techStack: ['Go', 'Rust'] })} />);

    await user.click(screen.getByText('Go').querySelector('button')!);

    expect(screen.queryByText('Go')).not.toBeInTheDocument();
    expect(screen.getByText('Rust')).toBeInTheDocument();
  });

  it('validates the repo and the years', async () => {
    const user = userEvent.setup();
    render(<ProjectForm currentUser={me} />);

    await fillBasics(user);
    await user.click(screen.getByLabelText('Es open-source'));
    await fill(user, 'Repositorio en GitHub', 'https://gitlab.com/x/y');
    await fill(user, 'Año de inicio', '2024');
    await fill(user, 'Año de cierre', '2020');
    await submit(user);

    expect(
      await screen.findByText(/Ingresá la URL de un repositorio de GitHub/),
    ).toBeInTheDocument();
    expect(
      screen.getByText('El año de cierre no puede ser anterior al de inicio'),
    ).toBeInTheDocument();

    // Unchecking open-source clears the hidden repo field
    await user.click(screen.getByLabelText('Es open-source'));
    expect(screen.queryByLabelText('Repositorio en GitHub')).not.toBeInTheDocument();
    await user.click(screen.getByLabelText('Es open-source'));
    expect(screen.getByLabelText('Repositorio en GitHub')).toHaveValue('');
  });

  it('updates a project as its author and cancels', async () => {
    updateMock.mockResolvedValue(undefined);
    const onCancel = jest.fn();
    const user = userEvent.setup();
    const project = buildProject({
      authorRole: 'Dev',
      members: [buildProjectMember({ role: 'Diseño' })],
    });
    render(
      <ProjectForm currentUser={me} project={project} onCancel={onCancel} onSuccess={jest.fn()} />,
    );

    expect(screen.getByLabelText('Nombre del proyecto')).toHaveValue('PCN Dashboard');
    expect(screen.getByLabelText('Rol de Carla')).toHaveValue('Diseño');
    await submit(user, /actualizarProyecto/);

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Proyecto actualizado'));
    expect(updateMock).toHaveBeenCalledWith(
      'p1',
      expect.objectContaining({
        authorRole: 'Dev',
        members: [{ userId: 'cmember0001', memberName: 'Carla', role: 'Diseño' }],
      }),
    );

    await user.click(screen.getByRole('button', { name: 'cancelar();' }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('shows the team read-only to collaborators', () => {
    const project = buildProject({
      authorRole: 'Lead',
      members: [
        buildProjectMember({ id: 'm1', user: { id: 'me', name: 'Yo', image: null }, role: 'QA' }),
        buildProjectMember({ id: 'm2', user: null, memberName: 'Sin cuenta' }),
      ],
    });
    render(
      <ProjectForm currentUser={{ id: 'me', name: 'Yo', isAdmin: false }} project={project} />,
    );

    expect(
      screen.getByText('Solo el autor puede cambiar el equipo y los roles.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Lead')).toBeInTheDocument();
    expect(screen.getByText('QA')).toBeInTheDocument();
    expect(screen.getByText('Sin cuenta')).toBeInTheDocument();
    expect(screen.queryByLabelText('Rol del autor')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'cancelar();' })).not.toBeInTheDocument();
  });

  it('lets admins manage old projects without an author', () => {
    render(
      <ProjectForm
        currentUser={{ id: 'admin', name: 'Admin', isAdmin: true }}
        project={buildProject({ author: null })}
      />,
    );

    expect(screen.getByText('Sin autor')).toBeInTheDocument();
    expect(screen.queryByLabelText('Rol del autor')).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar compañeros por nombre...')).toBeInTheDocument();
  });

  it.each([
    [new Error('Ya existe un proyecto con esa URL'), 'Ya existe un proyecto con esa URL'],
    [new Error(''), 'Error al guardar el proyecto'],
  ])('reports a failed save (%s)', async (error, message) => {
    createMock.mockRejectedValue(error);
    const onSuccess = jest.fn();
    const user = userEvent.setup();
    render(<ProjectForm currentUser={me} onSuccess={onSuccess} />);

    await fillBasics(user);
    await submit(user);

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(message));
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
