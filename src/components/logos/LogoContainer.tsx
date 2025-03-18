interface LogoContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const LogoContainer = ({ children, className = "" }: LogoContainerProps) => (
  <div className={`w-6 h-6 flex items-center justify-center ${className}`}>
    {children}
  </div>
); 