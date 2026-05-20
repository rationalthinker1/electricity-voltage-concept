import { useEffect, useRef } from 'react';

/**
 * Bridge React state into a ref so animation loops can read the latest
 * values without causing re-renders or re-binding callbacks.
 *
 * This replaces the boilerplate that appears in ~95% of demos:
 *
 *   const stateRef = useRef({ rpm });
 *   useEffect(() => { stateRef.current.rpm = rpm; }, [rpm]);
 *
 * With useSimState it becomes a single line:
 *
 *   const stateRef = useSimState({ rpm, voltage, computed });
 *
 * The returned ref is always current — safe to read inside a
 * requestAnimationFrame loop or AutoResizeCanvas setup callback.
 */
export function useSimState<T>(state: T): React.MutableRefObject<T> {
  const ref = useRef(state);
  useEffect(() => {
    ref.current = state;
  }, [state]);
  return ref;
}
