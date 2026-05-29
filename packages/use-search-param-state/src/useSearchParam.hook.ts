import { useCallback, useSyncExternalStore } from 'react';

const URL_CHANGE_EVENT = 'use-search-param-state:urlchange';

// Patch history.pushState / history.replaceState once so any code that mutates the URL
// notifies subscribers. The browser does not fire `popstate` for programmatic history 
// mutations, so we have to bridge it ourselves (monkey patching).
let historyPatched = false;
const patchHistory = () => {
  if (historyPatched || typeof window === 'undefined') return;
  historyPatched = true;

  for (const method of ['pushState', 'replaceState'] as const) {
    const original = window.history[method];
    window.history[method] = function patched(this: History, ...args: Parameters<typeof original>) {
      original.apply(this, args);
      window.dispatchEvent(new Event(URL_CHANGE_EVENT));
    } as typeof original;
  }
};

const subscribe = (onChange: () => void) => {
  patchHistory();
  window.addEventListener('popstate', onChange);
  window.addEventListener('hashchange', onChange);
  window.addEventListener(URL_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener('hashchange', onChange);
    window.removeEventListener(URL_CHANGE_EVENT, onChange);
  };
};

const getServerSnapshot = () => undefined;

export const useSearchParam = (paramName: string) => {
  const getSnapshot = useCallback(
    () => new URLSearchParams(window.location.search).get(paramName) ?? undefined,
    [paramName],
  );

  // useSyncExternalStore re-renders only when the snapshot (the param's string value) changes.
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
