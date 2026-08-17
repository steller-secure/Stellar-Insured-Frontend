import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { FormState, FormStatus } from './types';

interface FormStoreState {
  // Form states by form ID
  forms: Record<string, FormState>;
  
  // Actions
  setFormStatus: (formId: string, status: FormStatus) => void;
  setFormError: (formId: string, error: string | undefined) => void;
  setFormData: (formId: string, data: unknown) => void;
  setFormState: (formId: string, state: Partial<FormState>) => void;
  getFormState: (formId: string) => FormState;
  resetForm: (formId: string) => void;
  
  // Common form flow helpers
  startSubmission: (formId: string) => void;
  completeSubmission: (formId: string, data?: unknown) => void;
  failSubmission: (formId: string, error: string) => void;
  
  // Bulk operations
  resetAllForms: () => void;
}

const defaultFormState: FormState = {
  status: 'idle',
  error: undefined,
  data: undefined,
};

export const useFormStore = create<FormStoreState>()(
  devtools(
    (set, get) => ({
      forms: {},
      
      // Basic setters
      setFormStatus: (formId, status) => set((state) => ({
        forms: {
          ...state.forms,
          [formId]: { ...defaultFormState, ...state.forms[formId], status }
        }
      }), false, 'setFormStatus'),
      
      setFormError: (formId, error) => set((state) => ({
        forms: {
          ...state.forms,
          [formId]: { ...defaultFormState, ...state.forms[formId], error }
        }
      }), false, 'setFormError'),
      
      setFormData: (formId, data) => set((state) => ({
        forms: {
          ...state.forms,
          [formId]: { ...defaultFormState, ...state.forms[formId], data }
        }
      }), false, 'setFormData'),
      
      setFormState: (formId, newState) => set((state) => ({
        forms: {
          ...state.forms,
          [formId]: { ...defaultFormState, ...state.forms[formId], ...newState }
        }
      }), false, 'setFormState'),
      
      getFormState: (formId) => {
        const { forms } = get();
        return forms[formId] || defaultFormState;
      },
      
      resetForm: (formId) => set((state) => ({
        forms: {
          ...state.forms,
          [formId]: defaultFormState
        }
      }), false, 'resetForm'),
      
      // Form flow helpers
      startSubmission: (formId) => set((state) => ({
        forms: {
          ...state.forms,
          [formId]: { 
            ...defaultFormState, 
            ...state.forms[formId], 
            status: 'loading', 
            error: undefined 
          }
        }
      }), false, 'startSubmission'),
      
      completeSubmission: (formId, data) => set((state) => ({
        forms: {
          ...state.forms,
          [formId]: { 
            ...defaultFormState, 
            ...state.forms[formId], 
            status: 'success', 
            data, 
            error: undefined 
          }
        }
      }), false, 'completeSubmission'),
      
      failSubmission: (formId, error) => set((state) => ({
        forms: {
          ...state.forms,
          [formId]: { 
            ...defaultFormState, 
            ...state.forms[formId], 
            status: 'error', 
            error 
          }
        }
      }), false, 'failSubmission'),
      
      // Bulk operations
      resetAllForms: () => set({ forms: {} }, false, 'resetAllForms'),
    }),
    { name: 'FormStore' }
  )
);