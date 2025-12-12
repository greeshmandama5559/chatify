import { create } from "zustand";

const KeyPassword = import.meta.env.VITE_CRYPTO_PASSWORD || "";

async function deriveKey(salt) {
  // normalize salt to ArrayBuffer
  let saltBuf;
  if (!salt) throw new Error("Salt is required to derive key.");
  if (salt instanceof ArrayBuffer) saltBuf = salt;
  else if (salt instanceof Uint8Array) saltBuf = salt.buffer;
  else throw new Error("Invalid salt type for deriveKey.");

  const enc = new TextEncoder();
  if (!KeyPassword) throw new Error("Password is required for encryption/decryption.");

  const pwKey = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(KeyPassword),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBuf,
      iterations: 100000,
      hash: "SHA-256",
    },
    pwKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export const useCryptoStore = create((set, get) => ({
  cipherText: "",
  decryptedTex: "",
  error: "",

  arrayBufferToBase64: (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  },

  base64ToArrayBuffer: (base64) => {
    try {
      const binary = window.atob(base64);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes.buffer;
    } catch (err) {
      console.error("base64ToArrayBuffer failed:", err);
      throw err;
    }
  },

  encryptMessage: async (plaintext) => {
    set({ error: "" });
    try {
      if (!KeyPassword) {
        const message = "VITE_CRYPTO_PASSWORD missing. Set VITE_CRYPTO_PASSWORD in your .env";
        console.error(message);
        throw new Error(message);
      }
      const enc = new TextEncoder();
      const salt = window.crypto.getRandomValues(new Uint8Array(16)); // 16 bytes
      const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 12 bytes for GCM

      const key = await deriveKey(salt);

      const ciphertextBuffer = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        enc.encode(plaintext)
      );

      // concatenate salt + iv + ciphertext
      const saltIvCt = new Uint8Array(
        salt.byteLength + iv.byteLength + ciphertextBuffer.byteLength
      );
      saltIvCt.set(salt, 0);
      saltIvCt.set(iv, salt.byteLength);
      saltIvCt.set(
        new Uint8Array(ciphertextBuffer),
        salt.byteLength + iv.byteLength
      );

      const b64 = get().arrayBufferToBase64(saltIvCt.buffer);
      set({ cipherText: b64 });
      set({ decryptedTex: "" });
      return b64;
    } catch (err) {
      console.error("encryptMessage failed:", err);
      set({ error: err.message || String(err) });
      return null;
    }
  },

  /**
   * Decrypts a base64 ciphertext produced by encryptMessage.
   * Returns plaintext string on success, or null on failure.
   * Does NOT throw so it is safe to call from render-effect callers.
   */
  decryptMessage: async (cipherText) => {
    set({ error: "" });
    if (!cipherText) {
      // nothing to decrypt
      return null;
    }
    try {
      if (!KeyPassword) {
        const message = "VITE_CRYPTO_PASSWORD missing. Decryption cannot proceed.";
        console.error(message);
        set({ error: message });
        return null;
      }

      const combined = new Uint8Array(get().base64ToArrayBuffer(cipherText));
      if (combined.length < 28) {
        const errMsg = "Ciphertext too short to decrypt.";
        console.error(errMsg, { length: combined.length });
        set({ error: errMsg });
        return null;
      }

      const salt = combined.slice(0, 16); // first 16 bytes
      const iv = combined.slice(16, 28); // next 12 bytes
      const ct = combined.slice(28); // remainder

      const key = await deriveKey(salt);
      const plainBuffer = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv.buffer },
        key,
        ct.buffer
      );

      const dec = new TextDecoder();
      const plaintext = dec.decode(plainBuffer);

      set({ decryptedTex: plaintext });
      return plaintext;
    } catch (err) {
      console.error("decryptMessage failed:", err);
      const message = "Decryption failed: " + (err.message || String(err));
      set({ error: message });
      // return null for callers that expect nullability
      return null;
    }
  },
}));
