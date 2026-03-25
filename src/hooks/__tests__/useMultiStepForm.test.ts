import { renderHook, act } from '@testing-library/react';
import { useMultiStepForm } from '../useMultiStepForm';

interface TestData {
  firstName: string;
  lastName: string;
  email: string;
}

const initialData: TestData = {
  firstName: '',
  lastName: '',
  email: '',
};

beforeEach(() => {
  jest.useFakeTimers();
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useMultiStepForm – persistence integration', () => {
  const storageKey = 'test-multistep-draft';

  it('should auto-save form data to localStorage on changes', () => {
    const { result } = renderHook(() =>
      useMultiStepForm<TestData>(initialData, {
        totalSteps: 3,
        storageKey,
        autoSave: true,
      })
    );

    act(() => {
      result.current.updateFormData({ firstName: 'John' });
    });

    // Advance past debounce
    act(() => {
      jest.advanceTimersByTime(600);
    });

    const stored = localStorage.getItem(storageKey);
    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored!);
    expect(parsed.data.firstName).toBe('John');
  });

  it('should restore form data and step on remount', () => {
    // First render: fill data and move to step 2
    const { result, unmount } = renderHook(() =>
      useMultiStepForm<TestData>(initialData, {
        totalSteps: 3,
        storageKey,
        autoSave: true,
      })
    );

    act(() => {
      result.current.updateFormData({ firstName: 'Jane', email: 'jane@test.com' });
      result.current.validateStep(1, { isValid: true, errors: {} });
      result.current.nextStep();
    });

    act(() => {
      jest.advanceTimersByTime(600);
    });

    unmount();

    // Second render: should restore
    const { result: result2 } = renderHook(() =>
      useMultiStepForm<TestData>(initialData, {
        totalSteps: 3,
        storageKey,
        autoSave: true,
      })
    );

    expect(result2.current.formData.firstName).toBe('Jane');
    expect(result2.current.formData.email).toBe('jane@test.com');
    expect(result2.current.currentStep).toBe(2);
    expect(result2.current.isDraft).toBe(true);
  });

  it('should clear draft on form submission (clearDraft)', () => {
    const { result } = renderHook(() =>
      useMultiStepForm<TestData>(initialData, {
        totalSteps: 3,
        storageKey,
        autoSave: true,
      })
    );

    act(() => {
      result.current.updateFormData({ firstName: 'Bob' });
    });

    act(() => {
      jest.advanceTimersByTime(600);
    });

    expect(localStorage.getItem(storageKey)).not.toBeNull();

    act(() => {
      result.current.clearDraft();
    });

    expect(localStorage.getItem(storageKey)).toBeNull();
    expect(result.current.isDraft).toBe(false);
  });

  it('should reset form data and clear draft on resetForm', () => {
    const { result } = renderHook(() =>
      useMultiStepForm<TestData>(initialData, {
        totalSteps: 3,
        storageKey,
        autoSave: true,
      })
    );

    act(() => {
      result.current.updateFormData({ firstName: 'Reset' });
      result.current.validateStep(1, { isValid: true, errors: {} });
      result.current.nextStep();
    });

    act(() => {
      jest.advanceTimersByTime(600);
    });

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.formData).toEqual(initialData);
    expect(result.current.currentStep).toBe(1);
    expect(localStorage.getItem(storageKey)).toBeNull();
  });

  it('should not persist when autoSave is false', () => {
    const { result } = renderHook(() =>
      useMultiStepForm<TestData>(initialData, {
        totalSteps: 3,
        storageKey,
        autoSave: false,
      })
    );

    act(() => {
      result.current.updateFormData({ firstName: 'NoSave' });
    });

    act(() => {
      jest.advanceTimersByTime(600);
    });

    expect(localStorage.getItem(storageKey)).toBeNull();
  });

  it('should not persist when no storageKey is provided', () => {
    const { result } = renderHook(() =>
      useMultiStepForm<TestData>(initialData, {
        totalSteps: 3,
        autoSave: true,
      })
    );

    act(() => {
      result.current.updateFormData({ firstName: 'NoKey' });
    });

    act(() => {
      jest.advanceTimersByTime(600);
    });

    // Nothing should be stored since there's no key
    expect(localStorage.length).toBe(0);
  });

  it('should not restore expired drafts', () => {
    // Manually store an expired draft
    const expired = {
      data: { firstName: 'Old', lastName: '', email: '' },
      currentStep: 3,
      savedAt: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
    };
    localStorage.setItem(storageKey, JSON.stringify(expired));

    const { result } = renderHook(() =>
      useMultiStepForm<TestData>(initialData, {
        totalSteps: 3,
        storageKey,
        autoSave: true,
      })
    );

    // Should NOT restore the expired draft
    expect(result.current.formData).toEqual(initialData);
    expect(result.current.currentStep).toBe(1);
    expect(result.current.isDraft).toBe(false);
  });
});
