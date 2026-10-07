import { render } from '@testing-library/react';
import {
  CourseRowSkeleton,
  PageTitleSkeleton,
  RuledGridSkeleton,
  SearchBarSkeleton,
  SectionLabelSkeleton,
  TextLineSkeleton,
} from './page-skeletons';

const skeletons = (container: HTMLElement) =>
  container.querySelectorAll('[data-slot="skeleton"], .animate-pulse').length;

describe('page skeletons', () => {
  it('PageTitleSkeleton draws the sidebar toggle, the title and the meta line by default', () => {
    const { container } = render(<PageTitleSkeleton />);
    expect(skeletons(container)).toBe(3);
  });

  it('PageTitleSkeleton drops the meta line when there is none', () => {
    const { container } = render(<PageTitleSkeleton meta={false} />);
    expect(skeletons(container)).toBe(2);
  });

  it('PageTitleSkeleton takes a width class for the meta and renders the action', () => {
    const { container } = render(
      <PageTitleSkeleton meta="w-72" action={<span data-testid="action" />} />,
    );
    expect(container.querySelector('.w-72')).not.toBeNull();
    expect(container.querySelector('[data-testid="action"]')).not.toBeNull();
  });

  it('TextLineSkeleton puts the bar inside a box of the line height', () => {
    const { container } = render(<TextLineSkeleton lineClassName="h-5" className="h-3.5 w-20" />);
    const line = container.firstElementChild!;
    expect(line).toHaveClass('h-5');
    expect(line.firstElementChild).toHaveClass('h-3.5', 'w-20');
    expect(line.firstElementChild).not.toHaveClass('h-3');
  });

  it('SearchBarSkeleton keeps the search bar box and accepts overrides', () => {
    const { container } = render(<SearchBarSkeleton className="max-w-none" />);
    expect(container.firstElementChild).toHaveClass('h-8', 'max-w-none');
    expect(container.firstElementChild).not.toHaveClass('max-w-md');
  });

  it('RuledGridSkeleton renders `count` cells', () => {
    const { container } = render(<RuledGridSkeleton count={3} />);
    expect(container.firstElementChild!.children).toHaveLength(3);
  });

  it.each([
    ['SectionLabelSkeleton', <SectionLabelSkeleton key="a" />],
    ['CourseRowSkeleton', <CourseRowSkeleton key="b" />],
    ['RuledGridSkeleton', <RuledGridSkeleton key="c" />],
  ])('%s renders placeholders', (_name, element) => {
    const { container } = render(element);
    expect(skeletons(container)).toBeGreaterThan(0);
  });
});
