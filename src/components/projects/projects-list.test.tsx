import { createEvent, fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { toast } from 'sonner';
import { deleteProject } from '@/actions/projects/delete-project';
import { leaveProject } from '@/actions/projects/leave-project';
import { reorderProjects } from '@/actions/projects/reorder-projects';
import { buildProject, buildProjectMember, jsonResponse, renderInPlatform } from '@/test/platform';
import { ProjectsList } from './projects-list';

jest.mock('@/actions/projects/create-project', () => ({ createProject: jest.fn() }));
jest.mock('@/actions/projects/update-project', () => ({ updateProject: jest.fn() }));
jest.mock('@/actions/projects/delete-project', () => ({ deleteProject: jest.fn() }));
jest.mock('@/actions/projects/leave-project', () => ({ leaveProject: jest.fn() }));
jest.mock('@/actions/projects/reorder-projects', () => ({ reorderProjects: jest.fn() }));
jest.mock('@/actions/users/search-community-members', () => ({
  searchCommunityMembers: jest.fn(),
}));
jest.mock('@/components/ui/file-upload', () => ({ FileUpload: () => null }));
jest.mock('sonner', () => require('@/test/platform').mockSonner());

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000);

const projects = [
  buildProject({
    id: 'p1',
    title: 'PCN Dashboard',
    techStack: ['React', 'Postgres'],
    isOpenSource: true,
    repoUrl: 'https://github.com/pcn/dashboard',
    startYear: 2023,
    authorRole: 'Lead',
    logoUrl: 'https://cdn.example.com/logo.png',
    createdAt: daysAgo(3),
    members: [
      buildProjectMember({
        id: 'm1',
        user: { id: 'collab', name: 'Carla Ruiz', image: null },
        role: 'QA',
      }),
      buildProjectMember({ id: 'm2', user: null, memberName: 'Pedro' }),
    ],
  }),
  buildProject({
    id: 'p2',
    title: 'Bot de WhatsApp',
    description: 'Responde preguntas frecuentes',
    url: 'https://bot.example.com/chat/',
    techStack: ['Go', 'React'],
    endYear: 2022,
    author: { id: 'other', name: 'Diego', image: null },
    createdAt: daysAgo(400),
  }),
  buildProject({
    id: 'p3',
    title: 'Sin autor',
    url: 'no es una url',
    author: null,
    createdAt: daysAgo(60),
  }),
];

// Role queries over the whole list are slow; the titles are the cards' <h2>s
const titles = () =>
  Array.from(document.querySelectorAll('article h2'), (heading) => heading.textContent);
const articles = () => Array.from(document.querySelectorAll('article')) as HTMLElement[];

// A big list with dialogs and menus: give the slower interaction tests some room
jest.setTimeout(20_000);

const openActions = async (user: UserEvent, title: string) => {
  await user.click(screen.getByRole('button', { name: `Acciones de ${title}` }));
};

describe('ProjectsList', () => {
  it('shows the projects, stats and a sign-in link to visitors', () => {
    renderInPlatform(<ProjectsList projects={projects} currentUser={null} />);

    expect(titles()).toEqual(['PCN Dashboard', 'Bot de WhatsApp', 'Sin autor']);
    expect(screen.getByRole('link', { name: 'iniciarSesion();' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Acciones de/ })).not.toBeInTheDocument();
    expect(screen.getByText('1 open-source')).toBeInTheDocument();
    expect(screen.getByText('React · Go · Postgres')).toBeInTheDocument();
    expect(screen.getByText('hace 3 días')).toBeInTheDocument();
    expect(screen.getByText('2023 → hoy')).toBeInTheDocument();
    expect(screen.getByText('→ 2022')).toBeInTheDocument();
    expect(screen.getByText('dashboard.example.com')).toBeInTheDocument();
    expect(screen.getByText('bot.example.com/chat')).toBeInTheDocument();
    expect(screen.getByText('no es una url')).toBeInTheDocument();
    expect(screen.getByTitle('Carla Ruiz · QA')).toHaveAttribute('href', '/perfil/collab');
    expect(screen.getByTitle('Pedro').tagName).toBe('SPAN');
    expect(
      screen.getByRole('link', { name: /Ver el repositorio de PCN Dashboard/ }),
    ).toHaveAttribute('href', 'https://github.com/pcn/dashboard');
  });

  it('shows an empty state without projects', () => {
    renderInPlatform(<ProjectsList projects={[]} currentUser={null} />);

    expect(screen.getByText('todavía no hay proyectos publicados')).toBeInTheDocument();
    expect(screen.getByText('en producción o en camino')).toBeInTheDocument();
  });

  it('searches by text, person and open-source', async () => {
    const user = userEvent.setup();
    renderInPlatform(<ProjectsList projects={projects} currentUser={null} />);
    const search = screen.getByRole('textbox', { name: 'Buscar proyectos' });

    await user.click(search);
    await user.paste('carla');
    expect(titles()).toEqual(['PCN Dashboard']);

    await user.clear(search);
    await user.paste('oss');
    expect(titles()).toEqual(['PCN Dashboard']);

    await user.clear(search);
    await user.paste('nada que ver');
    expect(screen.getByText(/grep: 0 proyectos/)).toHaveTextContent('para "nada que ver"');
  });

  it('filters by open-source and stack flags, also from the tags', async () => {
    const user = userEvent.setup();
    renderInPlatform(<ProjectsList projects={projects} currentUser={null} />);

    await user.click(screen.getByRole('button', { name: /--go/ }));
    expect(titles()).toEqual(['Bot de WhatsApp']);
    await user.click(screen.getByRole('button', { name: /--open-source/ }));
    expect(screen.getByText(/grep: 0 proyectos/)).toHaveTextContent('--open-source con --go');

    await user.click(screen.getByRole('button', { name: /--go/ }));
    expect(titles()).toEqual(['PCN Dashboard']);
    await user.click(screen.getByRole('button', { name: /--open-source/ }));

    const [dashboard] = articles();
    await user.click(within(dashboard).getByRole('button', { name: 'Postgres' }));
    expect(titles()).toEqual(['PCN Dashboard']);
    await user.click(within(dashboard).getByRole('button', { name: 'Postgres' }));
    expect(titles()).toHaveLength(3);
  });

  it('opens a project in the web reader', async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse({ embeddable: false }));
    const user = userEvent.setup();
    renderInPlatform(<ProjectsList projects={projects} currentUser={null} />);

    await user.click(screen.getByRole('button', { name: 'PCN Dashboard' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Bruno Díaz · dashboard.example.com')).toBeInTheDocument();
    expect(await within(dialog).findByText(/no permite mostrarse embebido/)).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith('/api/proyectos/embed?id=p1');

    await user.keyboard('{Escape}');
    const [, bot] = articles();
    await user.click(within(bot).getByRole('button', { name: /\.\/run/ }));
    // Without a logo the reader shows the project's initials
    expect(within(screen.getByRole('dialog')).getByText('BD')).toBeInTheDocument();
  });

  describe('signed in', () => {
    const author = { id: 'author-1', name: 'Bruno Díaz', isAdmin: false };
    const collaborator = { id: 'collab', name: 'Carla Ruiz', isAdmin: false };

    it('opens the create and edit forms', async () => {
      const user = userEvent.setup();
      renderInPlatform(<ProjectsList projects={projects} currentUser={author} />);

      await user.click(screen.getByRole('button', { name: /publicarProyecto/ }));
      expect(screen.getByRole('dialog', { name: 'Nuevo proyecto' })).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'cancelar();' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      expect(
        screen.queryByRole('button', { name: 'Acciones de Bot de WhatsApp' }),
      ).not.toBeInTheDocument();
      await openActions(user, 'PCN Dashboard');
      expect(
        screen.queryByRole('menuitem', { name: 'Salir del proyecto' }),
      ).not.toBeInTheDocument();
      await user.click(screen.getByRole('menuitem', { name: 'Editar' }));
      const dialog = screen.getByRole('dialog', { name: 'Editar proyecto' });
      expect(within(dialog).getByLabelText('Nombre del proyecto')).toHaveValue('PCN Dashboard');
      await user.click(within(dialog).getByRole('button', { name: 'cancelar();' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('deletes a project after confirming', async () => {
      (deleteProject as jest.Mock).mockResolvedValue(undefined);
      const user = userEvent.setup();
      renderInPlatform(<ProjectsList projects={projects} currentUser={author} />);

      await openActions(user, 'PCN Dashboard');
      await user.click(screen.getByRole('menuitem', { name: 'Eliminar' }));
      expect(screen.getByRole('alertdialog')).toHaveTextContent('"PCN Dashboard"');
      await user.click(screen.getByRole('button', { name: 'Eliminar' }));

      expect(deleteProject).toHaveBeenCalledWith('p1');
      expect(toast.success).toHaveBeenCalledWith('Proyecto eliminado');
    });

    it.each([
      [new Error('No autorizado'), 'No autorizado'],
      [{}, 'Error al eliminar el proyecto'],
    ])('reports a failed delete', async (error, message) => {
      (deleteProject as jest.Mock).mockRejectedValue(error);
      const user = userEvent.setup();
      renderInPlatform(<ProjectsList projects={projects} currentUser={author} />);

      await openActions(user, 'PCN Dashboard');
      await user.click(screen.getByRole('menuitem', { name: 'Eliminar' }));
      await user.click(screen.getByRole('button', { name: 'Eliminar' }));

      await waitFor(() => expect(toast.error).toHaveBeenCalledWith(message));
    });

    it('lets collaborators leave a project', async () => {
      (leaveProject as jest.Mock).mockResolvedValue(undefined);
      const user = userEvent.setup();
      renderInPlatform(<ProjectsList projects={projects} currentUser={collaborator} />);

      await openActions(user, 'PCN Dashboard');
      expect(screen.queryByRole('menuitem', { name: 'Eliminar' })).not.toBeInTheDocument();
      await user.click(screen.getByRole('menuitem', { name: 'Salir del proyecto' }));
      await user.click(screen.getByRole('button', { name: 'Salir' }));

      expect(leaveProject).toHaveBeenCalledWith('p1');
      expect(toast.success).toHaveBeenCalledWith('Saliste del proyecto');
    });

    it.each([
      [new Error('No sos parte'), 'No sos parte'],
      [{}, 'Error al salir del proyecto'],
    ])('reports a failed leave', async (error, message) => {
      (leaveProject as jest.Mock).mockRejectedValue(error);
      const user = userEvent.setup();
      renderInPlatform(<ProjectsList projects={projects} currentUser={collaborator} />);

      await openActions(user, 'PCN Dashboard');
      await user.click(screen.getByRole('menuitem', { name: 'Salir del proyecto' }));
      await user.click(screen.getByRole('button', { name: 'Salir' }));

      await waitFor(() => expect(toast.error).toHaveBeenCalledWith(message));
    });
  });

  describe('reordering (admins)', () => {
    const admin = { id: 'admin', name: 'Admin', isAdmin: true };

    it('nudges projects with the arrows and saves the order', async () => {
      (reorderProjects as jest.Mock).mockResolvedValue(undefined);
      const user = userEvent.setup();
      renderInPlatform(<ProjectsList projects={projects} currentUser={admin} />);

      await user.click(screen.getByRole('button', { name: /ordenar/ }));
      expect(screen.getByText(/arrastrá los proyectos/)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Acciones de/ })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Subir PCN Dashboard' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Bajar Sin autor' })).toBeDisabled();

      await user.click(screen.getByRole('button', { name: 'Bajar PCN Dashboard' }));

      expect(titles()).toEqual(['Bot de WhatsApp', 'PCN Dashboard', 'Sin autor']);
      expect(reorderProjects).toHaveBeenCalledWith(['p2', 'p1', 'p3']);
      expect(toast.success).toHaveBeenCalledWith('Orden guardado');

      await user.click(screen.getByRole('button', { name: /terminar/ }));
      expect(screen.getByRole('textbox', { name: 'Buscar proyectos' })).toBeInTheDocument();
    });

    it.each([
      [new Error('Sin permisos'), 'Sin permisos'],
      [{}, 'No se pudo guardar el orden'],
    ])('restores the order when saving fails', async (error, message) => {
      (reorderProjects as jest.Mock).mockRejectedValue(error);
      const user = userEvent.setup();
      renderInPlatform(<ProjectsList projects={projects} currentUser={admin} />);

      await user.click(screen.getByRole('button', { name: /ordenar/ }));
      await user.click(screen.getByRole('button', { name: 'Subir Sin autor' }));

      await waitFor(() => expect(toast.error).toHaveBeenCalledWith(message));
      expect(titles()).toEqual(['PCN Dashboard', 'Bot de WhatsApp', 'Sin autor']);
    });

    it('drags a project to a new place and saves once', async () => {
      (reorderProjects as jest.Mock).mockResolvedValue(undefined);
      const user = userEvent.setup();
      renderInPlatform(<ProjectsList projects={projects} currentUser={admin} />);
      await user.click(screen.getByRole('button', { name: /ordenar/ }));

      const [first, , third] = articles();
      const dragStart = createEvent.dragStart(third);
      Object.defineProperty(dragStart, 'dataTransfer', { value: { effectAllowed: '' } });
      fireEvent(third, dragStart);
      fireEvent.dragOver(first);
      fireEvent.drop(first);
      expect(titles()).toEqual(['Sin autor', 'PCN Dashboard', 'Bot de WhatsApp']);

      fireEvent.dragEnd(third);
      await waitFor(() => expect(reorderProjects).toHaveBeenCalledWith(['p3', 'p1', 'p2']));
    });

    it('does not save when a drag ends where it started', async () => {
      const user = userEvent.setup();
      renderInPlatform(<ProjectsList projects={projects} currentUser={admin} />);
      await user.click(screen.getByRole('button', { name: /ordenar/ }));

      const [first] = articles();
      const dragStart = createEvent.dragStart(first);
      Object.defineProperty(dragStart, 'dataTransfer', { value: { effectAllowed: '' } });
      fireEvent(first, dragStart);
      fireEvent.dragOver(first);
      fireEvent.dragEnd(first);

      expect(reorderProjects).not.toHaveBeenCalled();
    });

    it('ignores drags outside reorder mode', () => {
      renderInPlatform(<ProjectsList projects={projects} currentUser={admin} />);

      const [first, second] = articles();
      fireEvent.dragStart(first);
      fireEvent.dragOver(second);
      fireEvent.dragEnd(first);

      expect(titles()).toEqual(['PCN Dashboard', 'Bot de WhatsApp', 'Sin autor']);
      expect(reorderProjects).not.toHaveBeenCalled();
    });
  });
});
