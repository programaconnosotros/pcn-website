import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { setIdentityLink } from '@/actions/identity-links/set-identity-link';
import { searchCommunityMembers } from '@/actions/users/search-community-members';
import { renderInPlatform } from '@/test/platform';
import { HISTORIA_FLYERS } from './event-flyers';
import { HistoriaEvents } from './historia-events';
import { HistoriaGallery, HistoriaImage } from './historia-image';
import { HistoriaOrganization } from './historia-organization';
import { HistoriaPeopleProvider, HistoriaPerson, HistoriaTaggingBar } from './historia-person';
import { HistoriaProse, HistoriaSection, HistoriaTimeline } from './historia-section';
import { HISTORIA_ORGANIZATIONS } from './organizations';
import { HISTORIA_PEOPLE } from './people';
import { TableOfContents } from './table-of-contents';

jest.mock('@/actions/identity-links/set-identity-link', () => ({ setIdentityLink: jest.fn() }));
jest.mock('@/actions/users/search-community-members', () => ({
  searchCommunityMembers: jest.fn(),
}));
jest.mock('@/actions/users/search-users-for-speaker', () => ({ searchUsersForSpeaker: jest.fn() }));
jest.mock('@/actions/users/get-user-summary', () => ({
  getUserSummary: jest.fn(() => new Promise(() => {})),
}));
jest.mock('sonner', () => require('@/test/platform').mockSonner());

const setLinkMock = setIdentityLink as jest.Mock;

// Tagging goes through popovers, a combobox and transitions; give it room on a busy machine
jest.setTimeout(20_000);
const agus = { id: 'u1', name: 'Agustín Sánchez', image: null };

describe('historia data', () => {
  it('links every organization and lists the people', () => {
    expect(Object.values(HISTORIA_ORGANIZATIONS).every((url) => url.startsWith('http'))).toBe(true);
    expect(HISTORIA_PEOPLE).toContain('Agustín Sánchez');
  });
});

describe('HistoriaEvents', () => {
  const event = (id: string, flyer: string, photos = 0) => ({
    id,
    name: `Evento ${id}`,
    date: new Date('2024-05-10T22:00:00Z'),
    flyerImages: [flyer],
    photos: Array.from({ length: photos }, (_, i) => ({
      id: `${id}-p${i}`,
      thumbUrl: `/t${i}.jpg`,
      description: i === 0 ? 'Foto con descripción' : null,
    })),
    photoCount: photos,
  });

  it('links the events behind the flyers, once each, with their photos', () => {
    const events = [
      event('e1', HISTORIA_FLYERS.lightningTalks2021, 2),
      event('e2', HISTORIA_FLYERS.lightningTalks2023, 1),
    ];
    render(
      <HistoriaEvents
        flyers={[
          HISTORIA_FLYERS.lightningTalks2021,
          HISTORIA_FLYERS.lightningTalks2021,
          HISTORIA_FLYERS.lightningTalks2023,
          'otro',
        ]}
        events={events}
      />,
    );

    expect(
      screen.getAllByRole('link', { name: /ver evento/ }).map((link) => link.getAttribute('href')),
    ).toEqual(['/eventos/e1', '/eventos/e2']);
    expect(screen.getAllByText('· 10 de mayo de 2024')).toHaveLength(2);
    expect(screen.getAllByRole('img', { name: 'Foto con descripción' })).toHaveLength(2);
    expect(screen.getByRole('img', { name: 'Foto de Evento e1' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /las 2 fotos/ })).toHaveAttribute(
      'href',
      '/galeria?evento=e1',
    );
    expect(screen.getByRole('link', { name: /la foto en la galería/ })).toHaveAttribute(
      'href',
      '/galeria?evento=e2',
    );
  });

  it.each([
    [3, 3],
    [6, 4],
    [8, 8],
    [12, 8],
  ])(
    'shows %i photos as full rows of four (%i), two rows when there are plenty',
    (count, shown) => {
      render(<HistoriaEvents flyers={['f']} events={[event('e1', 'f', count)]} />);
      const photos = screen.getAllByRole('link', { name: /Foto/ });
      expect(photos).toHaveLength(shown);
      // Phones show two rows of two
      expect(photos.filter((link) => link.classList.contains('max-sm:hidden'))).toHaveLength(
        Math.max(0, shown - 4),
      );
    },
  );

  it('renders nothing for events not on the platform and skips photo strips without photos', () => {
    const { container, rerender } = render(<HistoriaEvents flyers={['nada']} events={[]} />);
    expect(container).toBeEmptyDOMElement();

    rerender(<HistoriaEvents flyers={['f']} events={[event('e3', 'f')]} />);
    expect(screen.queryByText(/galería/)).not.toBeInTheDocument();
  });
});

describe('HistoriaImage', () => {
  it('opens an image in a dialog', async () => {
    render(
      <HistoriaGallery
        images={[
          { src: '/a.jpg', alt: 'A' },
          { src: '/b.jpg', alt: 'B' },
        ]}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Ampliar imagen: A' }));

    expect(
      within(screen.getByRole('dialog', { name: 'A' })).getByRole('img', { name: 'A' }),
    ).toHaveAttribute('src', '/a.jpg');
  });

  it('lays out bigger galleries in threes and keeps auto images uncropped', () => {
    const { container } = render(
      <>
        <HistoriaGallery
          aspect="flyer"
          images={[1, 2, 3].map((n) => ({ src: `/${n}.jpg`, alt: `${n}` }))}
        />
        <HistoriaImage src="/x.jpg" alt="x" />
      </>,
    );

    expect(container.firstChild).toHaveClass('sm:grid-cols-3');
    expect(screen.getByRole('img', { name: 'x' })).toHaveClass('h-auto');
  });
});

describe('historia text pieces', () => {
  it('renders sections, prose, organizations and the table of contents', () => {
    Element.prototype.scrollTo = jest.fn() as unknown as typeof Element.prototype.scrollTo;
    renderInPlatform(
      <>
        <TableOfContents />
        <HistoriaTimeline>
          <HistoriaSection id="nibble" title="Nibble" period="2019">
            <p>
              Con <HistoriaOrganization name="IEEE" /> y{' '}
              <HistoriaOrganization name="UTN-FRT">la UTN</HistoriaOrganization>.
            </p>
          </HistoriaSection>
          <HistoriaSection id="sin-fecha" title="Sin fecha">
            <HistoriaProse className="x">texto</HistoriaProse>
          </HistoriaSection>
        </HistoriaTimeline>
      </>,
    );

    expect(screen.getByRole('heading', { name: 'Nibble' })).toBeInTheDocument();
    expect(screen.getByText('[2019]')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'IEEE' })).toHaveAttribute(
      'href',
      'https://www.ieee.org/',
    );
    expect(screen.getByRole('link', { name: 'la UTN' })).toHaveAttribute(
      'title',
      'Ir al sitio de UTN-FRT',
    );
    expect(screen.getAllByRole('link', { name: /Code Warfare/ }).length).toBeGreaterThan(0);
  });
});

describe('HistoriaPerson', () => {
  const renderStory = (isAdmin: boolean, links = {}) =>
    render(
      <HistoriaPeopleProvider links={links} isAdmin={isAdmin}>
        <HistoriaTaggingBar />
        <p>
          <HistoriaPerson name="Agustín Sánchez">Agus</HistoriaPerson> y{' '}
          <HistoriaPerson name="Germán Navarro" /> fundaron la comunidad.
        </p>
        <p>afuera</p>
      </HistoriaPeopleProvider>,
    );

  it('links tagged people and shows the rest as text to visitors', () => {
    renderStory(false, { 'Agustín Sánchez': agus });

    expect(screen.getByRole('link', { name: /Agus/ })).toHaveAttribute('href', '/perfil/u1');
    expect(screen.getByText(/Germán Navarro/)).toBeInTheDocument();
    expect(screen.queryByText(/personas etiquetadas/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Etiquetar/ })).not.toBeInTheDocument();
  });

  it('lets admins tag a person', async () => {
    jest.useFakeTimers();
    setLinkMock.mockResolvedValue(undefined);
    (searchCommunityMembers as jest.Mock).mockResolvedValue([
      { id: 'u2', name: 'Germán N.', image: null },
    ]);
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderStory(true, { 'Agustín Sánchez': agus });

    expect(screen.getByText(/personas etiquetadas/)).toHaveTextContent(
      `1/${HISTORIA_PEOPLE.length}`,
    );
    await user.click(screen.getByRole('button', { name: '--etiquetar' }));
    expect(screen.getByRole('button', { name: 'listo' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByTitle('Etiquetar a Germán Navarro'));
    await user.type(screen.getByRole('textbox', { name: 'etiquetar a…' }), 'germ');
    await act(async () => jest.advanceTimersByTime(200));
    await user.click(screen.getByText('Germán N.'));

    await waitFor(() =>
      expect(setLinkMock).toHaveBeenCalledWith({
        source: 'historia',
        externalName: 'Germán Navarro',
        userId: 'u2',
      }),
    );
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Germán Navarro → Germán N.'));
    // The tag is saved inside a transition, so it shows once the whole action settles
    expect(await screen.findByRole('link', { name: /Germán Navarro/ })).toHaveAttribute(
      'href',
      '/perfil/u2',
    );
    expect(screen.getByText(/personas etiquetadas/)).toHaveTextContent(
      `2/${HISTORIA_PEOPLE.length}`,
    );
    jest.useRealTimers();
  });

  it('removes a tag and closes the panel with Escape or outside clicks', async () => {
    setLinkMock.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderStory(true, { 'Agustín Sánchez': agus });
    await user.click(screen.getByRole('button', { name: '--etiquetar' }));

    await user.click(screen.getByTitle('Agustín Sánchez → Agustín Sánchez'));
    expect(screen.getByRole('textbox', { name: 'cambiar usuario…' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('textbox', { name: 'cambiar usuario…' })).not.toBeInTheDocument();

    await user.click(screen.getByTitle('Agustín Sánchez → Agustín Sánchez'));
    fireEvent.pointerDown(screen.getByText('afuera'));
    expect(screen.queryByRole('textbox', { name: 'cambiar usuario…' })).not.toBeInTheDocument();

    await user.click(screen.getByTitle('Agustín Sánchez → Agustín Sánchez'));
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    await user.click(screen.getByRole('button', { name: 'Quitar etiqueta de Agustín Sánchez' }));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Agustín Sánchez sin etiquetar'),
    );
    await waitFor(() =>
      expect(screen.queryByRole('link', { name: /Agus/ })).not.toBeInTheDocument(),
    );
  });

  it.each([
    [new Error('No autorizado'), 'No autorizado'],
    ['raro', 'No se pudo guardar la etiqueta'],
  ])('restores the tag when saving fails (%s)', async (error, message) => {
    setLinkMock.mockRejectedValue(error);
    const user = userEvent.setup();
    renderStory(true, { 'Agustín Sánchez': agus });
    await user.click(screen.getByRole('button', { name: '--etiquetar' }));

    await user.click(screen.getByTitle('Agustín Sánchez → Agustín Sánchez'));
    await user.click(screen.getByRole('button', { name: 'Quitar etiqueta de Agustín Sánchez' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(message));
    expect(await screen.findByRole('link', { name: /Agus/ })).toBeInTheDocument();
  });
});
