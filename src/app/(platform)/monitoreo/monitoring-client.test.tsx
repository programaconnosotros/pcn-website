import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { markErrorAsResolved } from '@/actions/errors/mark-as-resolved';
import { mockRouter, setLocation } from '@/test/dom';
import { ErrorsClient } from './errors-client';
import { LogsClient, type LogCounts } from './logs-client';
import { MonitoringClient } from './monitoring-client';
import { AsciiBar, formatRelativeTime, prettyJson } from './table-parts';

jest.mock('@/actions/errors/mark-as-resolved', () => ({ markErrorAsResolved: jest.fn() }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const markMock = markErrorAsResolved as jest.Mock;
const ana = { id: 'u1', name: 'Ana', email: 'ana@example.com' };
const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000);

type ErrorRow = Parameters<typeof ErrorsClient>[0]['errors'][number];
type LogRow = Parameters<typeof LogsClient>[0]['logs'][number];

const errorRow = (overrides: Partial<ErrorRow> = {}): ErrorRow => ({
  id: 'e1',
  message: 'TypeError: x is undefined',
  stack: 'at foo (bar.ts:1)',
  path: '/eventos',
  userId: 'u1',
  userAgent: 'Firefox',
  ipAddress: '1.2.3.4',
  metadata: '{"a":1}',
  resolved: false,
  resolvedAt: null,
  createdAt: minutesAgo(5),
  user: ana,
  resolver: null,
  ...overrides,
});

const logRow = (overrides: Partial<LogRow> = {}): LogRow => ({
  id: 'l1',
  level: 'info',
  message: 'usuario logueado',
  path: '/perfil',
  userId: 'u1',
  userAgent: 'Chrome',
  ipAddress: '5.6.7.8',
  metadata: '{"b":2}',
  createdAt: minutesAgo(90),
  user: ana,
  ...overrides,
});

const pagination = (overrides = {}) => ({
  page: 1,
  limit: 50,
  total: 2,
  totalPages: 1,
  ...overrides,
});
const counts: LogCounts = { total: 10, error: 2, warn: 3, info: 4, debug: 1 };

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('table-parts helpers', () => {
  it('formats relative times in buckets', () => {
    expect(formatRelativeTime(new Date())).toBe('recién');
    expect(formatRelativeTime(minutesAgo(5))).toBe('hace 5m');
    expect(formatRelativeTime(minutesAgo(125))).toBe('hace 2h');
    expect(formatRelativeTime(minutesAgo(60 * 24 * 3))).toBe('hace 3d');
  });

  it('pretty prints JSON and keeps malformed strings', () => {
    expect(prettyJson('{"a":1}')).toBe('{\n  "a": 1\n}');
    expect(prettyJson('{oops')).toBe('{oops');
  });

  it('draws a ratio bar even when the total is zero', () => {
    const { container } = render(<AsciiBar value={0} total={0} width={4} />);
    expect(container).toHaveTextContent('░░░░');
  });
});

describe('ErrorsClient', () => {
  beforeEach(() => setLocation('/monitoreo', 'logLevel=warn'));

  it('shows unresolved errors first and switches to resolved ones', async () => {
    const user = userEvent.setup();
    render(
      <ErrorsClient
        errors={[
          errorRow(),
          errorRow({
            id: 'e2',
            message: 'viejo',
            resolved: true,
            resolvedAt: minutesAgo(1),
            resolver: { id: 'u2', name: 'Admin', email: 'a@x.com' },
          }),
        ]}
        pagination={pagination()}
      />,
    );

    expect(screen.getByText('TypeError: x is undefined')).toBeInTheDocument();
    expect(screen.queryByText('viejo')).not.toBeInTheDocument();
    expect(screen.getByText(/\/2 resueltos/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /--resueltos/ }));

    expect(screen.getByText('viejo')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Marcar como resuelto/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ver detalles de viejo' }));
    expect(screen.getByText(/por Admin/)).toBeInTheDocument();
  });

  it('starts on resolved errors when there is nothing unresolved', () => {
    render(
      <ErrorsClient
        errors={[errorRow({ resolved: true, resolvedAt: null, message: 'arreglado' })]}
        pagination={pagination()}
      />,
    );

    expect(screen.getByRole('button', { name: /--resueltos/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByText('arreglado')).toBeInTheDocument();
  });

  it('shows the empty states', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ErrorsClient errors={[]} pagination={pagination({ total: 0 })} />);
    expect(screen.getByText('no hay errores registrados')).toBeInTheDocument();
    expect(screen.getByText('0–0')).toBeInTheDocument();

    rerender(<ErrorsClient errors={[errorRow()]} pagination={pagination()} />);
    await user.click(screen.getByRole('button', { name: /--resueltos/ }));
    expect(screen.getByText('nada resuelto en esta página')).toBeInTheDocument();

    rerender(<ErrorsClient errors={[errorRow({ resolved: true })]} pagination={pagination()} />);
    await user.click(screen.getByRole('button', { name: /--sin-resolver/ }));
    expect(screen.getByText('nada sin resolver en esta página')).toBeInTheDocument();
  });

  it('expands a row with all its details and collapses it again', async () => {
    const user = userEvent.setup();
    render(<ErrorsClient errors={[errorRow()]} pagination={pagination()} />);

    await user.click(screen.getByText('TypeError: x is undefined'));

    const details = document.getElementById('error-details-e1')!;
    expect(within(details).getByText('at foo (bar.ts:1)')).toBeInTheDocument();
    expect(within(details).getByText(/"a": 1/)).toBeInTheDocument();
    expect(within(details).getByText(/ana@example.com/)).toBeInTheDocument();
    expect(within(details).getByText(/1.2.3.4/)).toBeInTheDocument();
    expect(within(details).getByText(/Firefox/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Ocultar detalles/ }));
    expect(document.getElementById('error-details-e1')).toBeNull();
  });

  it('does not toggle the row while text is selected', async () => {
    const user = userEvent.setup();
    const getSelection = jest
      .spyOn(window, 'getSelection')
      .mockReturnValue({ toString: () => 'copiado' } as Selection);
    render(<ErrorsClient errors={[errorRow()]} pagination={pagination()} />);

    await user.click(screen.getByText('TypeError: x is undefined'));

    expect(document.getElementById('error-details-e1')).toBeNull();
    getSelection.mockRestore();
  });

  it('renders minimal rows without optional data', async () => {
    const user = userEvent.setup();
    render(
      <ErrorsClient
        errors={[
          errorRow({
            stack: null,
            metadata: null,
            user: null,
            ipAddress: null,
            userAgent: null,
            path: null,
          }),
        ]}
        pagination={pagination()}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Ver detalles/ }));

    expect(screen.getAllByText('—')).toHaveLength(2);
    expect(screen.queryByText('stack')).not.toBeInTheDocument();
  });

  it('marks an error as resolved and refreshes', async () => {
    markMock.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<ErrorsClient errors={[errorRow()]} pagination={pagination()} />);

    await user.click(screen.getByRole('button', { name: /Marcar como resuelto/ }));

    expect(markMock).toHaveBeenCalledWith('e1');
    expect(toast.success).toHaveBeenCalledWith('Error marcado como resuelto');
    expect(mockRouter.refresh).toHaveBeenCalled();
    expect(document.getElementById('error-details-e1')).toBeNull();
  });

  it.each([
    [new Error('No autorizado'), 'No autorizado'],
    [new Error(''), 'Error al marcar el error como resuelto'],
  ])('reports a failure to resolve (%s)', async (error, message) => {
    markMock.mockRejectedValue(error);
    const user = userEvent.setup();
    render(<ErrorsClient errors={[errorRow()]} pagination={pagination()} />);

    await user.click(screen.getByRole('button', { name: /Marcar como resuelto/ }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(message));
    expect(screen.getByRole('button', { name: /Marcar como resuelto/ })).toBeEnabled();
  });

  it('pages through errors keeping the other params', async () => {
    const user = userEvent.setup();
    render(
      <ErrorsClient
        errors={[errorRow()]}
        pagination={pagination({ page: 2, totalPages: 3, total: 120 })}
      />,
    );

    expect(screen.getByText('51–100')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Página siguiente' }));
    expect(mockRouter.push).toHaveBeenCalledWith('/monitoreo?logLevel=warn&errorPage=3');

    await user.click(screen.getByRole('button', { name: 'Página anterior' }));
    expect(mockRouter.push).toHaveBeenCalledWith('/monitoreo?logLevel=warn&errorPage=1');
  });
});

describe('LogsClient', () => {
  beforeEach(() => setLocation('/monitoreo', 'errorPage=2'));

  it('lists logs with the level counts and expands details', async () => {
    const user = userEvent.setup();
    render(
      <LogsClient
        logs={[
          logRow(),
          logRow({
            id: 'l2',
            level: 'custom',
            message: 'raro',
            metadata: null,
            user: null,
            ipAddress: null,
            userAgent: null,
            path: null,
          }),
        ]}
        pagination={pagination()}
        counts={counts}
      />,
    );

    expect(screen.getByText('tail -n 50 app.log')).toBeInTheDocument();
    expect(screen.getByTitle('2 error')).toBeInTheDocument();
    expect(screen.getByText('custom')).toBeInTheDocument();

    await user.click(screen.getByTitle('usuario logueado'));
    const details = document.getElementById('log-details-l1')!;
    expect(within(details).getByText(/"b": 2/)).toBeInTheDocument();
    expect(within(details).getByText(/5.6.7.8/)).toBeInTheDocument();
    expect(within(details).getByText(/Chrome/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ver detalles de raro' }));
    expect(screen.getByText('sin metadata')).toBeInTheDocument();

    await user.click(screen.getByTitle('usuario logueado'));
    expect(document.getElementById('log-details-l1')).toBeNull();
  });

  it('skips the toggle while text is selected', async () => {
    const user = userEvent.setup();
    const getSelection = jest
      .spyOn(window, 'getSelection')
      .mockReturnValue({ toString: () => 'x' } as Selection);
    render(<LogsClient logs={[logRow()]} pagination={pagination()} counts={counts} />);

    await user.click(screen.getByTitle('usuario logueado'));

    expect(document.getElementById('log-details-l1')).toBeNull();
    getSelection.mockRestore();
  });

  it('filters by level through the URL', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <LogsClient logs={[]} pagination={pagination({ total: 0 })} counts={counts} />,
    );
    expect(screen.getByText('no hay logs registrados')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /--warn/ }));
    expect(mockRouter.push).toHaveBeenCalledWith('/monitoreo?errorPage=2&logPage=1&logLevel=warn', {
      scroll: false,
    });

    rerender(
      <LogsClient
        logs={[]}
        pagination={pagination({ total: 0 })}
        counts={counts}
        logLevel="warn"
      />,
    );
    expect(screen.getByText('grep level=warn app.log')).toBeInTheDocument();
    expect(screen.getByText('no hay logs de nivel warn')).toBeInTheDocument();
  });

  it('clears the level filter and pages', async () => {
    setLocation('/monitoreo', 'logLevel=error&logPage=3');
    const user = userEvent.setup();
    render(
      <LogsClient
        logs={[logRow()]}
        pagination={pagination({ page: 1, totalPages: 2, total: 60 })}
        counts={counts}
        logLevel="error"
      />,
    );

    await user.click(screen.getByRole('button', { name: /--todos/ }));
    expect(mockRouter.push).toHaveBeenCalledWith('/monitoreo?logPage=1', { scroll: false });

    await user.click(screen.getByRole('button', { name: 'Página siguiente' }));
    expect(mockRouter.push).toHaveBeenCalledWith('/monitoreo?logLevel=error&logPage=2', {
      scroll: false,
    });
  });
});

describe('MonitoringClient', () => {
  const props = {
    errors: [errorRow()],
    errorsPagination: pagination(),
    logs: [logRow()],
    logsPagination: pagination(),
    logCounts: { ...counts, total: 1234 },
    unresolvedErrors: 7,
  };

  it('opens on the errors tab and switches to logs', async () => {
    setLocation('/monitoreo');
    const user = userEvent.setup();
    render(<MonitoringClient {...props} />);

    expect(screen.getByRole('tab', { name: /errores/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /errores/ })).toHaveTextContent('(7)');

    await user.click(screen.getByRole('tab', { name: /logs/ }));
    expect(screen.getByText('usuario logueado')).toBeInTheDocument();
  });

  it.each(['logLevel=warn', 'logPage=2'])('opens on the logs tab with ?%s', (search) => {
    setLocation('/monitoreo', search);
    render(<MonitoringClient {...props} logLevel="warn" />);

    expect(screen.getByRole('tab', { name: /logs/ })).toHaveAttribute('aria-selected', 'true');
  });
});
