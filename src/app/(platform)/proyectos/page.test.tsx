import { screen } from '@testing-library/react';
import { fetchPublicProjects } from '@/actions/projects/fetch-public-projects';
import { ProjectsList } from '@/components/projects/projects-list';
import { findSession } from '@/lib/session';
import { mockCookies } from '@/test/cookies';
import { adminRow, renderPage, sessionRow } from '@/test/pages-m-z';
import { buildProject } from '@/test/platform';
import Image, { alt } from './opengraph-image';
import Proyectos, { metadata } from './page';

jest.mock('next/headers', () => ({ cookies: jest.fn(), headers: jest.fn() }));
jest.mock('@/lib/session', () => ({ findSession: jest.fn() }));
jest.mock('@/actions/projects/fetch-public-projects', () => ({ fetchPublicProjects: jest.fn() }));
jest.mock('@/components/projects/projects-list', () => ({
  ProjectsList: jest.fn(() => <p>lista de proyectos</p>),
}));
jest.mock('@/lib/og/section-cards', () => require('@/test/pages-m-z').mockSectionCards());
jest.mock('@/lib/og/terminal-card', () => require('@/test/pages-m-z').mockTerminalCard());

const projects = [buildProject()];
const listProps = () => jest.mocked(ProjectsList).mock.calls[0][0];

describe('/proyectos', () => {
  beforeEach(() => {
    jest.mocked(fetchPublicProjects).mockResolvedValue(projects as never);
  });

  it('has its title and share cards', () => {
    expect(metadata.title).toBe('ls ~/proyectos');
    expect(metadata.openGraph).toMatchObject({
      title: 'Proyectos de la comunidad | programaConNosotros',
    });
  });

  it('lists the projects for an anonymous visitor without looking up a session', async () => {
    mockCookies();
    await renderPage(Proyectos());

    expect(screen.getByText('lista de proyectos')).toBeInTheDocument();
    expect(findSession).not.toHaveBeenCalled();
    expect(listProps()).toEqual({ projects, currentUser: null });
  });

  it('treats an expired session as anonymous', async () => {
    mockCookies({ sessionId: 'token' });
    jest.mocked(findSession).mockResolvedValue(null);
    await renderPage(Proyectos());

    expect(listProps().currentUser).toBeNull();
  });

  it('passes a member as the current user', async () => {
    mockCookies({ sessionId: 'token' });
    jest.mocked(findSession).mockResolvedValue(sessionRow({ id: 'u7', name: 'Bruno' }));
    await renderPage(Proyectos());

    expect(findSession).toHaveBeenCalledWith('token');
    expect(listProps().currentUser).toEqual({ id: 'u7', name: 'Bruno', isAdmin: false });
  });

  it('flags admins', async () => {
    mockCookies({ sessionId: 'token' });
    jest.mocked(findSession).mockResolvedValue(adminRow({ id: 'a1', name: 'Root' }));
    await renderPage(Proyectos());

    expect(listProps().currentUser).toEqual({ id: 'a1', name: 'Root', isAdmin: true });
  });

  it('uses the projects section card for link previews', async () => {
    expect(alt).toBe('proyectos · programaConNosotros');
    await expect(Image()).resolves.toEqual({ section: 'proyectos' });
  });
});
