import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { AuthSession, RegisteredUser, ConnectionStatus } from './types';

interface WalletState {
  // Connection state
  status: ConnectionStatus;
  session: AuthSession | null;
  error: string | null;
  
  // User registration
  registeredUsers: Record<string, RegisteredUser>;
  
  // Actions
  setStatus: (status: ConnectionStatus) => void;
  setSession: (session: AuthSession | null) => void;
  setError: (error: string | null) => void;
  signOut: () => void;
  
  // User management
  isAddressRegistered: (address: string) => boolean;
  registerAddress: (address: string, user?: RegisteredUser) => void;
  getRegisteredUser: (address: string) => RegisteredUser | null;
  
  // Connection helpers
  startConnection: () => void;
  completeConnection: (session: AuthSession) => void;
  failConnection: (error: string) => void;
  
  // Reset
  reset: () => void;
}

const initialState = {
  status: 'idle' as ConnectionStatus,
  session: null,
  error: null,
  registeredUsers: {},
};

export const useWalletStore = create<WalletState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Basic setters
        setStatus: (status) => set({ status }, false, 'setStatus'),
        setSession: (session) => set({ session }, false, 'setSession'),
        setError: (error) => set({ error }, false, 'setError'),
        
        // Sign out
        signOut: () => set({ 
          session: null, 
          status: 'idle', 
          error: null 
        }, false, 'signOut'),
        
        // User management
        isAddressRegistered: (address) => {
          const { registeredUsers } = get();
          return address in registeredUsers;
        },
        
        registerAddress: (address, user = { createdAt: Date.now() }) => {
          set((state) => ({
            registeredUsers: {
              ...state.registeredUsers,
              [address]: user
            }
          }), false, 'registerAddress');
        },
        
        getRegisteredUser: (address) => {
          const { registeredUsers } = get();
          return registeredUsers[address] || null;
        },
        
        // Connection flow helpers
        startConnection: () => set({ 
          status: 'connecting', 
          error: null 
        }, false, 'startConnection'),
        
        completeConnection: (session) => set({ 
          session, 
          status: 'connected', 
          error: null 
        }, false, 'completeConnection'),
        
        failConnection: (error) => set({ 
          status: 'error', 
          error, 
          session: null 
        }, false, 'failConnection'),
        
        // Reset all state
        reset: () => set(initialState, false, 'reset'),
      }),
      {
        name: 'wallet-store',
        partialize: (state) => ({
          registeredUsers: state.registeredUsers,
        }),
      }
    ),
    { name: 'WalletStore' }
  )
);