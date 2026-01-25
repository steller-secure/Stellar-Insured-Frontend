import { isConnected, requestAccess, signMessage } from "@stellar/freighter-api";

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
  const connected = await isConnected();
  if (connected.error) throw new Error(errorToMessage(connected.error));
  if (!connected.isConnected) throw new Error("Freighter wallet extension not detected");

  const access = await requestAccess();
  if (access.error) throw new Error(errorToMessage(access.error));
  if (!access.address) throw new Error("Unable to retrieve wallet address");

  return access.address;
}

export async function signFreighterMessage(address: string, message: string): Promise<{
  signedMessage: string;
  signerAddress: string;
}> {
  const res = await signMessage(message, { address });
  if (res.error) throw new Error(errorToMessage(res.error));
  if (!res.signedMessage) throw new Error("Failed to sign message");

  const signedMessage =
    typeof res.signedMessage === "string"
      ? res.signedMessage
      : uint8ToBase64(
          res.signedMessage instanceof Uint8Array
            ? res.signedMessage
            : new Uint8Array(res.signedMessage as unknown as ArrayBufferLike),
        );

  return { signedMessage, signerAddress: res.signerAddress };
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
