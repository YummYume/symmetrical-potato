import { twMerge } from 'tailwind-merge';

export default function FlagFr({ className, ...rest }: Readonly<React.ComponentProps<'svg'>>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 513 342"
      className={twMerge('h-6 w-6', className)}
      {...rest}
    >
      <path fill="#FFF" d="M0 0h513v342H0z" />
      <path fill="#0052B4" d="M0 0h171v342H0z" />
      <path fill="#D80027" d="M342 0h171v342H342z" />
    </svg>
  );
}
