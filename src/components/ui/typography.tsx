interface TypographyProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'aszGradient' | 'aszGradientLight';
  ordered?: boolean;
}

const ASZ_GRADIENT_CLASS =
  'bg-gradient-to-b from-asz-blue-light via-asz-blue-medium to-asz-blue-dark bg-clip-text text-transparent';
const ASZ_GRADIENT_LIGHT_CLASS =
  'bg-gradient-to-b from-gray-100 via-gray-200 to-gray-300 bg-clip-text text-transparent';

const GradientText = ({
  children,
  variant = 'aszGradient',
}: {
  children: React.ReactNode;
  variant?: 'aszGradient' | 'aszGradientLight';
}) => (
  <span className={variant === 'aszGradientLight' ? ASZ_GRADIENT_LIGHT_CLASS : ASZ_GRADIENT_CLASS}>
    {children}
  </span>
);

export const Heading1 = ({ children, className = '', variant = 'default' }: TypographyProps) => (
  <h1 className={`scroll-m-20 text-3xl font-semibold leading-tight tracking-tight ${className}`}>
    {variant !== 'default' ? <GradientText variant={variant}>{children}</GradientText> : children}
  </h1>
);

export const Heading2 = ({ children, className = '', variant = 'default' }: TypographyProps) => (
  <h2
    className={`scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0 ${className} mb-4 mt-6`}
  >
    {variant !== 'default' ? <GradientText variant={variant}>{children}</GradientText> : children}
  </h2>
);

export const Heading3 = ({ children, className = '', variant = 'default' }: TypographyProps) => (
  <h3 className={`mt-6 scroll-m-20 text-xl font-semibold tracking-tight ${className}`}>
    {variant !== 'default' ? <GradientText variant={variant}>{children}</GradientText> : children}
  </h3>
);

export const Heading4 = ({ children, className = '', variant = 'default' }: TypographyProps) => (
  <h4 className={`scroll-m-20 text-lg font-semibold tracking-tight ${className}`}>
    {variant !== 'default' ? <GradientText variant={variant}>{children}</GradientText> : children}
  </h4>
);

export const Paragraph = ({ children, className = '' }: TypographyProps) => (
  <p className={`leading-7 [&:not(:first-child)]:mt-6 ${className}`}>{children}</p>
);

export const Blockquote = ({ children, className = '' }: TypographyProps) => (
  <blockquote className={`mt-6 border-l-2 pl-6 italic ${className}`}>{children}</blockquote>
);

export const List = ({ children, className = '', ordered = false }: TypographyProps) => {
  const Tag = ordered ? 'ol' : 'ul';

  return (
    <Tag className={`my-4 ml-6 ${ordered ? 'list-decimal' : 'list-disc'} [&>li]:mt-2 ${className}`}>
      {children}
    </Tag>
  );
};

export const InlineCode = ({ children, className = '' }: TypographyProps) => (
  <code
    className={`relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold ${className}`}
  >
    {children}
  </code>
);

export const Lead = ({ children, className = '' }: TypographyProps) => (
  <p className={`text-xl text-muted-foreground ${className}`}>{children}</p>
);

export const Large = ({ children, className = '' }: TypographyProps) => (
  <p className={`text-lg font-semibold ${className}`}>{children}</p>
);

export const Small = ({ children, className = '' }: TypographyProps) => (
  <p className={`text-sm font-medium leading-none ${className}`}>{children}</p>
);

export const Muted = ({ children, className = '' }: TypographyProps) => (
  <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
);
