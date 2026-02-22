import { isConnected, requestAccess, signMessage } from "@stellar/freighter-api";
import { errorHandler } from "@/lib/errorHandler";

function errorToMessage(error: unknown): string {
  if (!error) return "Unknown error";
  if (typeof error === "string") return error;
  if (typeof error === "object" && "message" in (error as { message?: unknown })) {
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === "string") return msg;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

function categorizeWalletError(error: unknown): { category: string; code: string } {
  const errorMessage = errorToMessage(error).toLowerCase();
  
  // Connection errors
  if (errorMessage.includes("not found") || errorMessage.includes("not detected") || errorMessage.includes("extension")) {
    return { category: "WALLET", code: "NOT_INSTALLED" };
  }
  
  // Connection state errors
  if (errorMessage.includes("not connected") || errorMessage.includes("disconnected")) {
    return { category: "WALLET", code: "NOT_CONNECTED" };
  }
  
  // User rejection errors
  if (errorMessage.includes("rejected") || errorMessage.includes("denied") || errorMessage.includes("cancelled")) {
    return { category: "WALLET", code: "USER_REJECTED" };
  }
  
  // Signing errors
  if (errorMessage.includes("sign") || errorMessage.includes("signature")) {
    return { category: "WALLET", code: "SIGNING_FAILED" };
  }
  
  // Default to generic wallet error
  return { category: "WALLET", code: "GENERIC_ERROR" };
}

function uint8ToBase64(u8: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < u8.length; i += chunkSize) {
    const chunk = u8.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

export async function connectFreighter(): Promise<string> {
  try {
    const connected = await isConnected();
    if (connected.error) {
      const errorInfo = categorizeWalletError(connected.error);
      const appError = errorHandler.handleError(
        errorInfo.category as any,
        errorInfo.code,
        connected.error,
        { operation: "isConnected" }
      );
      throw new Error(appError.message);
    }
    if (!connected.isConnected) {
      const appError = errorHandler.handleError(
        "WALLET",
        "NOT_INSTALLED",
        new Error("Freighter wallet extension not detected"),
        { operation: "isConnected" }
      );
      throw new Error(appError.message);
    }

    const access = await requestAccess();
    if (access.error) {
      const errorInfo = categorizeWalletError(access.error);
      const appError = errorHandler.handleError(
        errorInfo.category as any,
        errorInfo.code,
        access.error,
        { operation: "requestAccess" }
      );
      throw new Error(appError.message);
    }
    if (!access.address) {
      const appError = errorHandler.handleError(
        "WALLET",
        "GENERIC_ERROR",
        new Error("Unable to retrieve wallet address"),
        { operation: "requestAccess" }
      );
      throw new Error(appError.message);
    }

    return access.address;
  } catch (error) {
    // If it's already an AppError message, rethrow it
    if (error instanceof Error && error.message) {
      throw error;
    }
    
    // Handle unexpected errors
    const appError = errorHandler.handleError(
      "WALLET",
      "GENERIC_ERROR",
      error,
      { operation: "connectFreighter" }
    );
    throw new Error(appError.message);
  }
}

export async function signFreighterMessage(address: string, message: string): Promise<{
  signedMessage: string;
  signerAddress: string;
}> {
  try {
    const res = await signMessage(message, { address });
    if (res.error) {
      const errorInfo = categorizeWalletError(res.error);
      const appError = errorHandler.handleError(
        errorInfo.category as any,
        errorInfo.code,
        res.error,
        { operation: "signMessage", address }
      );
      throw new Error(appError.message);
    }
    if (!res.signedMessage) {
      const appError = errorHandler.handleError(
        "WALLET",
        "SIGNING_FAILED",
        new Error("Failed to sign message"),
        { operation: "signMessage", address }
      );
      throw new Error(appError.message);
    }

    const signedMessage =
      typeof res.signedMessage === "string"
        ? res.signedMessage
        : uint8ToBase64(
            res.signedMessage instanceof Uint8Array
              ? res.signedMessage
              : new Uint8Array(res.signedMessage as unknown as ArrayBufferLike),
          );

    return { signedMessage, signerAddress: res.signerAddress };
  } catch (error) {
    // If it's already an AppError message, rethrow it
    if (error instanceof Error && error.message) {
      throw error;
    }
    
    // Handle unexpected errors
    const appError = errorHandler.handleError(
      "WALLET",
      "SIGNING_FAILED",
      error,
      { operation: "signFreighterMessage", address }
    );
    throw new Error(appError.message);
  }
}

export function createAuthMessage(address: string): {
  message: string;
  nonce: string;
  issuedAt: string;
} {
  const issuedAt = new Date().toISOString();
  const bytes = new Uint8Array(16);
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  const nonce = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const message = [
    "Stellar Insured Authentication",
    "",
    "This request will not trigger any blockchain transaction or gas fees.",
    "It only proves that you control this wallet.",
    "",
    `Wallet: ${address}`,
    `Nonce: ${nonce}`,
    `Issued At: ${issuedAt}`,
  ].join("\n");

  return { message, nonce, issuedAt };
}
