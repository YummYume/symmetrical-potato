import { createContext } from 'react';

import type { RefObject } from 'react';

export const ThemeContext = createContext<RefObject<HTMLDivElement> | null>(null);
