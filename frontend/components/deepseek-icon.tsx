interface DeepSeekIconProps {
  className?: string;
}

export function DeepSeekIcon({ className }: DeepSeekIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="#4D6BFE"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 12C4 7 7.5 4 12 4C16.5 4 19 6.5 19 9.5L21.5 7L19.5 11.5L21.5 16L19 14C19 17.5 16.5 20 12 20C7.5 20 4 16.5 4 12Z" />
    </svg>
  );
}
