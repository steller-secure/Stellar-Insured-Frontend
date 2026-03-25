import { renderHook } from '@testing-library/react';
import { useUnsavedChanges } from '../useUnsavedChanges';

describe('useUnsavedChanges', () => {
  let addEventListenerSpy: jest.SpyInstance;
  let removeEventListenerSpy: jest.SpyInstance;

  beforeEach(() => {
    addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it('should register beforeunload listener on mount', () => {
    renderHook(() => useUnsavedChanges(true));

    const calls = addEventListenerSpy.mock.calls.filter(
      ([event]: [string]) => event === 'beforeunload'
    );
    expect(calls.length).toBeGreaterThan(0);
  });

  it('should clean up beforeunload listener on unmount', () => {
    const { unmount } = renderHook(() => useUnsavedChanges(true));
    unmount();

    const calls = removeEventListenerSpy.mock.calls.filter(
      ([event]: [string]) => event === 'beforeunload'
    );
    expect(calls.length).toBeGreaterThan(0);
  });

  describe('confirmNavigation', () => {
    it('should return true when no unsaved changes', () => {
      const { result } = renderHook(() => useUnsavedChanges(false));
      expect(result.current.confirmNavigation()).toBe(true);
    });

    it('should call window.confirm when there are unsaved changes', () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
      const { result } = renderHook(() => useUnsavedChanges(true));

      const allowed = result.current.confirmNavigation();

      expect(confirmSpy).toHaveBeenCalledWith(
        'You have unsaved changes. Are you sure you want to leave?'
      );
      expect(allowed).toBe(true);
      confirmSpy.mockRestore();
    });

    it('should return false when user cancels confirmation', () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
      const { result } = renderHook(() => useUnsavedChanges(true));

      expect(result.current.confirmNavigation()).toBe(false);
      confirmSpy.mockRestore();
    });

    it('should use custom message', () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
      const customMsg = 'Draft will be lost!';
      const { result } = renderHook(() => useUnsavedChanges(true, customMsg));

      result.current.confirmNavigation();
      expect(confirmSpy).toHaveBeenCalledWith(customMsg);
      confirmSpy.mockRestore();
    });
  });

  describe('beforeunload behavior', () => {
    it('should call preventDefault when there are unsaved changes', () => {
      renderHook(() => useUnsavedChanges(true));

      const handler = addEventListenerSpy.mock.calls.find(
        ([event]: [string]) => event === 'beforeunload'
      )?.[1];

      const event = new Event('beforeunload');
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

      handler(event);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should not call preventDefault when no unsaved changes', () => {
      renderHook(() => useUnsavedChanges(false));

      const handler = addEventListenerSpy.mock.calls.find(
        ([event]: [string]) => event === 'beforeunload'
      )?.[1];

      const event = new Event('beforeunload');
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

      handler(event);
      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });
});
