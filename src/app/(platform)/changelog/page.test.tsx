import { render } from '@testing-library/react';
import { changelog } from '@/data/changelog';
import { getAdminUser } from '@/lib/admin';
import { getIdentityMap } from '@/lib/identity-links';
import { ChangelogClient } from './changelog-client';
import ChangelogLayout, { metadata } from './layout';
import Loading from './loading';
import ChangelogPage from './page';

jest.mock('@/lib/admin', () => ({ getAdminUser: jest.fn() }));
jest.mock('@/lib/identity-links', () => ({ getIdentityMap: jest.fn() }));
jest.mock('./changelog-client', () => ({ ChangelogClient: jest.fn(() => null) }));

const clientProps = () => jest.mocked(ChangelogClient).mock.calls[0][0];
const adminOnly = changelog.filter((entry) => entry.audience === 'admins');
const login = changelog.flatMap((entry) => entry.authors)[0];
const ana = { id: 'u1', name: 'Ana', image: null };

describe('ChangelogPage', () => {
  beforeEach(() => {
    jest.mocked(getIdentityMap).mockResolvedValue({ [login]: ana });
  });

  it('hides admin-only entries from everyone else and links authors to their profiles', async () => {
    jest.mocked(getAdminUser).mockResolvedValue(null);
    render(await ChangelogPage());

    const { entries, isAdmin } = clientProps();
    expect(getIdentityMap).toHaveBeenCalledWith('github');
    expect(isAdmin).toBe(false);
    expect(entries).toHaveLength(changelog.length - adminOnly.length);
    expect(entries.some((entry) => entry.adminOnly)).toBe(false);
    const authors = entries.flatMap((entry) => entry.authors);
    expect(authors.find((author) => author.login === login)?.user).toEqual(ana);
    expect(authors.filter((author) => author.login !== login).every((a) => !a.user)).toBe(true);
  });

  it('shows admins every entry, newest first', async () => {
    jest.mocked(getAdminUser).mockResolvedValue({ id: 'admin' } as never);
    render(await ChangelogPage());

    const { entries, isAdmin } = clientProps();
    expect(isAdmin).toBe(true);
    expect(entries).toHaveLength(changelog.length);
    const dates = entries.map((entry) => entry.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });
});

describe('changelog layout', () => {
  it('titles the tab like git log and shares a readable card', () => {
    expect(metadata.title).toBe('git log');
    expect(metadata.openGraph).toMatchObject({
      title: 'Changelog | programaConNosotros',
      url: expect.stringMatching(/\/changelog$/),
    });
  });

  it('renders its page untouched', () => {
    const { getByText } = render(
      <ChangelogLayout>
        <p>cambios</p>
      </ChangelogLayout>,
    );
    expect(getByText('cambios')).toBeInTheDocument();
  });
});

describe('changelog loading', () => {
  it('renders only placeholders', () => {
    const { container } = render(<Loading />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    expect(container).toHaveTextContent('');
  });
});
