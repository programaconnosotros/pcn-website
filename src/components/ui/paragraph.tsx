export const Paragraph = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => <p className={`mb-6 leading-7 [&:not(:first-child)]:mt-6 ${className}`}>{children}</p>;
