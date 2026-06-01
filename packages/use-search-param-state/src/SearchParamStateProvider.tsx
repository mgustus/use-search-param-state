import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from 'react';
import type { StandardSchemaV1 } from './standardSchema';
import { omitUndefined } from './utils';

/**
 * Options that configure {@link useSearchParamState}.
 *
 * Provide globally via {@link SearchParamStateProvider}, or per-call via the
 * hook's fourth argument. Per-call options override provider options, which
 * override library defaults.
 */
export interface Options {
  /**
   * When `true`, setting the value back to `defaultValue` removes the param
   * from the URL instead of writing the stringified default.
   *
   * @default true
   */
  clearOnDefault?: boolean;

  /**
   * When `true`, an existing URL value that fails schema validation is
   * removed from the URL after the hook reads it. The in-memory value still
   * falls back to `defaultValue` regardless of this flag.
   *
   * @default false
   */
  clearOnError?: boolean;

  /** Invoked when schema validation fails while reading the URL value. */
  onError?: (issues: readonly StandardSchemaV1.Issue[]) => void;

  /**
   * Called whenever the hook needs to update the URL. The default uses
   * `window.history.replaceState`.
   */
  navigate?: (url: string) => void;
}

interface ResolvedOptions {
  clearOnDefault: boolean;
  clearOnError: boolean;
  onError: Options['onError'];
  navigate: (url: string) => void;
}

const DEFAULTS: ResolvedOptions = {
  clearOnDefault: true,
  clearOnError: false,
  onError: undefined,
  navigate: (url: string) => { window.history.replaceState({}, '', url) },
};

const SearchParamStateContext = createContext<Options | undefined>(undefined);

export const SearchParamStateProvider = ({
  children,
  clearOnDefault,
  clearOnError,
  onError,
  navigate,
}: PropsWithChildren<Options>) => {
  const value = useMemo<Options>(
    () => ({ clearOnDefault, clearOnError, onError, navigate }),
    [clearOnDefault, clearOnError, onError, navigate],
  );

  return (
    <SearchParamStateContext.Provider value={value}>
      {children}
    </SearchParamStateContext.Provider>
  );
};

/**
 * Merges per-call options with provider options and library defaults.
 * Precedence: per-call > provider > defaults.
 *
 * @internal
 */
export const useResolvedOptions = (perCall?: Options): ResolvedOptions => {
  const fromContext = useContext(SearchParamStateContext);

  return {
    ...DEFAULTS,
    ...omitUndefined(fromContext),
    ...omitUndefined(perCall),
  };
};
