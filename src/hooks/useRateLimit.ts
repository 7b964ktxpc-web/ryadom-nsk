import { useState, useCallback } from "react";

interface RateLimitState {
  requests: number[];
  isLimited: boolean;
  remaining: number;
}

const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_MAX = 100;

export function useRateLimit(windowMs = DEFAULT_WINDOW_MS, max = DEFAULT_MAX) {
  const [state, setState] = useState<RateLimitState>({
    requests: [],
    isLimited: false,
    remaining: max,
  });

  const checkLimit = useCallback(() => {
    const now = Date.now();
    const cutoff = now - windowMs;
    const recent = state.requests.filter((t) => t > cutoff);
    const remaining = max - recent.length;

    setState({ requests: [...recent, now], isLimited: remaining <= 0, remaining });

    return remaining > 0;
  }, [state.requests, windowMs, max]);

  const reset = useCallback(() => {
    setState({ requests: [], isLimited: false, remaining: max });
  }, [max]);

  return { checkLimit, reset, ...state };
}
