"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseAutoSaveOptions {
  /** localStorage key */
  key: string;
  /** Debounce interval in ms (default 5000 = 5s) */
  interval?: number;
}

interface UseAutoSaveReturn<T> {
  /** Current value */
  value: T;
  /** Update value (auto-saves after debounce) */
  setValue: (val: T | ((prev: T) => T)) => void;
  /** Whether a draft was restored on mount */
  draftRestored: boolean;
  /** Clear the saved draft */
  clearDraft: () => void;
  /** Manually save immediately */
  saveNow: () => void;
}

/**
 * Auto-saves form input / chat drafts / in-progress work to localStorage.
 * Restores on mount and shows "Draft restored" flag.
 */
export function useAutoSave<T>(
  initialValue: T,
  options: UseAutoSaveOptions
): UseAutoSaveReturn<T> {
  const { key, interval = 5000 } = options;
  const storageKey = `autosave:${key}`;

  const [value, setValueState] = useState<T>(initialValue);
  const [draftRestored, setDraftRestored] = useState(false);
  const latestValue = useRef(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setValueState(parsed);
        latestValue.current = parsed;
        setDraftRestored(true);
      }
    } catch {
      // corrupted data — ignore
    }
  }, [storageKey]);

  // Save function
  const save = useCallback(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(latestValue.current));
    } catch {
      // quota exceeded — silently ignore
    }
  }, [storageKey]);

  // Auto-save on interval
  useEffect(() => {
    timerRef.current = setInterval(save, interval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      save(); // final save on unmount
    };
  }, [save, interval]);

  const setValue = useCallback((val: T | ((prev: T) => T)) => {
    setValueState((prev) => {
      const next = typeof val === "function" ? (val as (prev: T) => T)(prev) : val;
      latestValue.current = next;
      return next;
    });
  }, []);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  }, [storageKey]);

  return { value, setValue, draftRestored, clearDraft, saveNow: save };
}
