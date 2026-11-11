/**
 * cryptoHelper.js - Native Client-Side Web Crypto API Utilities for Vaultra
 * Uses AES-GCM 256-bit encryption with PBKDF2 key derivation (SHA-256, 100,000 iterations).
 * Zero external dependencies.
 */

const MAGIC_HEADER = 'VAULTRA_V1';
const PBKDF2_ITERATIONS = 100000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

/**
 * Validates and retrieves the SubtleCrypto interface from available environment
 */
function getCrypto() {
  const cryptoObj =
    typeof window !== 'undefined' && window.crypto
      ? window.crypto
      : typeof globalThis !== 'undefined'
      ? globalThis.crypto
      : null;

  if (!cryptoObj || !cryptoObj.subtle) {
    throw new Error(
      'Web Crypto API tidak tersedia. Pastikan aplikasi diakses dalam Secure Context (HTTPS atau http://localhost).'
    );
  }
  return cryptoObj;
}

/**
 * Converts ArrayBuffer to base64 string
 */
function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const btoaFn = typeof window !== 'undefined' && window.btoa ? window.btoa : globalThis.btoa;
  return btoaFn(binary);
}

/**
 * Converts base64 string to Uint8Array
 */
function base64ToBuffer(base64) {
  const atobFn = typeof window !== 'undefined' && window.atob ? window.atob : globalThis.atob;
  const binary = atobFn(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Derives an AES-GCM 256-bit key from a master password and salt using PBKDF2
 */
async function deriveKey(password, salt) {
  const cryptoObj = getCrypto();
  const enc = new TextEncoder();
  const passwordKey = await cryptoObj.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return cryptoObj.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts payload object with master password into a .vaultra container
 * @param {object} payload - JavaScript object/array to encrypt
 * @param {string} masterPassword - Master password chosen by user
 * @returns {Promise<string>} Base64 or JSON-encoded .vaultra file content
 */
export async function encryptVaultData(payload, masterPassword) {
  if (!masterPassword || typeof masterPassword !== 'string' || masterPassword.length < 4) {
    throw new Error('Master Password minimal 4 karakter diperlukan untuk enkripsi.');
  }

  const cryptoObj = getCrypto();
  const enc = new TextEncoder();
  const jsonString = JSON.stringify(payload);
  const dataBytes = enc.encode(jsonString);

  // Generate random 16-byte salt and 12-byte IV
  const salt = cryptoObj.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = cryptoObj.getRandomValues(new Uint8Array(IV_BYTES));

  const key = await deriveKey(masterPassword, salt);

  const ciphertextBuffer = await cryptoObj.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    dataBytes
  );

  const container = {
    format: MAGIC_HEADER,
    algorithm: 'AES-GCM-256-PBKDF2-SHA256',
    iterations: PBKDF2_ITERATIONS,
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
    ciphertext: bufferToBase64(ciphertextBuffer),
    createdAt: new Date().toISOString(),
    itemCount: Array.isArray(payload) ? payload.length : payload?.items?.length || 0,
  };

  return JSON.stringify(container, null, 2);
}

/**
 * Decrypts a .vaultra container string using master password
 * @param {string} encryptedContainerString - Content of .vaultra file
 * @param {string} masterPassword - Password provided by user
 * @returns {Promise<object>} Decrypted payload object
 */
export async function decryptVaultData(encryptedContainerString, masterPassword) {
  if (!masterPassword) {
    throw new Error('Masukkan Master Password untuk mendekripsi berkas cadangan.');
  }

  let container;
  try {
    container = JSON.parse(encryptedContainerString);
  } catch {
    throw new Error('Format berkas .vaultra tidak valid atau rusak.');
  }

  if (container.format !== MAGIC_HEADER) {
    throw new Error('Format berkas tidak dikenali sebagai berkas terenkripsi Vaultra.');
  }

  const cryptoObj = getCrypto();
  const salt = base64ToBuffer(container.salt);
  const iv = base64ToBuffer(container.iv);
  const ciphertext = base64ToBuffer(container.ciphertext);

  try {
    const key = await deriveKey(masterPassword, salt);
    const decryptedBuffer = await cryptoObj.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    const jsonString = dec.decode(decryptedBuffer);
    return JSON.parse(jsonString);
  } catch (err) {
    console.error('Decryption failed:', err);
    throw new Error('Master Password salah atau berkas telah mengalami kerusakan.');
  }
}
