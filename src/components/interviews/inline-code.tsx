import { Fragment } from 'react';

// Interview content marks code with backticks, like Markdown inline code.
export const renderInlineCode = (text: string) =>
  text.split(/`([^`]+)`/).map((part, i) =>
    i % 2 === 1 ? (
      <code key={i} className="rounded-sm bg-pcnGreen/10 px-1 font-mono text-[0.9em] text-pcnGreen">
        {part}
      </code>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
