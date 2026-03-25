import { renderHook, act } from '@testing-library/react';
import { useFormPersistence } from '../useFormPersistence';

interface TestFormData {
  name: string;
  email: string;
}

// Use fake timers globally for debounce control
beforeEach(() => {
  jest.useFakeTimers();
  sessionStorage.clear();
  localStorage.clear();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useFormPersistence', () => {
  const defaultConfig = {
    storageKey: 'test-form-draft',
  };

  const sampleData: TestFormData = { name: 'Alice', email: 'alice@example.com' };

  describe('save and load', () => {
    it('should save form data and load it back', () => {
      const { result } = renderHook(() =>
        useFormPersistence<TestFormData>(defaultConfig)
      );

      act(() => {
        result.current.save(sampleData, 2);
        jest.advanceTimersByTime(600); // flush debounce
      });

      const loaded = result.current.load();
      expect(loaded).not.toBeNull();
      expect(loaded!.data).toEqual(sampleData);
      expect(loaded!.currentStep).toBe(2);
    });

    it('should return null when no draft exists', () => {
      const { result } = renderHook(() =>
        useFormPersistence<TestFormData>(defaultConfig)
      );

      expect(result.current.load()).toBeNull();
    });

    it('should persist current step index', () => {
      const { result } = renderHook(() =>
        useFormPersistence<TestFormData>(defaultConfig)
      );

      act(() => {
        result.current.save(sampleData, 4);
        jest.advanceTimersByTime(600);
      });

      const loaded = result.current.load();
      expect(loaded!.currentStep).toBe(4);
    });
  });

  describe('expiry / TTL', () => {
    it('should clear expired drafts after TTL (24 hours default)', () => {
      const { result } = renderHook(() =>
        useFormPersistence<TestFormData>(defaultConfig)
      );

      act(() => {
        result.current.save(sampleData, 1);
        jest.advanceTimersByTime(600);
      });

      // Advance system time by 25 hours
      const twentyFiveHours = 25 * 60 * 60 * 1000;
      jest.spyOn(Date, 'now').mockReturnValue(Date.now() + twentyFiveHours);

      const loaded = result.current.load();
      expect(loaded).toBeNull();

      jest.restoreAllMocks();
    });

    it('should load valid drafts within TTL', () => {
      const { result } = renderHook(() =>
        useFormPersistence<TestFormData>(defaultConfig)
      );

      act(() => {
        result.current.save(sampleData, 1);
        jest.advanceTimersByTime(600);
      });

      // Advance by 1 hour (within default 24h TTL)
      const oneHour = 60 * 60 * 1000;
      jest.spyOn(Date, 'now').mockReturnValue(Date.now() + oneHour);

      const loaded = result.current.load();
      expect(loaded).not.toBeNull();
      expect(loaded!.data).toEqual(sampleData);

      jest.restoreAllMocks();
    });

    it('should support custom TTL', () => {
      const { result } = renderHook(() =>
        useFormPersistence<TestFormData>({
          ...defaultConfig,
          ttl: 5000, // 5 seconds
        })
      );

      act(() => {
        result.current.save(sampleData, 1);
        jest.advanceTimersByTime(600);
      });

      // Advance by 6 seconds
      jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 6000);

      expect(result.current.load()).toBeNull();

      jest.restoreAllMocks();
    });
  });

  describe('clear', () => {
    it('should remove persisted data from storage', () => {
      const { result } = renderHook(() =>
        useFormPersistence<TestFormData>(defaultConfig)
      );

      act(() => {
        result.current.save(sampleData, 3);
        jest.advanceTimersByTime(600);
      });

      act(() => {
        result.current.clear();
      });

      expect(result.current.load()).toBeNull();
      expect(result.current.hasDraft).toBe(false);
    });
  });

  describe('hasDraft', () => {
    it('should be false initially when no draft exists', () => {
      const { result } = renderHook(() =>
        useFormPersistence<TestFormData>(defaultConfig)
      );

      expect(result.current.hasDraft).toBe(false);
    });

    it('should detect existing draft on mount', () => {
      // Pre-populate storage
      const persisted = {
        data: sampleData,
        currentStep: 2,
        savedAt: Date.now(),
      };
      sessionStorage.setItem(defaultConfig.storageKey, JSON.stringify(persisted));

      const { result } = renderHook(() =>
        useFormPersistence<TestFormData>(defaultConfig)
      );

      expect(result.current.hasDraft).toBe(true);
    });
  });

  describe('debouncing', () => {
    it('should debounce rapid saves', () => {
      const { result } = renderHook(() =>
        useFormPersistence<TestFormData>({
          ...defaultConfig,
          debounceMs: 300,
        })
      );

      act(() => {
        result.current.save({ name: 'A', email: 'a@a.com' }, 1);
        result.current.save({ name: 'AB', email: 'a@a.com' }, 1);
        result.current.save({ name: 'ABC', email: 'a@a.com' }, 1);
      });

      // Before debounce fires, nothing in storage
      expect(sessionStorage.getItem(defaultConfig.storageKey)).toBeNull();

      act(() => {
        jest.advanceTimersByTime(400);
      });

      // Only the last value should be persisted
      const loaded = result.current.load();
      expect(loaded!.data.name).toBe('ABC');
    });

    it('should flush pending saves immediately when flush() is called', () => {
      const { result } = renderHook(() =>
        useFormPersistence<TestFormData>(defaultConfig)
      );

      act(() => {
        result.current.save(sampleData, 2);
        result.current.flush();
      });

      // Saved immediately without waiting for debounce
      const loaded = result.current.load();
      expect(loaded).not.toBeNull();
      expect(loaded!.data).toEqual(sampleData);
    });
  });

  describe('localStorage option', () => {
    it('should use localStorage when useLocalStorage is true', () => {
      const { result } = renderHook(() =>
        useFormPersistence<TestFormData>({
          ...defaultConfig,
          useLocalStorage: true,
        })
      );

      act(() => {
        result.current.save(sampleData, 1);
        jest.advanceTimersByTime(600);
      });

      expect(localStorage.getItem(defaultConfig.storageKey)).not.toBeNull();
      expect(sessionStorage.getItem(defaultConfig.storageKey)).toBeNull();
    });
  });

  describe('corrupt data handling', () => {
    it('should return null and clean up for corrupted storage data', () => {
      sessionStorage.setItem(defaultConfig.storageKey, 'not-valid-json{{{');

      const { result } = renderHook(() =>
        useFormPersistence<TestFormData>(defaultConfig)
      );

      expect(result.current.load()).toBeNull();
      expect(sessionStorage.getItem(defaultConfig.storageKey)).toBeNull();
    });
  });

  describe('lastSavedAt', () => {
    it('should update lastSavedAt after a save', () => {
      const { result } = renderHook(() =>
        useFormPersistence<TestFormData>(defaultConfig)
      );

      expect(result.current.lastSavedAt).toBeNull();

      act(() => {
        result.current.save(sampleData, 1);
        jest.advanceTimersByTime(600);
      });

      expect(result.current.lastSavedAt).not.toBeNull();
      expect(typeof result.current.lastSavedAt).toBe('number');
    });
  });
});
