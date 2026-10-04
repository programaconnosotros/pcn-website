import { screen } from '@testing-library/react';
import { fetchErrors, getErrorStats } from '@/actions/errors/fetch-errors';
import { fetchLogs, getLogStats } from '@/actions/logs/fetch-logs';
import { findSession } from '@/lib/session';
import { mockCookies } from '@/test/cookies';
import {
  adminRow,
  expectOnlyPlaceholders,
  renderPage,
  sessionRow,
  thrownBy,
} from '@/test/pages-m-z';
import Loading from './loading';
import { MonitoringClient } from './monitoring-client';
import MonitoreoPage, { metadata } from './page';

jest.mock('next/headers', () => ({ cookies: jest.fn(), headers: jest.fn() }));
jest.mock('@/lib/session', () => ({ findSession: jest.fn() }));
jest.mock('@/actions/errors/fetch-errors', () => ({
  fetchErrors: jest.fn(),
  getErrorStats: jest.fn(),
}));
jest.mock('@/actions/logs/fetch-logs', () => ({ fetchLogs: jest.fn(), getLogStats: jest.fn() }));
jest.mock('./monitoring-client', () => ({ MonitoringClient: jest.fn(() => <p>tablas</p>) }));

const errorsData = {
  errors: [{ id: 'e1' }],
  pagination: { page: 1, limit: 50, total: 1, totalPages: 1 },
};
const logsData = {
  logs: [{ id: 'l1' }],
  pagination: { page: 2, limit: 50, total: 60, totalPages: 2 },
};

const signInAsAdmin = () => {
  mockCookies({ sessionId: 'token' });
  jest.mocked(findSession).mockResolvedValue(adminRow());
  jest.mocked(fetchErrors).mockResolvedValue(errorsData as never);
  jest.mocked(fetchLogs).mockResolvedValue(logsData as never);
  jest.mocked(getErrorStats).mockResolvedValue({
    totalErrors: 1234,
    unresolvedErrors: 7,
    errorsToday: 2,
    errorsThisWeek: 5,
  } as never);
  jest.mocked(getLogStats).mockResolvedValue({
    totalLogs: 60,
    logsByLevel: { info: 40, warn: 10, error: 6, debug: 4 },
  } as never);
};

const page = (searchParams: Record<string, string> = {}) =>
  MonitoreoPage({ searchParams: Promise.resolve(searchParams) });

describe('/monitoreo', () => {
  it('stays out of search engines', () => {
    expect(metadata).toMatchObject({ title: 'sudo htop', robots: { index: false, follow: false } });
  });

  it('sends visitors without a session home', async () => {
    mockCookies();
    expect(await thrownBy(() => page())).toBe('NEXT_REDIRECT:/');
    expect(findSession).not.toHaveBeenCalled();
  });

  it('sends expired sessions and members who are not admins home', async () => {
    mockCookies({ sessionId: 'token' });
    jest.mocked(findSession).mockResolvedValueOnce(null);
    expect(await thrownBy(() => page())).toBe('NEXT_REDIRECT:/');

    jest.mocked(findSession).mockResolvedValueOnce(sessionRow());
    expect(await thrownBy(() => page())).toBe('NEXT_REDIRECT:/');
    expect(fetchErrors).not.toHaveBeenCalled();
  });

  it('shows the error and log stats to admins', async () => {
    signInAsAdmin();
    await renderPage(page());

    expect(screen.getByText(/7 errores sin resolver · 60 logs/)).toBeInTheDocument();
    expect(
      screen.getByText('Total de errores').parentElement!.nextElementSibling,
    ).toHaveTextContent((1234).toLocaleString());
    expect(screen.getByText('Warnings').parentElement!.nextElementSibling).toHaveTextContent('10');
    expect(screen.getByText('tablas')).toBeInTheDocument();
  });

  it('loads the requested pages and level and hands them to the tables', async () => {
    signInAsAdmin();
    await renderPage(page({ errorPage: '3', logPage: '2', logLevel: 'warn' }));

    expect(fetchErrors).toHaveBeenCalledWith(3, 50);
    expect(fetchLogs).toHaveBeenCalledWith(2, 50, 'warn');
    expect(jest.mocked(MonitoringClient).mock.calls[0][0]).toEqual({
      errors: errorsData.errors,
      errorsPagination: errorsData.pagination,
      logs: logsData.logs,
      logsPagination: logsData.pagination,
      logLevel: 'warn',
      logCounts: { total: 60, info: 40, warn: 10, error: 6, debug: 4 },
      unresolvedErrors: 7,
    });
  });

  it('starts at the first page by default and never below it', async () => {
    signInAsAdmin();
    await renderPage(page({ errorPage: '0', logPage: '-4' }));

    expect(fetchErrors).toHaveBeenCalledWith(1, 50);
    expect(fetchLogs).toHaveBeenCalledWith(1, 50, undefined);
  });

  // BUG: src/app/(platform)/monitoreo/page.tsx:95-96 — `Math.max(1, parseInt('abc'))` is NaN, so
  // a hand-edited `?errorPage=abc` asks Prisma for `skip: NaN` and the page crashes.
  it.failing('falls back to the first page when the page number is not a number', async () => {
    signInAsAdmin();
    await renderPage(page({ errorPage: 'abc', logPage: 'x' }));

    expect(fetchErrors).toHaveBeenCalledWith(1, 50);
    expect(fetchLogs).toHaveBeenCalledWith(1, 50, undefined);
  });

  it('shows only placeholders while loading', () => {
    expectOnlyPlaceholders(<Loading />);
  });
});
