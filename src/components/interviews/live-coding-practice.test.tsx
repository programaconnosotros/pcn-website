import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {
  CodingExercise,
  LeetCodeProblem,
} from '@/app/(platform)/entrevistas/live-coding/exercises/types';
import { renderInPlatform } from '@/test/platform';
import { LiveCodingPractice } from './live-coding-practice';

const mockMarks = {
  solved: new Set<string>(),
  toggle: jest.fn(),
  isAuthenticated: true,
};
jest.mock('@/hooks/use-content-marks', () => ({
  useContentMarks: () => ({
    ids: () => mockMarks.solved,
    toggle: mockMarks.toggle,
    isAuthenticated: mockMarks.isAuthenticated,
    isLoading: false,
  }),
}));

const exercises: CodingExercise[] = [
  {
    id: 'todo-list',
    title: 'Lista de tareas',
    duration: '30 min',
    statement: ['Armá una `TodoList`'],
    requirements: ['Agregar tareas'],
    followUps: ['¿Cómo la persistirías?'],
    evaluates: 'Estado y eventos',
  },
  {
    id: 'debounce',
    title: 'Debounce',
    duration: '20 min',
    statement: ['Implementá debounce'],
    requirements: ['Cancelar el anterior'],
    followUps: ['¿Y throttle?'],
    evaluates: 'Closures',
  },
];

const leetcode: LeetCodeProblem[] = [
  { slug: 'two-sum', title: 'Two Sum', difficulty: 'Easy', why: 'Hash maps' },
  { slug: 'lru-cache', title: 'LRU Cache', difficulty: 'Medium', why: 'Diseño' },
];

const renderPractice = () =>
  renderInPlatform(
    <LiveCodingPractice
      track="react"
      label="React.js"
      seniorityLabel="Junior"
      exercises={exercises}
      leetcode={leetcode}
    />,
  );

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('LiveCodingPractice', () => {
  beforeEach(() => {
    mockMarks.solved = new Set(['react/debounce', 'two-sum']);
    mockMarks.isAuthenticated = true;
  });

  it('lists exercises and LeetCode problems with progress', () => {
    renderPractice();

    expect(screen.getByText('Lista de tareas')).toBeInTheDocument();
    expect(screen.getByText('TodoList', { selector: 'code' })).toBeInTheDocument();
    expect(screen.getByText('¿Cómo la persistirías?')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Two Sum/ })).toHaveAttribute(
      'href',
      'https://leetcode.com/problems/two-sum/',
    );
    // One solved of two, both for exercises and for problems
    expect(screen.getAllByRole('progressbar', { name: '1 de 2 secciones leídas' })).toHaveLength(2);
    expect(screen.getAllByTitle('Desmarcar como resuelto')).toHaveLength(2);
    expect(screen.queryByRole('link', { name: 'Iniciá sesión' })).not.toBeInTheDocument();
  });

  it('toggles exercises and problems as solved', async () => {
    const user = userEvent.setup();
    renderPractice();

    const [exerciseToggle, problemToggle] = screen.getAllByTitle('Marcar como resuelto');
    await user.click(exerciseToggle);
    expect(mockMarks.toggle).toHaveBeenCalledWith('react/todo-list', 'solved');
    await user.click(problemToggle);
    expect(mockMarks.toggle).toHaveBeenCalledWith('lru-cache', 'solved');
  });

  it('asks visitors to sign in', () => {
    mockMarks.isAuthenticated = false;
    renderPractice();

    expect(screen.getByRole('link', { name: 'Iniciá sesión' })).toBeInTheDocument();
  });
});
