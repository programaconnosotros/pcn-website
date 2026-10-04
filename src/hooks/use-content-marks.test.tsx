import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { getContentMarks } from '@/actions/content-marks/get-content-marks';
import { setContentMark } from '@/actions/content-marks/set-content-mark';
import { mockRouter } from '@/test/dom';
import { useContentMarks } from './use-content-marks';

jest.mock('@/actions/content-marks/get-content-marks', () => ({ getContentMarks: jest.fn() }));
jest.mock('@/actions/content-marks/set-content-mark', () => ({ setContentMark: jest.fn() }));
jest.mock('sonner', () => ({ toast: Object.assign(jest.fn(), { error: jest.fn() }) }));

const mockGet = getContentMarks as jest.Mock;
const mockSet = setContentMark as jest.Mock;
const mockToast = toast as unknown as jest.Mock & { error: jest.Mock };

const setup = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return renderHook(() => useContentMarks('article'), { wrapper });
};

describe('useContentMarks', () => {
  it('loads the marks and answers what is marked', async () => {
    mockGet.mockResolvedValue({
      isAuthenticated: true,
      marks: [
        { contentId: 'a1', mark: 'read' },
        { contentId: 'a2', mark: 'read' },
        { contentId: 'a3', mark: 'toRead' },
      ],
    });
    const { result } = setup();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGet).toHaveBeenCalledWith('article');
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.has('a1', 'read' as never)).toBe(true);
    expect(result.current.has('a3', 'read' as never)).toBe(false);
    expect([...result.current.ids('read' as never)]).toEqual(['a1', 'a2']);
    expect(result.current.ids('saved' as never).size).toBe(0);
  });

  it('points anonymous visitors to the login page instead of saving', async () => {
    mockGet.mockResolvedValue({ isAuthenticated: false, marks: [] });
    const { result } = setup();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.toggle('a1', 'read' as never));

    expect(mockSet).not.toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith('Iniciá sesión para guardar tu progreso', {
      action: { label: 'Iniciar sesión', onClick: expect.any(Function) },
    });
    mockToast.mock.calls[0][1].action.onClick();
    expect(mockRouter.push).toHaveBeenCalledWith('/autenticacion/iniciar-sesion');
  });

  it('toggles a mark optimistically and saves it', async () => {
    mockGet.mockResolvedValue({
      isAuthenticated: true,
      marks: [{ contentId: 'a1', mark: 'toRead' }],
    });
    let resolveSave: () => void = () => {};
    mockSet.mockImplementation(() => new Promise<void>((resolve) => (resolveSave = resolve)));
    const { result } = setup();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() =>
      result.current.set([
        { contentId: 'a1', mark: 'read' as never, value: true },
        { contentId: 'a1', mark: 'toRead' as never, value: false },
      ]),
    );

    await waitFor(() => expect(result.current.has('a1', 'read' as never)).toBe(true));
    expect(result.current.has('a1', 'toRead' as never)).toBe(false);
    expect(mockSet).toHaveBeenCalledWith('article', 'a1', 'read', true);

    mockGet.mockResolvedValue({
      isAuthenticated: true,
      marks: [{ contentId: 'a1', mark: 'read' }],
    });
    await act(async () => resolveSave());
    await waitFor(() => expect(mockSet).toHaveBeenCalledWith('article', 'a1', 'toRead', false));
    await act(async () => resolveSave());
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
  });

  it('removes a mark when toggling one that is set', async () => {
    mockGet.mockResolvedValue({
      isAuthenticated: true,
      marks: [{ contentId: 'a1', mark: 'read' }],
    });
    mockSet.mockResolvedValue(undefined);
    const { result } = setup();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.toggle('a1', 'read' as never));

    await waitFor(() => expect(mockSet).toHaveBeenCalledWith('article', 'a1', 'read', false));
  });

  it('rolls back and warns when saving fails', async () => {
    mockGet.mockResolvedValue({ isAuthenticated: true, marks: [] });
    mockSet.mockRejectedValue(new Error('offline'));
    const { result } = setup();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.toggle('a1', 'read' as never));

    await waitFor(() =>
      expect(mockToast.error).toHaveBeenCalledWith('No pudimos guardar el cambio. Probá de nuevo.'),
    );
    await waitFor(() => expect(result.current.has('a1', 'read' as never)).toBe(false));
  });
});
