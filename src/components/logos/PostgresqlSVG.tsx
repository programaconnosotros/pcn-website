interface PostgresqlSVGProps {
  className?: string;
}

export const PostgresqlSVG = ({ className = '' }: PostgresqlSVGProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M4 8a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4v-8z" />
      <path d="M12 4v10l4 4" />
      <path d="M12 14l-4 4" />
      <path d="M8 8h.01" />
      <path d="M16 8h.01" />
    </svg>
  );
};
