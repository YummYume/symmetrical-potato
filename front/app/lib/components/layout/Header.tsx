import type { ReactNode } from 'react';

export const Header = ({ children }: { children: ReactNode }) => {
  return (
    <header className="sticky top-0 z-10 grid gap-2 bg-slate-1 p-4 shadow-6">{children}</header>
  );
};
