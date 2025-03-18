interface LogoContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const LogoContainer = ({ children, className = '' }: LogoContainerProps) => (
  <div className={`flex h-6 w-6 items-center justify-center ${className}`}>{children}</div>
);
