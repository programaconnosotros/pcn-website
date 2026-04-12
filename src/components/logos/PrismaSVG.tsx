interface PrismaSVGProps {
  className?: string;
}

export const PrismaSVG = ({ className = '' }: PrismaSVGProps) => {
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
      <path d="M4 17l8 5l4 -2.5v-5.5l-4 -2.5l-8 5v5l4 2.5" />
      <path d="M8 14.5l8 -5l4 2.5" />
      <path d="M12 22v-5.5" />
      <path d="M8 14.5v-5.5l4 -2.5l8 5" />
      <path d="M12 9v-5.5l-8 5v5.5" />
    </svg>
  );
};
