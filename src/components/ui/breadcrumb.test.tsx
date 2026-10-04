import { render, screen } from '@testing-library/react';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './breadcrumb';

describe('Breadcrumb', () => {
  it('renders the trail with links, separators and the current page', () => {
    const { container } = render(
      <Breadcrumb>
        <BreadcrumbList className="extra">
          <BreadcrumbItem>
            <BreadcrumbLink href="/">inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <button type="button">eventos</button>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbPage>detalle</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    expect(screen.getByRole('navigation', { name: 'breadcrumb' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'inicio' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('button', { name: 'eventos' })).toHaveClass('hover:text-foreground');
    expect(screen.getByRole('link', { name: 'detalle' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('More')).toBeInTheDocument();
    expect(screen.getByRole('list')).toHaveClass('extra');
    const separators = container.querySelectorAll('li[role="presentation"]');
    expect(separators).toHaveLength(2);
    expect(separators[0].querySelector('svg')).not.toBeNull();
    expect(separators[1]).toHaveTextContent('/');
  });
});
