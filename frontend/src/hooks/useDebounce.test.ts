import { renderHook, act } from '@testing-library/react';
import useDebounce from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 500));
    expect(result.current).toBe('test');
  });

  it('updates the debounced value after the delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    expect(result.current).toBe('initial');

    // Update the value
    rerender({ value: 'updated', delay: 500 });

    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Now the value should be updated
    expect(result.current).toBe('updated');
  });

  it('cancels the previous timeout on value change', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'first', delay: 500 },
      }
    );

    // Update value multiple times
    rerender({ value: 'second', delay: 500 });
    
    act(() => {
      jest.advanceTimersByTime(200);
    });
    
    rerender({ value: 'third', delay: 500 });

    // Value should still be 'first'
    expect(result.current).toBe('first');

    // Fast-forward past the delay
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Value should be the latest 'third', not 'second'
    expect(result.current).toBe('third');
  });

  it('uses the default delay of 300ms', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      {
        initialProps: { value: 'initial' },
      }
    );

    rerender({ value: 'updated' });

    // Should not update after 200ms
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe('initial');

    // Should update after another 100ms (total 300ms)
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe('updated');
  });

  it('works with different types', () => {
    // Number
    const { result: numberResult, rerender: rerenderNumber } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: 0 },
      }
    );

    rerenderNumber({ value: 42 });
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(numberResult.current).toBe(42);

    // Object
    const { result: objResult, rerender: rerenderObj } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: { name: 'initial' } },
      }
    );

    const newObj = { name: 'updated' };
    rerenderObj({ value: newObj });
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(objResult.current).toEqual(newObj);
  });

  it('cleans up timeout on unmount', () => {
    const { unmount } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: 'test' },
      }
    );

    // This should not throw
    unmount();
    
    // Advance time to ensure no errors from dangling timers
    act(() => {
      jest.advanceTimersByTime(500);
    });
  });
});
