import { act, fireEvent, render, screen } from '@testing-library/react';
import { mockRouter } from '@/test/dom';
import {
  ProfileTabCounts,
  ProfileTabLink,
  ProfileTabPanel,
  ProfileTabs,
  ProfileTabsProvider,
} from './profile-tab-nav';

const renderTabs = (children?: React.ReactNode) =>
  render(
    <ProfileTabsProvider userId="u1" active="resumen">
      <ProfileTabs />
      <ProfileTabCounts counts={{ proyectos: 3 }} />
      {children}
      <ProfileTabPanel>
        <p>contenido</p>
      </ProfileTabPanel>
    </ProfileTabsProvider>,
  );

describe('Profile tabs', () => {
  it('lists every tab with its counts, marking the active one', () => {
    renderTabs();

    const nav = screen.getByRole('navigation', { name: 'Secciones del perfil' });
    expect(nav.querySelectorAll('a')).toHaveLength(9);
    expect(screen.getByRole('link', { name: /resumen/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /resumen/ })).toHaveAttribute('href', '/perfil/u1');
    expect(screen.getByRole('link', { name: /proyectos/ })).toHaveTextContent('proyectos(3)');
    expect(screen.getByRole('link', { name: /proyectos/ })).toHaveAttribute(
      'href',
      '/perfil/u1?tab=proyectos',
    );
    expect(screen.getByText('contenido')).toBeInTheDocument();
  });

  it('switches tabs in place, showing the new tab right away', () => {
    renderTabs();

    act(() => {
      fireEvent.click(screen.getByRole('link', { name: /galería/ }));
    });

    expect(mockRouter.push).toHaveBeenCalledWith('/perfil/u1?tab=fotos', { scroll: false });
  });

  it('ignores clicks on the active tab and modified clicks', () => {
    const onClick = jest.fn();
    renderTabs(
      <ProfileTabLink href="/perfil/u1?tab=nope" onClick={onClick}>
        otra
      </ProfileTabLink>,
    );

    fireEvent.click(screen.getByRole('link', { name: /resumen/ }));
    fireEvent.click(screen.getByRole('link', { name: /charlas/ }), { metaKey: true });
    // An unknown tab means the summary, which is already active
    fireEvent.click(screen.getByRole('link', { name: 'otra' }));

    expect(onClick).toHaveBeenCalled();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('works as a plain link and shows nothing outside the provider', () => {
    const { container } = render(
      <>
        <ProfileTabs />
        <ProfileTabCounts counts={{}} />
        <ProfileTabLink href="/perfil/u1?tab=fotos">fotos</ProfileTabLink>
        <ProfileTabPanel>panel</ProfileTabPanel>
      </>,
    );

    fireEvent.click(screen.getByRole('link', { name: 'fotos' }));
    expect(mockRouter.push).not.toHaveBeenCalled();
    expect(container).toHaveTextContent('fotospanel');
  });
});
