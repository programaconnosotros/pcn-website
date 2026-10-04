import { screen, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { getInterviewQuestions } from '@/app/(platform)/entrevistas/questions';
import { renderInPlatform } from '@/test/platform';
import { InterviewSimulator } from './interview-simulator';

jest.mock('@/app/(platform)/entrevistas/questions', () => ({
  ...jest.requireActual('@/app/(platform)/entrevistas/questions'),
  getInterviewQuestions: jest.fn(),
}));
const mockReadIds = new Set<string>();
jest.mock('@/hooks/use-content-marks', () => ({
  useContentMarks: () => ({
    ids: () => mockReadIds,
    toggle: jest.fn(),
    isAuthenticated: true,
    isLoading: false,
  }),
}));

const questionsMock = getInterviewQuestions as jest.Mock;
const deck = [
  { question: '¿Qué es un `hook`?', answer: 'Una función de React', topic: 'hooks' },
  { question: '¿Qué es el virtual DOM?', answer: 'Una copia en memoria', topic: 'render' },
  { question: '¿Qué hace useMemo?', answer: 'Memoiza un valor', topic: 'hooks' },
];

const guideSections = new Proxy({} as Record<string, string[]>, { get: () => ['intro', 'hooks'] });

// Options read "[ ] Label hint"; match the label exactly (role queries are slow on this page)
const option = (label: string) =>
  screen.getByText(label, { selector: 'button > span.font-semibold' }).closest('button')!;

jest.setTimeout(20_000);
const start = () => screen.getByRole('button', { name: /comenzar entrevista/ });

const setupReact = async (user: UserEvent) => {
  await user.click(option('Frontend'));
  await user.click(option('React.js'));
  await user.click(option('Junior'));
};

const reveal = (user: UserEvent) =>
  user.click(screen.getByRole('button', { name: /mostrar respuesta/ }));
const gradeWith = (user: UserEvent, knew: boolean) =>
  user.click(screen.getByRole('button', { name: knew ? /la sabía/ : /a repasar/ }));

describe('InterviewSimulator', () => {
  beforeEach(() => {
    questionsMock.mockReturnValue(deck);
    // No swaps in the shuffle: the deck keeps its order
    jest.spyOn(Math, 'random').mockReturnValue(0.999);
    mockReadIds.clear();
  });
  afterEach(() => jest.restoreAllMocks());

  it('asks for every missing choice before starting', async () => {
    const user = userEvent.setup();
    renderInPlatform(<InterviewSimulator guideSections={guideSections} />);

    expect(start()).toBeDisabled();
    expect(screen.getByText('elegí el tipo y la seniority')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'mirá todas las guías' })).toHaveAttribute(
      'href',
      '/entrevistas/guias',
    );

    await user.click(option('Backend'));
    expect(screen.getByText('elegí la tecnología y la seniority')).toBeInTheDocument();
    await user.click(option('Python'));
    expect(screen.getByText('elegí la seniority')).toBeInTheDocument();
    await user.click(option('Senior'));

    expect(start()).toBeEnabled();
    expect(questionsMock).toHaveBeenLastCalledWith(
      'python',
      'senior',
      { automated: false, tools: [] },
      [],
    );
    expect(screen.getByText('3 preguntas')).toBeInTheDocument();
    expect(screen.getByText('cat guias/python')).toBeInTheDocument();
  });

  it('runs an interview with the mouse and summarises the results', async () => {
    const user = userEvent.setup();
    renderInPlatform(<InterviewSimulator guideSections={guideSections} />);
    await setupReact(user);
    await user.click(start());

    expect(screen.getByText('pregunta 1/3')).toBeInTheDocument();
    expect(screen.getByText('hook', { selector: 'code' })).toBeInTheDocument();
    await reveal(user);
    expect(screen.getByText('Una función de React')).toBeInTheDocument();
    await gradeWith(user, true);

    await reveal(user);
    await gradeWith(user, false);
    await reveal(user);
    await gradeWith(user, true);

    expect(screen.getByText(/entrevista terminada/)).toBeInTheDocument();
    expect(screen.getByText('la sabía', { selector: 'span' }).parentElement).toHaveTextContent(
      '2/3la sabía',
    );
    expect(screen.getByText('# a repasar')).toBeInTheDocument();
    expect(screen.getByText('¿Qué es el virtual DOM?')).toBeInTheDocument();
    // Weakest topic first
    const topics = within(screen.getByText('grep --count temas').closest('section')!).getAllByRole(
      'listitem',
    );
    expect(topics[0]).toHaveTextContent('# render0/1');
    expect(topics[1]).toHaveTextContent('# hooks2/2');

    await user.click(screen.getByRole('button', { name: /repasar 1 pregunta/ }));
    expect(screen.getByText('pregunta 1/1')).toBeInTheDocument();
    await reveal(user);
    await gradeWith(user, true);
    expect(screen.getByText('la sabía', { selector: 'span' }).parentElement).toHaveTextContent(
      '1/1la sabía',
    );
    expect(screen.queryByText('# a repasar')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /repetir entrevista/ }));
    expect(screen.getByText('pregunta 1/3')).toBeInTheDocument();
  });

  it('plays with the keyboard and can end early', async () => {
    const user = userEvent.setup();
    renderInPlatform(<InterviewSimulator guideSections={guideSections} />);
    await setupReact(user);
    await user.click(start());

    await user.keyboard('1');
    expect(screen.getByText('pregunta 1/3')).toBeInTheDocument();
    await user.keyboard(' ');
    await user.keyboard('{Control>}2{/Control}');
    expect(screen.getByText('pregunta 1/3')).toBeInTheDocument();
    await user.keyboard('2');
    expect(screen.getByText('pregunta 2/3')).toBeInTheDocument();
    await user.keyboard('{Enter}');
    await user.keyboard('1');
    expect(screen.getByText('pregunta 3/3')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /terminar entrevista/ }));
    expect(screen.getByText(/respondiste 2 de 3 preguntas/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /elegir otra entrevista/ }));
    expect(start()).toBeEnabled();
  });

  it('ends without answers', async () => {
    const user = userEvent.setup();
    renderInPlatform(<InterviewSimulator guideSections={guideSections} />);
    await setupReact(user);
    await user.click(start());

    await user.click(screen.getByRole('button', { name: /terminar entrevista/ }));

    expect(screen.getByText(/respondiste 0 de 3/)).toBeInTheDocument();
    expect(screen.queryByText('grep --count temas')).not.toBeInTheDocument();
  });

  it('configures a quality engineering interview with automation tools', async () => {
    const user = userEvent.setup();
    renderInPlatform(<InterviewSimulator guideSections={guideSections} />);

    await user.click(option('Quality engineering'));
    await user.click(option('Junior'));
    expect(screen.getByText('elegí el tipo de testing')).toBeInTheDocument();

    await user.click(option('Incluye automatizado'));
    expect(screen.getByText('elegí al menos una herramienta')).toBeInTheDocument();
    await user.click(option('Playwright'));
    await user.click(option('Cypress'));
    await user.click(option('Cypress'));
    await user.click(option('Cypress'));

    expect(start()).toBeEnabled();
    expect(questionsMock).toHaveBeenLastCalledWith(
      'qa',
      'junior',
      { automated: true, tools: ['cypress', 'playwright'] },
      [],
    );
    expect(screen.getByText('Cypress + Playwright')).toBeInTheDocument();

    await user.click(option('Solo manual'));
    expect(screen.getAllByText('manual').length).toBeGreaterThan(0);
  });

  it('requires a tool for DevOps and makes Figma optional for UX/UI', async () => {
    const user = userEvent.setup();
    renderInPlatform(<InterviewSimulator guideSections={guideSections} />);

    await user.click(option('DevOps'));
    await user.click(option('Junior'));
    expect(screen.getByText('elegí al menos una de las tecnologías')).toBeInTheDocument();
    await user.click(option('Docker'));
    await user.click(option('AWS'));
    expect(questionsMock).toHaveBeenLastCalledWith('devops', 'junior', expect.anything(), [
      'aws',
      'docker',
    ]);
    expect(screen.getByText('AWS + Docker')).toBeInTheDocument();

    await user.click(option('Diseño UX/UI'));
    expect(screen.getByText(/opcional, suma sus preguntas/)).toBeInTheDocument();
    expect(screen.getByText('ninguna')).toBeInTheDocument();
    expect(start()).toBeEnabled();
  });

  it.each([
    ['python', 'Python'],
    ['figma', 'Figma'],
    ['ai', 'AI engineering'],
  ])('preselects ?tipo=%s', (tipo, selected) => {
    renderInPlatform(<InterviewSimulator guideSections={guideSections} tipo={tipo} />);

    expect(option(selected)).toHaveAttribute('aria-pressed', 'true');
  });

  it('preselects an area with several tracks and ignores unknown types', () => {
    const { unmount } = renderInPlatform(
      <InterviewSimulator guideSections={guideSections} tipo="backend" />,
    );
    expect(screen.getByText('elegí la tecnología y la seniority')).toBeInTheDocument();
    unmount();

    renderInPlatform(<InterviewSimulator guideSections={guideSections} tipo="cobol" />);
    expect(screen.getByText('elegí el tipo y la seniority')).toBeInTheDocument();
  });
});
