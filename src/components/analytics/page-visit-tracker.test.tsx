import { render } from '@testing-library/react';
import { trackPageVisit } from '@/actions/analytics/track-page-visit';
import { isOsHost } from '@/components/os/os-env';
import { setLocation } from '@/test/dom';
import { PageVisitTracker } from './page-visit-tracker';

jest.mock('@/actions/analytics/track-page-visit', () => ({ trackPageVisit: jest.fn() }));
jest.mock('@/components/os/os-env', () => ({ isOsHost: jest.fn(() => false) }));

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('PageVisitTracker', () => {
  it('tracks the current page and renders nothing', () => {
    setLocation('/eventos');
    const { container } = render(<PageVisitTracker />);

    expect(trackPageVisit).toHaveBeenCalledWith('/eventos');
    expect(container).toBeEmptyDOMElement();
  });

  it.each(['/api/health', '/_next/static/x.js'])('skips %s', (path) => {
    setLocation(path);
    render(<PageVisitTracker />);

    expect(trackPageVisit).not.toHaveBeenCalled();
  });

  it('does not count the PCN OS desktop as a visit', () => {
    (isOsHost as jest.Mock).mockReturnValueOnce(true);
    setLocation('/');
    render(<PageVisitTracker />);

    expect(trackPageVisit).not.toHaveBeenCalled();
  });
});
