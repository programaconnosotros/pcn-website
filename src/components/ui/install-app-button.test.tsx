import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PwaContext, type InstallGuide, type PwaContextValue } from '@/components/pwa-context';
import { HeroInstallButton, InstallAppButton } from './install-app-button';

const pwa = (overrides: Partial<PwaContextValue> = {}): PwaContextValue => ({
  isInstallable: false,
  isIosInstallable: false,
  canInstall: false,
  installGuide: null,
  installApp: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

const renderWith = (ui: React.ReactElement, value: PwaContextValue) =>
  render(<PwaContext.Provider value={value}>{ui}</PwaContext.Provider>);

describe('InstallAppButton', () => {
  it('triggers the install prompt when available', async () => {
    const value = pwa({ isInstallable: true });
    renderWith(<InstallAppButton className="extra" />, value);
    const button = screen.getByRole('button', { name: 'Instalar app' });
    expect(button).toHaveClass('extra');
    await userEvent.click(button);
    expect(value.installApp).toHaveBeenCalled();
  });

  it('explains the iOS steps when there is no prompt', () => {
    renderWith(<InstallAppButton />, pwa({ isIosInstallable: true }));
    expect(screen.getByText('Compartir → Agregar a inicio')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders nothing once installed', () => {
    const { container } = renderWith(<InstallAppButton />, pwa());
    expect(container).toBeEmptyDOMElement();
  });
});

describe('HeroInstallButton', () => {
  it('renders nothing when the app cannot be installed', () => {
    const { container } = renderWith(<HeroInstallButton />, pwa());
    expect(container).toBeEmptyDOMElement();
  });

  it('installs in one click when the browser offers a prompt', async () => {
    const value = pwa({ canInstall: true, isInstallable: true, installGuide: 'desktop-chromium' });
    renderWith(<HeroInstallButton />, value);
    await userEvent.click(screen.getByRole('button', { name: /instalarApp\(\);/ }));
    expect(value.installApp).toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it.each<[InstallGuide, string, string | null]>([
    ['ios', 'iPhone / iPad', 'Funciona desde Safari'],
    ['android-samsung', 'Samsung Internet', null],
    ['android-firefox', 'Firefox para Android', null],
    ['android', 'Android', null],
    ['mac-safari', 'Safari en macOS', 'Necesita macOS Sonoma'],
    ['desktop-firefox', 'Firefox', null],
    ['desktop-chromium', 'Chrome / Edge', null],
  ])('opens the manual steps for %s', async (installGuide, browser, note) => {
    const value = pwa({ canInstall: true, installGuide });
    renderWith(<HeroInstallButton />, value);
    await userEvent.click(screen.getByRole('button', { name: /instalarApp\(\);/ }));

    const dialog = screen.getByRole('dialog', { name: 'Instalar PCN' });
    expect(dialog).toHaveTextContent(`Desde ${browser}.`);
    expect(dialog).toHaveTextContent('01');
    if (note) expect(dialog).toHaveTextContent(`// ${note}`);
    else expect(dialog).not.toHaveTextContent('//');
    expect(value.installApp).not.toHaveBeenCalled();
  });

  it('gives focus back to the button when the steps are closed with Esc', async () => {
    const user = userEvent.setup();
    renderWith(<HeroInstallButton />, pwa({ canInstall: true, installGuide: 'ios' }));
    const opener = screen.getByRole('button', { name: /instalarApp\(\);/ });
    opener.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('dialog', { name: 'Instalar PCN' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(opener).toHaveFocus());
  });

  it('does not open anything without a guide', async () => {
    renderWith(<HeroInstallButton />, pwa({ canInstall: true }));
    await userEvent.click(screen.getByRole('button', { name: /instalarApp\(\);/ }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
