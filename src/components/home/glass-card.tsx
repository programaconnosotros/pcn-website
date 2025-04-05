'use client';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

const GlassCard = ({ children, className = '' }: GlassCardProps) => {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const gradient = card.querySelector('.glass-card-gradient-hover') as HTMLDivElement;
    if (!gradient) return;

    // Get mouse position relative to card
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update gradient position
    gradient.style.setProperty('--x', `${x}px`);
    gradient.style.setProperty('--y', `${y}px`);
  };

  return (
    <div className={`group relative max-w-md ${className}`} onMouseMove={handleMouseMove}>
      <div className="glass-card-gradient-hover absolute inset-0 z-0 rounded-xl bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(4,244,190,0.3),rgba(4,244,19,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(99,102,241,0.3),rgba(99,102,241,0))]"></div>
      {children}
    </div>
  );
};

export default GlassCard;
