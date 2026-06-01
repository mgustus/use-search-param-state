import { act, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchParamStateProvider } from '../src/SearchParamStateProvider';
import type { StandardSchemaV1 } from '../src/standardSchema';
import { useSearchParamState } from '../src/useSearchParamState.hook';

// Minimal Standard Schema mock factory — keeps tests independent of any
// specific validation library (arktype, zod, valibot, etc.).
type MockSchema<T> = StandardSchemaV1<string | undefined, T>;

const makeSchema = <T,>(
  validate: (input: string | undefined) => StandardSchemaV1.Result<T>,
): MockSchema<T> => ({
  '~standard': {
    version: 1,
    vendor: 'mock',
    validate: (input: unknown) => validate(input as string | undefined),
  },
});

const stringSchema: MockSchema<string> = makeSchema<string>((input) => ({
  value: input ?? '',
}));

const optionalStringSchema: MockSchema<string | undefined> = makeSchema<
  string | undefined
>((input) => ({ value: input }));

const numberSchema: MockSchema<number> = makeSchema<number>((input) => {
  const n = Number(input);
  if (Number.isNaN(n)) return { issues: [{ message: 'not a number' }] };
  return { value: n };
});

interface Filters {
  status: string;
  ids: number[];
}
const filtersSchema: MockSchema<Filters> = makeSchema<Filters>((input) => {
  try {
    const parsed = JSON.parse(input ?? '') as Filters;
    return { value: parsed };
  } catch {
    return { issues: [{ message: 'invalid json' }] };
  }
});

describe('useSearchParamState', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('reading', () => {
    it('returns default value when param is missing from URL', () => {
      const { result } = renderHook(() =>
        useSearchParamState('q', stringSchema, 'default'),
      );
      expect(result.current[0]).toBe('default');
    });

    it('returns parsed value when param is present', () => {
      window.history.replaceState({}, '', '/?count=42');
      const { result } = renderHook(() =>
        useSearchParamState('count', numberSchema, 0),
      );
      expect(result.current[0]).toBe(42);
    });

    it('returns default value when validation fails', () => {
      window.history.replaceState({}, '', '/?count=not-a-number');
      const { result } = renderHook(() =>
        useSearchParamState('count', numberSchema, 7),
      );
      expect(result.current[0]).toBe(7);
    });

    it('parses complex JSON object values', () => {
      const filters: Filters = { status: 'active', ids: [1, 2, 3] };
      window.history.replaceState(
        {},
        '',
        `/?filters=${encodeURIComponent(JSON.stringify(filters))}`,
      );
      const { result } = renderHook(() =>
        useSearchParamState('filters', filtersSchema, {
          status: '',
          ids: [],
        }),
      );
      expect(result.current[0]).toEqual(filters);
    });
  });

  describe('returned tuple', () => {
    it('returns a [value, setter] tuple like useState', () => {
      const { result } = renderHook(() =>
        useSearchParamState('q', stringSchema, 'hi'),
      );
      expect(result.current).toHaveLength(2);
      expect(typeof result.current[1]).toBe('function');
    });
  });

  describe('writing', () => {
    it('updates the URL when setter is called with a direct value', () => {
      const { result } = renderHook(() =>
        useSearchParamState('count', numberSchema, 0),
      );

      act(() => {
        result.current[1](5);
      });

      expect(window.location.search).toBe('?count=5');
      expect(result.current[0]).toBe(5);
    });

    it('supports functional updater (prev) => next', () => {
      window.history.replaceState({}, '', '/?count=10');
      const { result } = renderHook(() =>
        useSearchParamState('count', numberSchema, 0),
      );

      act(() => {
        result.current[1]((prev) => (prev ?? 0) + 1);
      });

      expect(window.location.search).toBe('?count=11');
      expect(result.current[0]).toBe(11);
    });

    it('triggers re-render after setting a value', () => {
      const { result } = renderHook(() =>
        useSearchParamState('q', stringSchema, 'default'),
      );
      expect(result.current[0]).toBe('default');

      act(() => {
        result.current[1]('hello');
      });

      expect(result.current[0]).toBe('hello');
    });

    it('JSON-stringifies object values', () => {
      const { result } = renderHook(() =>
        useSearchParamState('filters', filtersSchema, {
          status: '',
          ids: [],
        }),
      );

      const next: Filters = { status: 'pending', ids: [9] };
      act(() => {
        result.current[1](next);
      });

      const expectedQuery = encodeURIComponent(JSON.stringify(next));
      expect(window.location.search).toBe(`?filters=${expectedQuery}`);
      expect(result.current[0]).toEqual(next);
    });
  });

  describe('default value cleanup', () => {
    it('removes the param from URL when value is set to the default', () => {
      window.history.replaceState({}, '', '/?q=something');
      const { result } = renderHook(() =>
        useSearchParamState('q', stringSchema, 'default'),
      );
      expect(result.current[0]).toBe('something');

      act(() => {
        result.current[1]('default');
      });

      expect(window.location.search).toBe('');
      expect(result.current[0]).toBe('default');
    });

    it('removes the param when value is set to undefined', () => {
      window.history.replaceState({}, '', '/?q=something');
      const { result } = renderHook(() =>
        useSearchParamState('q', optionalStringSchema, undefined),
      );

      act(() => {
        result.current[1](undefined);
      });

      expect(window.location.search).toBe('');
    });

    it('treats empty string as removal (param dropped from URL)', () => {
      window.history.replaceState({}, '', '/?q=something');
      const { result } = renderHook(() =>
        useSearchParamState('q', stringSchema, 'default'),
      );

      act(() => {
        result.current[1]('');
      });

      expect(window.location.search).toBe('');
    });

    it('preserves other params when removing one', () => {
      window.history.replaceState({}, '', '/?q=hello&keep=me');
      const { result } = renderHook(() =>
        useSearchParamState('q', stringSchema, 'default'),
      );

      act(() => {
        result.current[1]('default');
      });

      expect(window.location.search).toBe('?keep=me');
    });
  });

  describe('no-op detection', () => {
    it('does not update URL when setting same value', () => {
      window.history.replaceState({}, '', '/?count=5');
      const { result } = renderHook(() =>
        useSearchParamState('count', numberSchema, 0),
      );

      const replaceSpy = vi.spyOn(window.history, 'replaceState');

      act(() => {
        result.current[1](5);
      });

      expect(replaceSpy).not.toHaveBeenCalled();
      replaceSpy.mockRestore();
    });

    it('uses deep equality for objects (no-op when shape matches)', () => {
      const initial: Filters = { status: 'active', ids: [1, 2] };
      window.history.replaceState(
        {},
        '',
        `/?filters=${encodeURIComponent(JSON.stringify(initial))}`,
      );
      const { result } = renderHook(() =>
        useSearchParamState('filters', filtersSchema, {
          status: '',
          ids: [],
        }),
      );

      const replaceSpy = vi.spyOn(window.history, 'replaceState');

      act(() => {
        result.current[1]({ status: 'active', ids: [1, 2] });
      });

      expect(replaceSpy).not.toHaveBeenCalled();
      replaceSpy.mockRestore();
    });
  });

  describe('external URL changes', () => {
    it('reflects external URL changes via pushState', () => {
      const { result } = renderHook(() =>
        useSearchParamState('q', stringSchema, 'default'),
      );
      expect(result.current[0]).toBe('default');

      act(() => {
        window.history.pushState({}, '', '/?q=external');
      });

      expect(result.current[0]).toBe('external');
    });

    it('reflects browser back/forward (popstate)', () => {
      window.history.replaceState({}, '', '/?q=initial');
      const { result } = renderHook(() =>
        useSearchParamState('q', stringSchema, 'default'),
      );
      expect(result.current[0]).toBe('initial');

      act(() => {
        window.history.replaceState({}, '', '/?q=after-back');
        window.dispatchEvent(new PopStateEvent('popstate'));
      });

      expect(result.current[0]).toBe('after-back');
    });
  });

  describe('multiple independent params', () => {
    it('manages separate params without interference', () => {
      const { result: q } = renderHook(() =>
        useSearchParamState('q', stringSchema, 'default-q'),
      );
      const { result: count } = renderHook(() =>
        useSearchParamState('count', numberSchema, 0),
      );

      act(() => {
        q.current[1]('hello');
      });
      act(() => {
        count.current[1](7);
      });

      expect(q.current[0]).toBe('hello');
      expect(count.current[0]).toBe(7);
      const params = new URLSearchParams(window.location.search);
      expect(params.get('q')).toBe('hello');
      expect(params.get('count')).toBe('7');
    });
  });

  describe('async schema rejection', () => {
    it('throws TypeError when validate returns a Promise', () => {
      const asyncSchema: MockSchema<string> = {
        '~standard': {
          version: 1,
          vendor: 'mock-async',
          validate: () => Promise.resolve({ value: 'never' }),
        },
      };

      window.history.replaceState({}, '', '/?q=anything');
      expect(() =>
        renderHook(() => useSearchParamState('q', asyncSchema, 'default')),
      ).toThrow(TypeError);
    });
  });

  describe('options', () => {
    describe('navigate', () => {
      it('per-call navigate is used instead of the default replaceState', () => {
        const navigate = vi.fn();
        const { result } = renderHook(() =>
          useSearchParamState('q', stringSchema, 'default', { navigate }),
        );

        act(() => {
          result.current[1]('hello');
        });

        expect(navigate).toHaveBeenCalledWith('?q=hello');
        // The default navigate (replaceState) was bypassed, so window.location
        // was not mutated by the hook.
        expect(window.location.search).toBe('');
      });

      it('provider navigate is used when no per-call navigate is given', () => {
        const navigate = vi.fn();
        const wrapper = ({ children }: PropsWithChildren) => (
          <SearchParamStateProvider navigate={navigate}>
            {children}
          </SearchParamStateProvider>
        );

        const { result } = renderHook(
          () => useSearchParamState('q', stringSchema, 'default'),
          { wrapper },
        );

        act(() => {
          result.current[1]('hello');
        });

        expect(navigate).toHaveBeenCalledWith('?q=hello');
      });
    });

    describe('onError', () => {
      it('invokes per-call onError when schema validation fails', () => {
        const onError = vi.fn();
        window.history.replaceState({}, '', '/?count=not-a-number');

        renderHook(() =>
          useSearchParamState('count', numberSchema, 0, { onError }),
        );

        expect(onError).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledWith([{ message: 'not a number' }]);
      });

      it('invokes provider onError when no per-call onError is given', () => {
        const onError = vi.fn();
        window.history.replaceState({}, '', '/?count=not-a-number');
        const wrapper = ({ children }: PropsWithChildren) => (
          <SearchParamStateProvider onError={onError}>
            {children}
          </SearchParamStateProvider>
        );

        renderHook(() => useSearchParamState('count', numberSchema, 0), {
          wrapper,
        });

        expect(onError).toHaveBeenCalledTimes(1);
      });

      it('does not invoke onError when validation succeeds', () => {
        const onError = vi.fn();
        window.history.replaceState({}, '', '/?count=42');

        renderHook(() =>
          useSearchParamState('count', numberSchema, 0, { onError }),
        );

        expect(onError).not.toHaveBeenCalled();
      });
    });

    describe('clearOnDefault', () => {
      it('keeps the param in URL when value is set to default and clearOnDefault is false', () => {
        window.history.replaceState({}, '', '/?q=something');
        const { result } = renderHook(() =>
          useSearchParamState('q', stringSchema, 'default', {
            clearOnDefault: false,
          }),
        );

        act(() => {
          result.current[1]('default');
        });

        expect(window.location.search).toBe('?q=default');
        expect(result.current[0]).toBe('default');
      });
    });

    describe('clearOnError', () => {
      it('removes the invalid param from URL on read when clearOnError is true', () => {
        window.history.replaceState({}, '', '/?count=not-a-number');
        const { result } = renderHook(() =>
          useSearchParamState('count', numberSchema, 0, { clearOnError: true }),
        );

        expect(result.current[0]).toBe(0);
        expect(window.location.search).toBe('');
      });

      it('preserves other params when removing the invalid one', () => {
        window.history.replaceState(
          {},
          '',
          '/?count=not-a-number&keep=me',
        );
        renderHook(() =>
          useSearchParamState('count', numberSchema, 0, { clearOnError: true }),
        );

        expect(window.location.search).toBe('?keep=me');
      });

      it('does not touch the URL when clearOnError is false (default)', () => {
        window.history.replaceState({}, '', '/?count=not-a-number');
        renderHook(() => useSearchParamState('count', numberSchema, 0));

        expect(window.location.search).toBe('?count=not-a-number');
      });

      it('invokes onError before clearing the URL', () => {
        const onError = vi.fn();
        window.history.replaceState({}, '', '/?count=not-a-number');

        renderHook(() =>
          useSearchParamState('count', numberSchema, 0, {
            clearOnError: true,
            onError,
          }),
        );

        expect(onError).toHaveBeenCalledTimes(1);
        expect(window.location.search).toBe('');
      });
    });

    describe('precedence', () => {
      it('per-call options override provider options', () => {
        const providerNavigate = vi.fn();
        const callNavigate = vi.fn();
        const wrapper = ({ children }: PropsWithChildren) => (
          <SearchParamStateProvider
            navigate={providerNavigate}
            clearOnDefault={false}
          >
            {children}
          </SearchParamStateProvider>
        );

        const { result } = renderHook(
          () =>
            useSearchParamState('q', stringSchema, 'default', {
              navigate: callNavigate,
            }),
          { wrapper },
        );

        act(() => {
          result.current[1]('hello');
        });

        expect(callNavigate).toHaveBeenCalledWith('?q=hello');
        expect(providerNavigate).not.toHaveBeenCalled();
      });

      it('falls through to library defaults when neither provider nor call set an option', () => {
        // No provider, no per-call options → default navigate (replaceState)
        // and default clearOnDefault: true.
        window.history.replaceState({}, '', '/?q=something');
        const { result } = renderHook(() =>
          useSearchParamState('q', stringSchema, 'default'),
        );

        act(() => {
          result.current[1]('default');
        });

        expect(window.location.search).toBe('');
      });
    });
  });
});
