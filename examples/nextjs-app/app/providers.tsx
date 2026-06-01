'use client';

import { useRouter } from 'next/navigation';
import { useCallback, type ReactNode } from 'react';
import { SearchParamStateProvider } from 'use-search-param-state';

/**
 * Wires `useSearchParamState` into Next.js App Router so URL changes go through
 * `router.replace` instead of the default `window.history.replaceState`. This
 * lets the server re-render with the new `searchParams` (the SSR badge on the
 * page updates), while `{ scroll: false }` keeps the viewport stable.
 */
export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();

  const navigate = useCallback(
    (url: string) => {
      router.replace(url, { scroll: false });
    },
    [router],
  );

  return (
    <SearchParamStateProvider navigate={navigate}>
      {children}
    </SearchParamStateProvider>
  );
}
