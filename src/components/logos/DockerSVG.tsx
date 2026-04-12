interface DockerSVGProps {
  className?: string;
}

export const DockerSVG = ({ className = '' }: DockerSVGProps) => {
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
      <path d="M22 12.54c-1.804 -.345 -2.701 -1.08 -3.523 -2.94c-.487 .696 -1.102 1.568 -.92 2.4c.028 .238 -.32 1 -.557 1h-14c-.38 0 -1 .675 -1 1c0 3.744 1.039 5.358 3.5 6.126c1.947 .61 4.565 .833 7.5 .126c2.935 -.707 5.058 -2.418 6.246 -5.26c.347 -.74 .926 -2.452 2.754 -2.452z" />
      <path d="M5 10h3v3h-3z" />
      <path d="M8 10h3v3h-3z" />
      <path d="M11 10h3v3h-3z" />
      <path d="M8 7h3v3h-3z" />
      <path d="M11 7h3v3h-3z" />
      <path d="M11 4h3v3h-3z" />
      <path d="M14 10h3v3h-3z" />
    </svg>
  );
};
