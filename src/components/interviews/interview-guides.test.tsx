import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { InterviewGuide as Guide } from '@/app/(platform)/entrevistas/guias/guides/types';
import { endpointCourses } from '@/data/recommended-courses';
import { renderInPlatform } from '@/test/platform';
import { CopyLinkButton } from './copy-link-button';
import { GuideProgressPanel } from './guide-progress-panel';
import { InterviewGuide } from './interview-guide';
import { InterviewGuidesList, type GuideGroup } from './interview-guides-list';
import { InterviewsTabs } from './interviews-tabs';

const mockMarks = {
  read: new Set<string>(),
  toggle: jest.fn(),
  isAuthenticated: true,
  isLoading: false,
};
jest.mock('@/hooks/use-content-marks', () => ({
  useContentMarks: () => ({
    ids: () => mockMarks.read,
    toggle: mockMarks.toggle,
    isAuthenticated: mockMarks.isAuthenticated,
    isLoading: mockMarks.isLoading,
  }),
}));

const guide: Guide = {
  track: 'react',
  summary: 'Todo lo que te preguntan de React',
  sections: ['intro', 'hooks', 'render'].map((id) => ({
    id,
    title: `Sección ${id}`,
    body: [`Párrafo de ${id} con \`código\``],
    checklist: [{ text: `Punto de ${id}`, explanation: `Explicación de ${id}` }],
  })),
};

const practice = { href: '/entrevistas?tipo=react', label: 'simular entrevista' };

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('interview guides', () => {
  // The guide's table of contents scrolls its own nav; jsdom has no Element.scrollTo
  beforeAll(() => {
    Element.prototype.scrollTo = jest.fn() as unknown as typeof Element.prototype.scrollTo;
  });

  beforeEach(() => {
    mockMarks.read = new Set();
    mockMarks.isAuthenticated = true;
    mockMarks.isLoading = false;
  });

  describe('InterviewGuide', () => {
    it('shows progress, sections, checklist and courses', () => {
      mockMarks.read = new Set(['react/hooks']);
      renderInPlatform(
        <InterviewGuide
          guide={guide}
          label="Frontend · React.js"
          stack="web, hooks"
          practice={practice}
          courses={endpointCourses}
        />,
      );

      expect(screen.getByText('1/3 leídas')).toBeInTheDocument();
      expect(screen.getAllByText('código', { selector: 'code' })).toHaveLength(3);
      expect(screen.getByText('Explicación de intro')).toBeInTheDocument();
      expect(
        screen.getByRole('progressbar', { name: '1 de 3 secciones leídas' }),
      ).toBeInTheDocument();
      expect(screen.getByTitle('Desmarcar como leída')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getAllByRole('button', { name: /marcar como leída y seguir/ })).toHaveLength(1);
      expect(screen.getByRole('button', { name: /^marcar como leída$/ })).toBeInTheDocument();
      expect(screen.getByText('Curso de Blue Team')).toBeInTheDocument();
      expect(screen.queryByText(/guía completa/)).not.toBeInTheDocument();
    });

    it('marks a section as read and jumps to the next unread one', async () => {
      mockMarks.read = new Set(['react/hooks']);
      const user = userEvent.setup();
      renderInPlatform(
        <InterviewGuide guide={guide} label="React" stack="web" practice={practice} />,
      );
      const scroll = jest.spyOn(document.getElementById('render')!, 'scrollIntoView');

      await user.click(screen.getAllByRole('button', { name: /marcar como leída y seguir/ })[0]);

      expect(mockMarks.toggle).toHaveBeenCalledWith('react/intro', 'read');
      expect(scroll).toHaveBeenCalledWith({ behavior: 'smooth' });

      await user.click(screen.getAllByTitle('Marcar como leída')[0]);
      expect(mockMarks.toggle).toHaveBeenLastCalledWith('react/intro', 'read');
    });

    it('asks visitors to sign in and does not scroll for them', async () => {
      mockMarks.isAuthenticated = false;
      const user = userEvent.setup();
      renderInPlatform(
        <InterviewGuide guide={guide} label="React" stack="web" practice={practice} />,
      );

      expect(screen.getByRole('link', { name: 'iniciá sesión' })).toBeInTheDocument();
      const scroll = jest.spyOn(document.getElementById('hooks')!, 'scrollIntoView');
      await user.click(screen.getAllByRole('button', { name: /marcar como leída y seguir/ })[0]);

      expect(mockMarks.toggle).toHaveBeenCalledWith('react/intro', 'read');
      expect(scroll).not.toHaveBeenCalled();
    });

    it('celebrates a completed guide', () => {
      mockMarks.read = new Set(['react/intro', 'react/hooks', 'react/render']);
      renderInPlatform(
        <InterviewGuide guide={guide} label="React" stack="web" practice={practice} />,
      );

      expect(screen.getByText('guía completa. ahora ponete a prueba:')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /marcar como leída/ })).not.toBeInTheDocument();
    });
  });

  describe('InterviewGuidesList', () => {
    const groups: GuideGroup[] = [
      {
        label: 'Frontend',
        cta: { href: '/entrevistas?tipo=frontend', hint: 'practicá', label: 'simular' },
        guides: [
          {
            track: 'react',
            label: 'React.js',
            fullLabel: 'Frontend · React.js',
            stack: 'web',
            summary: 'Guía de React',
            sectionIds: ['a', 'b'],
          },
        ],
      },
      {
        label: 'Backend',
        cta: { href: '/entrevistas?tipo=backend', hint: 'practicá', label: 'simular backend' },
        guides: [
          {
            track: 'node',
            label: 'Node',
            fullLabel: 'Backend · Node',
            stack: 'x',
            summary: 's',
            sectionIds: ['a'],
          },
          {
            track: 'python',
            label: 'Python',
            fullLabel: 'Backend · Python',
            stack: 'y',
            summary: 's',
            sectionIds: ['a'],
          },
        ],
      },
    ];

    it('shows progress and where to continue', () => {
      mockMarks.read = new Set(['react/a', 'node/a']);
      render(<InterviewGuidesList groups={groups} courses={endpointCourses} />);

      expect(screen.getByText('2/4')).toBeInTheDocument();
      expect(screen.getByText('1/3')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /seguir con Frontend · React.js/ })).toHaveAttribute(
        'href',
        '/entrevistas/guias/react#b',
      );
      expect(screen.getByRole('link', { name: /simular$/ })).toHaveAttribute(
        'href',
        '/entrevistas?tipo=frontend',
      );
      expect(screen.queryByRole('link', { name: /simular backend/ })).not.toBeInTheDocument();
    });

    it('invites visitors to sign in', () => {
      mockMarks.isAuthenticated = false;
      render(<InterviewGuidesList groups={groups} courses={endpointCourses} />);

      expect(screen.getByRole('link', { name: 'Iniciá sesión' })).toBeInTheDocument();
    });

    it('explains how to track progress to signed-in users without progress', () => {
      render(<InterviewGuidesList groups={groups} courses={endpointCourses} />);

      expect(screen.getByText(/Elegí una guía y marcá cada sección/)).toBeInTheDocument();
    });
  });

  describe('GuideProgressPanel', () => {
    it.each([
      [[], 'empezar la guía', '/entrevistas/guias/react'],
      [['react/intro'], 'seguir leyendo', '/entrevistas/guias/react#hooks'],
      [['react/intro', 'react/hooks'], 'repasar la guía', '/entrevistas/guias/react'],
    ])('links to where the reader left off (%j)', (read, label, href) => {
      mockMarks.read = new Set(read);
      render(<GuideProgressPanel track="react" label="React" sectionIds={['intro', 'hooks']} />);

      expect(screen.getByRole('link', { name: new RegExp(label) })).toHaveAttribute('href', href);
    });
  });

  it('marks the active interviews tab', () => {
    render(<InterviewsTabs active="guias" />);

    expect(screen.getByRole('link', { name: /guías/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /simulador/ })).not.toHaveAttribute('aria-current');
  });

  describe('CopyLinkButton', () => {
    it('copies the absolute link and confirms it for a moment', async () => {
      const user = userEvent.setup();
      render(<CopyLinkButton path="/entrevistas/guias/react" />);

      await user.click(screen.getByRole('button', { name: 'copiar link' }));

      expect(await navigator.clipboard.readText()).toBe('http://localhost/entrevistas/guias/react');
      expect(screen.getByRole('button', { name: 'link copiado' })).toBeInTheDocument();
      await waitFor(
        () => expect(screen.getByRole('button', { name: 'copiar link' })).toBeInTheDocument(),
        { timeout: 3000 },
      );
    });

    it('logs when the clipboard fails', async () => {
      const user = userEvent.setup();
      jest.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'));
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      render(<CopyLinkButton path="/x" />);

      await user.click(screen.getByRole('button', { name: 'copiar link' }));

      expect(consoleError).toHaveBeenCalledWith('Error copying to clipboard:', expect.any(Error));
      expect(screen.getByRole('button', { name: 'copiar link' })).toBeInTheDocument();
      consoleError.mockRestore();
    });
  });
});
