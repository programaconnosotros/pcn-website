import { render } from '@testing-library/react';
import {
  AccordionSkeleton,
  CardListSkeleton,
  CardRowItem,
  DashboardSkeleton,
  DetailTwoColumnSkeleton,
  FormSkeleton,
  GalleryGridSkeleton,
  PageTitleSkeleton,
  ProfileSkeleton,
  ProseSkeleton,
  RuledGridSkeleton,
  TableSkeleton,
  TitleRowSkeleton,
} from './page-skeletons';

const skeletons = (container: HTMLElement) =>
  container.querySelectorAll('[data-slot="skeleton"], .animate-pulse').length;

describe('page skeletons', () => {
  it('TitleRowSkeleton adds the action placeholder only when asked', () => {
    const without = render(<TitleRowSkeleton />);
    const withAction = render(<TitleRowSkeleton withAction />);
    expect(skeletons(withAction.container)).toBe(skeletons(without.container) + 1);
  });

  it('CardListSkeleton renders `count` rows by default', () => {
    const { container } = render(<CardListSkeleton count={3} />);
    expect(container.firstElementChild!.children).toHaveLength(3);
  });

  it('CardListSkeleton grid variant adds an image placeholder per card when asked', () => {
    const plain = render(<CardListSkeleton variant="grid" count={2} />);
    const withImage = render(<CardListSkeleton variant="grid" count={2} withImage />);
    expect(plain.container.firstElementChild!.children).toHaveLength(2);
    expect(skeletons(withImage.container)).toBe(skeletons(plain.container) + 2);
  });

  it('TableSkeleton renders rows × cols cells plus the header', () => {
    const small = render(<TableSkeleton rows={2} cols={3} />);
    const big = render(<TableSkeleton rows={3} cols={3} />);
    expect(skeletons(big.container) - skeletons(small.container)).toBe(3);
  });

  it.each([
    ['CardRowItem', <CardRowItem key="a" />],
    ['DetailTwoColumnSkeleton', <DetailTwoColumnSkeleton key="b" />],
    ['FormSkeleton', <FormSkeleton rows={2} key="c" />],
    ['ProseSkeleton', <ProseSkeleton paragraphs={2} key="d" />],
    ['ProfileSkeleton', <ProfileSkeleton key="e" />],
    ['AccordionSkeleton', <AccordionSkeleton rows={2} key="f" />],
    ['GalleryGridSkeleton', <GalleryGridSkeleton tiles={3} key="g" />],
    ['DashboardSkeleton', <DashboardSkeleton key="h" />],
    ['RuledGridSkeleton', <RuledGridSkeleton count={2} className="grid-cols-2" key="i" />],
    ['PageTitleSkeleton', <PageTitleSkeleton key="j" />],
  ])('%s renders placeholders', (_name, element) => {
    const { container } = render(element);
    expect(skeletons(container)).toBeGreaterThan(0);
  });

  it('defaults render without props', () => {
    for (const element of [
      <FormSkeleton key="1" />,
      <TableSkeleton key="2" />,
      <ProseSkeleton key="3" />,
      <AccordionSkeleton key="4" />,
      <GalleryGridSkeleton key="5" />,
      <RuledGridSkeleton key="6" />,
      <CardListSkeleton key="7" />,
    ]) {
      const { container, unmount } = render(element);
      expect(skeletons(container)).toBeGreaterThan(0);
      unmount();
    }
  });
});
