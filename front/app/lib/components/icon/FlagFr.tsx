import { twMerge } from 'tailwind-merge';

export default function FlagFr({ className, ...rest }: React.ComponentProps<'svg'>) {
  return (
    <svg
      viewBox="0 0 3 2"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      className={twMerge('clip-path-rounded h-6 w-6', className)}
      {...rest}
    >
      <path fill="#EC1920" d="M0 0h3v2H0z" />
      <path fill="#fff" d="M0 0h2v2H0z" />
      <path fill="#051440" d="M0 0h1v2H0z" />
    </svg>
  );
}
