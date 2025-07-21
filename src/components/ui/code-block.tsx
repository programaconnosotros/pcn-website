import React from 'react';
import { Highlight, themes, Language } from 'prism-react-renderer';

interface CodeBlockProps {
  code: string;
  language?: Language;
  className?: string;
}

const customTheme = {
  ...themes.nightOwl,
  plain: {
    ...themes.nightOwl.plain,
    backgroundColor: '#000000',
  },
};

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'typescript', className }) => 
  (
    <div className={`my-4 w-full`}>
      {language && (
        <div className="mb-2 w-full text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
          {language}
        </div>
      )}

      <div
        className={`relative w-full overflow-x-auto rounded-none border border-neutral-800 bg-black p-4 font-mono text-sm ${className || ''}`}
        style={{
          fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        }}
      >
        <Highlight
          theme={customTheme}
          code={code}
          language={language}
        >
          {({ style, tokens, getLineProps, getTokenProps }) => (
            <div className="flex">
              <div className="mr-4 select-none border-r border-neutral-800 pr-4 text-right text-neutral-500">
                {tokens.map((_, index: number) => (
                  <div key={index} className="leading-6">
                    {index + 1}
                  </div>
                ))}
              </div>

              <pre className="flex flex-col" style={style}>
                {tokens.map((line, i: number) => (
                  <div key={i} {...getLineProps({ line })} className="leading-6">
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </div>
                ))}
              </pre>
            </div>
          )}
        </Highlight>
      </div>
    </div>
  );