/**
 * Stellar wallet integration utilities
 */

import { 
  isConnected, 
  signMessage,
  requestAccess
} from '@stellar/freighter-api';

export interface SignedMessage {
  signedMessage: string;
  signerAddress: string;
}

/**
 * Connect to Freighter wallet
 */
export async function connectFreighter(): Promise<string> {
  try {
    const connected = await isConnected();
    if (connected.error) throw new Error(`Connection error: ${connected.error}`);
    if (!connected.isConnected) throw new Error("Freighter wallet extension not detected");

    const access = await requestAccess();
    if (access.error) throw new Error(`Access error: ${access.error}`);
    if (!access.address) throw new Error("Unable to retrieve wallet address");

    return access.address;
  } catch (error) {
    throw new Error(`Failed to connect to Freighter wallet: ${error}`);
  }
}

/**
 * Create authentication message
 */
export function createAuthMessage(address: string): { message: string } {
  const timestamp = Date.now();
  const message = `Stellar Insured Authentication\nAddress: ${address}\nTimestamp: ${timestamp}`;
  
  return { message };
}

/**
 * Sign message with Freighter wallet
 */
export async function signFreighterMessage(
  address: string, 
  message: string
): Promise<SignedMessage> {
  try {
    const res = await signMessage(message, { address });
    if (res.error) throw new Error(`Signing error: ${res.error}`);
    if (!res.signedMessage) throw new Error("Failed to sign message");

    const signedMessage = typeof res.signedMessage === "string"
      ? res.signedMessage
      : Array.from(new Uint8Array(res.signedMessage as unknown as ArrayBufferLike))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
    
    return {
      signedMessage,
      signerAddress: res.signerAddress,
    };
  } catch (error) {
    throw new Error(`Failed to sign message: ${error}`);
  }
}

/**
 * Check if Freighter wallet is available and connected
 */
export async function checkFreighterConnection(): Promise<{
  isAvailable: boolean;
  isConnected: boolean;
  address?: string;
}> {
  try {
    const connectionResult = await isConnected();
    
    if (connectionResult.error) {
      return {
        isAvailable: false,
        isConnected: false,
      };
    }
    
    if (connectionResult.isConnected) {
      const access = await requestAccess();
      return {
        isAvailable: true,
        isConnected: true,
        address: access.address,
      };
    }
    
    return {
      isAvailable: true,
      isConnected: false,
    };
  } catch (error) {
    return {
      isAvailable: false,
      isConnected: false,
    };
  }
}

/**
 * Validate Stellar address format
 */
export function isValidStellarAddress(address: string): boolean {
  // Stellar addresses are 56 characters long and start with 'G'
  return /^G[A-Z2-7]{55}$/.test(address);
}

/**
 * Format Stellar address for display
 */
export function formatStellarAddress(address: string, length: number = 8): string {
  if (!isValidStellarAddress(address)) {
    return address;
  }
  
  if (address.length <= length * 2) {
    return address;
  }
  
  return `${address.slice(0, length)}...${address.slice(-length)}`;
}

/**
 * Get current network details from Freighter
 */
export async function getCurrentNetwork(): Promise<{
  network: string;
  networkPassphrase: string;
}> {
  try {
    // In a real implementation, we would use Freighter API
    // For now, return testnet as default
    return {
      network: 'testnet',
      networkPassphrase: 'Test SDF Network ; September 2015'
    };
  } catch (error) {
    throw new Error(`Failed to get network details: ${error}`);
  }
}

/**
 * Listen for network changes
 */
export function subscribeToNetworkChanges(
  onChange: (newNetwork: string, oldNetwork: string) => void
): () => void {
  let currentNetwork: string | null = null;
  
  // Since Freighter doesn't have a direct event listener, we poll
  const interval = setInterval(async () => {
    try {
      const networkDetails = await getCurrentNetwork();
      const newNetwork = networkDetails.network;
      
      if (currentNetwork && currentNetwork !== newNetwork) {
        onChange(newNetwork, currentNetwork);
      }
      
      currentNetwork = newNetwork;
    } catch (error) {
      // Network detection failed, but don't break the polling
      console.warn('Failed to detect network change:', error);
    }
  }, 5000); // Check every 5 seconds
  
  // Return unsubscribe function
  return () => clearInterval(interval);
}