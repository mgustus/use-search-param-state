import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSearchParam } from './useSearchParam.hook';

describe('useSearchParam', () => {
  beforeEach(() => {
    // Reset URL to clean state
    window.history.replaceState({}, '', '/');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return undefined when param is not in URL', () => {
    const { result } = renderHook(() => useSearchParam('foo'));
    expect(result.current).toBeUndefined();
  });

  it('should return the param value when present in URL', () => {
    window.history.replaceState({}, '', '/?foo=bar');
    const { result } = renderHook(() => useSearchParam('foo'));
    expect(result.current).toBe('bar');
  });

  it('should return undefined when param is explicitly empty', () => {
    window.history.replaceState({}, '', '/?foo=');
    const { result } = renderHook(() => useSearchParam('foo'));
    expect(result.current).toBe('');
  });

  it('should handle multiple params independently', () => {
    window.history.replaceState({}, '', '/?foo=bar&baz=qux');
    const { result: result1 } = renderHook(() => useSearchParam('foo'));
    const { result: result2 } = renderHook(() => useSearchParam('baz'));
    expect(result1.current).toBe('bar');
    expect(result2.current).toBe('qux');
  });

  it('should re-render when the specific param changes', () => {
    window.history.replaceState({}, '', '/?foo=bar');
    const { result, rerender } = renderHook(() => useSearchParam('foo'));
    expect(result.current).toBe('bar');

    // Change the param
    act(() => {
      window.history.replaceState({}, '', '/?foo=updated');
    });
    rerender();

    expect(result.current).toBe('updated');
  });

  it('should NOT re-render when a different param changes', () => {
    window.history.replaceState({}, '', '/?foo=bar&baz=qux');
    const { result, rerender } = renderHook(() => useSearchParam('foo'));
    const initialValue = result.current;
    expect(initialValue).toBe('bar');

    // Change a different param
    act(() => {
      window.history.replaceState({}, '', '/?foo=bar&baz=updated');
    });
    rerender();

    // Should still be the same (no re-render)
    expect(result.current).toBe(initialValue);
  });

  it('should re-render when param is deleted', () => {
    window.history.replaceState({}, '', '/?foo=bar');
    const { result, rerender } = renderHook(() => useSearchParam('foo'));
    expect(result.current).toBe('bar');

    // Delete the param
    act(() => {
      window.history.replaceState({}, '', '/');
    });
    rerender();

    expect(result.current).toBeUndefined();
  });

  it('should re-render when param is added', () => {
    window.history.replaceState({}, '', '/');
    const { result, rerender } = renderHook(() => useSearchParam('foo'));
    expect(result.current).toBeUndefined();

    // Add the param
    act(() => {
      window.history.replaceState({}, '', '/?foo=bar');
    });
    rerender();

    expect(result.current).toBe('bar');
  });

  it('should respond to popstate events (browser back/forward)', () => {
    window.history.replaceState({}, '', '/?foo=bar');
    const { result, rerender } = renderHook(() => useSearchParam('foo'));
    expect(result.current).toBe('bar');

    // Simulate back button
    act(() => {
      window.history.replaceState({}, '', '/?foo=old');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    rerender();

    expect(result.current).toBe('old');
  });

  it('should respond to history.pushState', () => {
    window.history.replaceState({}, '', '/?foo=bar');
    const { result, rerender } = renderHook(() => useSearchParam('foo'));
    expect(result.current).toBe('bar');

    act(() => {
      window.history.pushState({}, '', '/?foo=pushed');
    });
    rerender();

    expect(result.current).toBe('pushed');
  });

  it('should respond to history.replaceState', () => {
    window.history.replaceState({}, '', '/?foo=bar');
    const { result, rerender } = renderHook(() => useSearchParam('foo'));
    expect(result.current).toBe('bar');

    act(() => {
      window.history.replaceState({}, '', '/?foo=replaced');
    });
    rerender();

    expect(result.current).toBe('replaced');
  });

  it('should handle URL-encoded values', () => {
    window.history.replaceState({}, '', '/?foo=hello%20world');
    const { result } = renderHook(() => useSearchParam('foo'));
    expect(result.current).toBe('hello world');
  });

  it('should handle special characters', () => {
    window.history.replaceState({}, '', '/?foo=a%2Bb%3Dc');
    const { result } = renderHook(() => useSearchParam('foo'));
    expect(result.current).toBe('a+b=c');
  });

  it('should return the first value if param appears multiple times', () => {
    window.history.replaceState({}, '', '/?foo=first&foo=second');
    const { result } = renderHook(() => useSearchParam('foo'));
    expect(result.current).toBe('first');
  });
});
