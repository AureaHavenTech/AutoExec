"use client";

/**
 * Light haptic feedback for mobile users.
 * Very short buzz (10ms) — subtle confirmation feel.
 * Wrapped in try/catch for unsupported browsers.
 */
export function useHaptic() {
  const buzz = () => {
    try {
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(10);
      }
    } catch {
      // silently ignore — browser doesn't support vibration
    }
  };

  /** Slightly longer buzz for successful actions */
  const success = () => {
    try {
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([10, 30, 10]);
      }
    } catch {
      // silently ignore
    }
  };

  return { buzz, success };
}
