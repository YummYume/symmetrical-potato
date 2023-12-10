import { useId } from 'react';
import { twMerge } from 'tailwind-merge';

export default function FlagUk({ className, ...rest }: React.ComponentProps<'svg'>) {
  const clipPathFirstId = useId();
  const clipPathSecondId = useId();

  return (
    <svg
      viewBox="0 0 60 30"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      className={twMerge('clip-path-rounded h-6 w-6', className)}
      {...rest}
    >
      <clipPath id={clipPathFirstId}>
        <path d="M0 0v30h60V0z" />
      </clipPath>
      <clipPath id={clipPathSecondId}>
        <path d="M30 15h30v15zv15H0zH0V0zV0h30z" />
      </clipPath>
      <g clipPath={`url(#${clipPathFirstId})`}>
        <path d="M0 0v30h60V0z" fill="#012169" />
        <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6" />
        <path
          d="M0 0l60 30m0-30L0 30"
          clipPath={`url(#${clipPathSecondId})`}
          stroke="#C8102E"
          strokeWidth="4"
        />
        <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
        <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}
