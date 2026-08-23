import { useState, useEffect, useRef } from 'react';

export type AutosaveStatus = 'idle' | 'typing' | 'saving' | 'saved' | 'error';

interface UseDebouncedAutosaveOptions<T> {
  initialValue: T;
  delay?: number;
  onSave: (value: T) => Promise<void> | void;
}

export function useDebouncedAutosave<T>({
  initialValue,
  delay = 500,
  onSave,
}: UseDebouncedAutosaveOptions<T>) {
  const [value, setValue] = useState<T>(initialValue);
  const [status, setStatus] = useState<AutosaveStatus>('idle');
  const isFirstRender = useRef(true);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setStatus('typing');
    const timer = setTimeout(async () => {
      try {
        setStatus('saving');
        await onSave(value);
        setStatus('saved');
      } catch (err) {
        setStatus('error');
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return {
    value,
    setValue,
    status,
  };
}
