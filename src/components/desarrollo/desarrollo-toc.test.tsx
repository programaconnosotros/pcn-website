import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DesarrolloToc } from './desarrollo-toc';

jest.mock('@/components/ui/table-of-contents', () => ({
  TableOfContents: ({ sections }: { sections: { id: string; title: string }[] }) => (
    <nav>
      {sections.map((section) => (
        <a key={section.id} href={`#${section.id}`} data-toc-id={section.id}>
          <span>{section.title}</span>
        </a>
      ))}
    </nav>
  ),
}));

describe('DesarrolloToc', () => {
  it('unfolds a stack note when its index entry is clicked', async () => {
    const { getByText, unmount } = render(
      <>
        <DesarrolloToc
          sections={
            [
              { id: 'nota-prisma', title: 'Prisma' },
              { id: 'stack', title: 'Stack' },
            ] as never
          }
        />
        <details id="nota-prisma">
          <summary>Prisma</summary>
        </details>
        <div id="stack" />
      </>,
    );
    const note = document.getElementById('nota-prisma') as HTMLDetailsElement;

    await userEvent.click(getByText('Stack'));
    expect(note.open).toBe(false);

    await userEvent.click(getByText('Prisma', { selector: 'span' }));
    expect(note.open).toBe(true);

    // The listener goes away with the component
    unmount();
  });

  it('does nothing when the linked note is not a <details>', async () => {
    const { getByText } = render(
      <>
        <DesarrolloToc sections={[{ id: 'nota-x', title: 'X' }] as never} />
        <div id="nota-x" />
      </>,
    );
    await userEvent.click(getByText('X'));
    expect(document.getElementById('nota-x')).not.toHaveAttribute('open');
  });
});
