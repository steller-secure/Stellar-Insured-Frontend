import { renderHook, act } from '@testing-library/react';
import { useForm, useForms } from '../useForm';
import { useFormStore } from '@/store';

// Mock the form store
jest.mock('@/store', () => ({
  useFormStore: jest.fn(),
}));

const mockUseFormStore = useFormStore as jest.MockedFunction<typeof useFormStore>;

const makeStoreMock = (overrides = {}) => ({
  setFormStatus: jest.fn(),
  setFormError: jest.fn(),
  setFormData: jest.fn(),
  setFormState: jest.fn(),
  getFormState: jest.fn(() => ({
    status: 'idle',
    error: undefined,
    data: null,
  })),
  resetForm: jest.fn(),
  startSubmission: jest.fn(),
  completeSubmission: jest.fn(),
  failSubmission: jest.fn(),
  resetAllForms: jest.fn(),
  ...overrides,
});

describe('useForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFormStore.mockReturnValue(makeStoreMock() as any);
  });

  // ──────────────────────────────────────────────────────────
  // Initial State
  // ──────────────────────────────────────────────────────────
  describe('Initial State', () => {
    it('returns idle status by default', () => {
      const { result } = renderHook(() => useForm('test-form'));

      expect(result.current.status).toBe('idle');
      expect(result.current.isIdle).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('returns null data and undefined error initially', () => {
      const { result } = renderHook(() => useForm('test-form'));

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeUndefined();
    });

    it('calls getFormState with the provided formId', () => {
      const storeMock = makeStoreMock();
      mockUseFormStore.mockReturnValue(storeMock as any);

      renderHook(() => useForm('my-form-id'));

      expect(storeMock.getFormState).toHaveBeenCalledWith('my-form-id');
    });
  });

  // ──────────────────────────────────────────────────────────
  // Status Transitions
  // ──────────────────────────────────────────────────────────
  describe('Status Actions', () => {
    it('setStatus calls setFormStatus with correct args', () => {
      const storeMock = makeStoreMock();
      mockUseFormStore.mockReturnValue(storeMock as any);

      const { result } = renderHook(() => useForm('test-form'));

      act(() => { result.current.setStatus('loading'); });

      expect(storeMock.setFormStatus).toHaveBeenCalledWith('test-form', 'loading');
    });

    it('startLoading calls startSubmission', () => {
      const storeMock = makeStoreMock();
      mockUseFormStore.mockReturnValue(storeMock as any);

      const { result } = renderHook(() => useForm('test-form'));

      act(() => { result.current.startLoading(); });

      expect(storeMock.startSubmission).toHaveBeenCalledWith('test-form');
    });

    it('setSuccess calls completeSubmission', () => {
      const storeMock = makeStoreMock();
      mockUseFormStore.mockReturnValue(storeMock as any);

      const { result } = renderHook(() => useForm('test-form'));
      const mockData = { response: 'ok' };

      act(() => { result.current.setSuccess(mockData); });

      expect(storeMock.completeSubmission).toHaveBeenCalledWith('test-form', mockData);
    });

    it('setFailure calls failSubmission with error message', () => {
      const storeMock = makeStoreMock();
      mockUseFormStore.mockReturnValue(storeMock as any);

      const { result } = renderHook(() => useForm('test-form'));

      act(() => { result.current.setFailure('Submission failed'); });

      expect(storeMock.failSubmission).toHaveBeenCalledWith('test-form', 'Submission failed');
    });

    it('reset calls resetForm with formId', () => {
      const storeMock = makeStoreMock();
      mockUseFormStore.mockReturnValue(storeMock as any);

      const { result } = renderHook(() => useForm('test-form'));

      act(() => { result.current.reset(); });

      expect(storeMock.resetForm).toHaveBeenCalledWith('test-form');
    });
  });

  // ──────────────────────────────────────────────────────────
  // setError / setData / setState
  // ──────────────────────────────────────────────────────────
  describe('Error and Data Setters', () => {
    it('setError calls setFormError with formId and error', () => {
      const storeMock = makeStoreMock();
      mockUseFormStore.mockReturnValue(storeMock as any);

      const { result } = renderHook(() => useForm('test-form'));

      act(() => { result.current.setError('Invalid input'); });

      expect(storeMock.setFormError).toHaveBeenCalledWith('test-form', 'Invalid input');
    });

    it('setError can clear error by passing undefined', () => {
      const storeMock = makeStoreMock();
      mockUseFormStore.mockReturnValue(storeMock as any);

      const { result } = renderHook(() => useForm('test-form'));

      act(() => { result.current.setError(undefined); });

      expect(storeMock.setFormError).toHaveBeenCalledWith('test-form', undefined);
    });

    it('setData calls setFormData', () => {
      const storeMock = makeStoreMock();
      mockUseFormStore.mockReturnValue(storeMock as any);

      const { result } = renderHook(() => useForm('test-form'));
      const formData = { name: 'Alice', email: 'alice@example.com' };

      act(() => { result.current.setData(formData); });

      expect(storeMock.setFormData).toHaveBeenCalledWith('test-form', formData);
    });

    it('setState calls setFormState with partial state', () => {
      const storeMock = makeStoreMock();
      mockUseFormStore.mockReturnValue(storeMock as any);

      const { result } = renderHook(() => useForm('test-form'));

      act(() => { result.current.setState({ status: 'loading' }); });

      expect(storeMock.setFormState).toHaveBeenCalledWith('test-form', { status: 'loading' });
    });
  });

  // ──────────────────────────────────────────────────────────
  // submitForm
  // ──────────────────────────────────────────────────────────
  describe('submitForm()', () => {
    it('calls startSubmission, runs fn, then calls completeSubmission on success', async () => {
      const storeMock = makeStoreMock();
      mockUseFormStore.mockReturnValue(storeMock as any);

      const { result } = renderHook(() => useForm('test-form'));
      const mockResult = { id: 42 };
      const submitFn = jest.fn().mockResolvedValue(mockResult);

      let returnValue: unknown;
      await act(async () => {
        returnValue = await result.current.submitForm(submitFn);
      });

      expect(storeMock.startSubmission).toHaveBeenCalledWith('test-form');
      expect(storeMock.completeSubmission).toHaveBeenCalledWith('test-form', mockResult);
      expect(returnValue).toEqual(mockResult);
    });

    it('calls failSubmission and returns null on error', async () => {
      const storeMock = makeStoreMock();
      mockUseFormStore.mockReturnValue(storeMock as any);

      const { result } = renderHook(() => useForm('test-form'));
      const submitFn = jest.fn().mockRejectedValue(new Error('Submit failed'));

      let returnValue: unknown;
      await act(async () => {
        returnValue = await result.current.submitForm(submitFn);
      });

      expect(storeMock.startSubmission).toHaveBeenCalledWith('test-form');
      expect(storeMock.failSubmission).toHaveBeenCalledWith('test-form', 'Submit failed');
      expect(returnValue).toBeNull();
    });

    it('uses a fallback error message for non-Error rejections', async () => {
      const storeMock = makeStoreMock();
      mockUseFormStore.mockReturnValue(storeMock as any);

      const { result } = renderHook(() => useForm('test-form'));
      const submitFn = jest.fn().mockRejectedValue('unexpected');

      await act(async () => {
        await result.current.submitForm(submitFn);
      });

      expect(storeMock.failSubmission).toHaveBeenCalledWith(
        'test-form',
        'Submission failed'
      );
    });
  });

  // ──────────────────────────────────────────────────────────
  // Computed Status Flags
  // ──────────────────────────────────────────────────────────
  describe('Computed status flags', () => {
    const statusCases = [
      { status: 'loading', flag: 'isLoading' },
      { status: 'success', flag: 'isSuccess' },
      { status: 'error',   flag: 'isError' },
      { status: 'idle',    flag: 'isIdle' },
    ] as const;

    statusCases.forEach(({ status, flag }) => {
      it(`${flag} is true when status is "${status}"`, () => {
        mockUseFormStore.mockReturnValue(
          makeStoreMock({
            getFormState: jest.fn(() => ({ status, error: undefined, data: null })),
          }) as any
        );

        const { result } = renderHook(() => useForm('test-form'));

        expect(result.current[flag]).toBe(true);
      });
    });
  });
});

// ──────────────────────────────────────────────────────────
// useForms
// ──────────────────────────────────────────────────────────
describe('useForms', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('aggregates states for multiple form IDs', () => {
    const storeMock = makeStoreMock({
      getFormState: jest.fn((id: string) => ({
        status: id === 'form-a' ? 'loading' : 'idle',
        error: undefined,
        data: null,
      })),
    });
    mockUseFormStore.mockReturnValue(storeMock as any);

    const { result } = renderHook(() => useForms(['form-a', 'form-b']));

    expect(result.current.forms['form-a'].status).toBe('loading');
    expect(result.current.forms['form-b'].status).toBe('idle');
    expect(result.current.isAnyLoading).toBe(true);
  });

  it('hasAnyError is true when at least one form has error status', () => {
    const storeMock = makeStoreMock({
      getFormState: jest.fn((id: string) => ({
        status: id === 'form-a' ? 'error' : 'idle',
        error: 'Something went wrong',
        data: null,
      })),
    });
    mockUseFormStore.mockReturnValue(storeMock as any);

    const { result } = renderHook(() => useForms(['form-a', 'form-b']));

    expect(result.current.hasAnyError).toBe(true);
    expect(result.current.isAnyLoading).toBe(false);
  });

  it('areAllSuccess is true when every form has success status', () => {
    const storeMock = makeStoreMock({
      getFormState: jest.fn(() => ({ status: 'success', error: undefined, data: {} })),
    });
    mockUseFormStore.mockReturnValue(storeMock as any);

    const { result } = renderHook(() => useForms(['form-a', 'form-b']));

    expect(result.current.areAllSuccess).toBe(true);
  });

  it('exposes resetAll as resetAllForms', () => {
    const storeMock = makeStoreMock();
    mockUseFormStore.mockReturnValue(storeMock as any);

    const { result } = renderHook(() => useForms(['form-a']));

    act(() => { result.current.resetAll(); });

    expect(storeMock.resetAllForms).toHaveBeenCalled();
  });
});
