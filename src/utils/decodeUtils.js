/**
 * String Decoder Utilities
 *
 * This module provides functions for decoding strings using various methods
 * such as Base64, Hex, ROT13, URL encoding, ASCII/Unicode escapes, and binary.
 */

// Constants for pattern matching and configuration
const PATTERNS = {
  BASE64: /^[A-Za-z0-9+/=]+$/,
  HEX: /^[0-9A-Fa-f]+$/,
  URL_ENCODED: /%[0-9A-Fa-f]{2}/,
  ASCII_ESCAPES: /\\[xu][0-9a-fA-F]+|\\[0-7]{3}/,
  BINARY: /^[01\s]+$/,
  HEX_ESCAPE: /\\x([0-9a-fA-F]{2})/g,
  UNICODE_ESCAPE: /\\u([0-9a-fA-F]{4})/g,
  OCTAL_ESCAPE: /\\([0-7]{3})/g,
  ALPHA: /[a-zA-Z]/g
};

// Configuration constants
const CONFIG = {
  PRINTABLE_RATIO_THRESHOLD: 0.8,
  PREVIEW_LENGTH: 20,
  ENCODING_PRIORITY: ['base64', 'hex', 'url', 'asciiEscapes', 'binary', 'rot13']
};

// Character code ranges
const CHAR_CODES = {
  PRINTABLE_MIN: 32,
  PRINTABLE_MAX: 126,
  UPPERCASE_MIN: 65,
  UPPERCASE_MAX: 90,
  LOWERCASE_MIN: 97
};

/**
 * Create a standard result object for decoder functions
 *
 * @param {boolean} success - Whether decoding was successful
 * @param {string} result - The decoded result or error message
 * @param {Object} extras - Additional properties to include
 * @returns {Object} - Standardized result object
 */
function createResult(success, result, extras = {}) {
  return { success, result, ...extras };
}

/**
 * Create a binary preview for non-printable data
 *
 * @param {Array} bytes - Array of byte values
 * @param {number} totalLength - Total length of the original data
 * @returns {string} - Formatted hex preview
 */
function createBinaryPreview(bytes, totalLength) {
  const preview = bytes
    .slice(0, CONFIG.PREVIEW_LENGTH)
    .map(b => b.toString(16).padStart(2, '0'))
    .join(' ');

  return preview + (totalLength > CONFIG.PREVIEW_LENGTH ? '...' : '');
}

/**
 * Check if decoded content is mostly printable ASCII
 *
 * @param {string} str - The string to check
 * @returns {boolean} - True if mostly printable
 */
function isMostlyPrintable(str) {
  const printableCount = str.split('').filter(char => {
    const code = char.charCodeAt(0);
    return code >= CHAR_CODES.PRINTABLE_MIN && code <= CHAR_CODES.PRINTABLE_MAX;
  }).length;

  return (printableCount / str.length) >= CONFIG.PRINTABLE_RATIO_THRESHOLD;
}

/**
 * Handle binary data by creating a preview
 *
 * @param {Array} bytes - Array of byte values
 * @param {number} totalLength - Total length of the original data
 * @returns {Object} - Result object for binary data
 */
function handleBinaryData(bytes, totalLength) {
  return createResult(false, 'Decoded as binary data (not showing)', {
    isBinary: true,
    binaryPreview: createBinaryPreview(bytes, totalLength)
  });
}

/**
 * Attempts to decode a Base64 encoded string
 *
 * @param {string} str - The string to decode
 * @returns {object} - Object containing success status and decoded result
 */
export function decodeBase64(str) {
  try {
    // Check if the string looks like Base64
    if (!PATTERNS.BASE64.test(str)) {
      return createResult(false, 'Not a valid Base64 string');
    }

    // Try to decode
    const decoded = atob(str);

    // Check if the result contains mostly printable ASCII characters
    if (!isMostlyPrintable(decoded)) {
      const bytes = Array.from(new Uint8Array(decoded.split('').map(c => c.charCodeAt(0))));
      return handleBinaryData(bytes, decoded.length);
    }

    return createResult(true, decoded);
  } catch (error) {
    return createResult(false, `Failed to decode: ${error.message}`);
  }
}

/**
 * Attempts to decode a hexadecimal encoded string
 *
 * @param {string} str - The string to decode
 * @returns {object} - Object containing success status and decoded result
 */
export function decodeHex(str) {
  try {
    // Remove any spaces or non-hex characters
    const cleanHex = str.replace(/[^0-9A-Fa-f]/g, '');

    // Check if we have a valid hex string (must be even length)
    if (cleanHex.length % 2 !== 0 || cleanHex.length === 0) {
      return createResult(false, 'Not a valid hex string (must have even length)');
    }

    // Convert hex to bytes
    const bytes = [];
    for (let i = 0; i < cleanHex.length; i += 2) {
      bytes.push(parseInt(cleanHex.substr(i, 2), 16));
    }

    // Try to convert to a string
    const decoded = bytes.map(b => String.fromCharCode(b)).join('');

    // Check if the result contains mostly printable ASCII characters
    if (!isMostlyPrintable(decoded)) {
      return handleBinaryData(bytes, decoded.length);
    }

    return createResult(true, decoded);
  } catch (error) {
    return createResult(false, `Failed to decode: ${error.message}`);
  }
}

/**
 * Applies ROT13 transformation to a string
 * ROT13 shifts each letter by 13 places in the alphabet
 *
 * @param {string} str - The string to transform
 * @returns {object} - Object containing success status and transformed result
 */
export function decodeRot13(str) {
  try {
    const result = str.replace(PATTERNS.ALPHA, function(char) {
      const code = char.charCodeAt(0);

      // Determine if uppercase or lowercase
      const isUpperCase = code >= CHAR_CODES.UPPERCASE_MIN && code <= CHAR_CODES.UPPERCASE_MAX;
      const base = isUpperCase ? CHAR_CODES.UPPERCASE_MIN : CHAR_CODES.LOWERCASE_MIN;

      // Apply ROT13 transformation (shift by 13)
      return String.fromCharCode(((code - base + 13) % 26) + base);
    });

    return createResult(true, result);
  } catch (error) {
    return createResult(false, `Failed to apply ROT13: ${error.message}`);
  }
}

/**
 * Attempts to decode a URL encoded string
 *
 * @param {string} str - The string to decode
 * @returns {object} - Object containing success status and decoded result
 */
export function decodeUrl(str) {
  try {
    // Check if the string contains URL encoded characters
    if (!PATTERNS.URL_ENCODED.test(str)) {
      return createResult(false, 'No URL encoded characters found');
    }

    const decoded = decodeURIComponent(str);
    return createResult(true, decoded);
  } catch (error) {
    return createResult(false, `Failed to decode URL: ${error.message}`);
  }
}

/**
 * Attempts to decode an ASCII/Unicode escaped string
 * Handles formats like \x## (hex), \u#### (unicode), \### (octal)
 *
 * @param {string} str - The string to decode
 * @returns {object} - Object containing success status and decoded result
 */
export function decodeAsciiEscapes(str) {
  try {
    // Check if the string contains escaped characters
    if (!PATTERNS.ASCII_ESCAPES.test(str)) {
      return createResult(false, 'No ASCII/Unicode escapes found');
    }

    // Replace hex escapes (\xFF)
    let result = str.replace(PATTERNS.HEX_ESCAPE, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    );

    // Replace unicode escapes (\uFFFF)
    result = result.replace(PATTERNS.UNICODE_ESCAPE, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    );

    // Replace octal escapes (\377)
    result = result.replace(PATTERNS.OCTAL_ESCAPE, (_, octal) =>
      String.fromCharCode(parseInt(octal, 8))
    );

    return createResult(true, result);
  } catch (error) {
    return createResult(false, `Failed to decode escapes: ${error.message}`);
  }
}

/**
 * Attempts to decode a binary string (01010101)
 *
 * @param {string} str - The string to decode
 * @returns {object} - Object containing success status and decoded result
 */
export function decodeBinary(str) {
  try {
    // Remove any spaces or non-binary characters
    const cleanBinary = str.replace(/[^01]/g, '');

    // Check if we have a valid binary string
    if (cleanBinary.length % 8 !== 0 || cleanBinary.length === 0) {
      return createResult(false, 'Not a valid binary string (must be multiples of 8 bits)');
    }

    // Convert binary to bytes
    const bytes = [];
    for (let i = 0; i < cleanBinary.length; i += 8) {
      bytes.push(parseInt(cleanBinary.substr(i, 8), 2));
    }

    // Try to convert to a string
    const decoded = bytes.map(b => String.fromCharCode(b)).join('');

    // Check if the result contains mostly printable ASCII characters
    if (!isMostlyPrintable(decoded)) {
      return handleBinaryData(bytes, decoded.length);
    }

    return createResult(true, decoded);
  } catch (error) {
    return createResult(false, `Failed to decode binary: ${error.message}`);
  }
}

/**
 * Attempts to decode a string using various methods
 *
 * @param {string} str - The string to decode
 * @returns {object} - Object containing all decoded variants
 */
export function decodeString(str) {
  if (!str) {
    return {
      original: '',
      successfulDecodings: []
    };
  }

  // Get all decoding results
  const base64Result = decodeBase64(str);
  const hexResult = decodeHex(str);
  const rot13Result = decodeRot13(str);
  const urlResult = decodeUrl(str);
  const asciiEscapesResult = decodeAsciiEscapes(str);
  const binaryResult = decodeBinary(str);

  // Collect successful decodings
  const successfulDecodings = [
    base64Result.success ? 'base64' : null,
    hexResult.success ? 'hex' : null,
    rot13Result.success ? 'rot13' : null,
    urlResult.success ? 'url' : null,
    asciiEscapesResult.success ? 'asciiEscapes' : null,
    binaryResult.success ? 'binary' : null
  ].filter(Boolean);

  // Return comprehensive results
  return {
    original: str,
    base64: base64Result,
    hex: hexResult,
    rot13: rot13Result,
    url: urlResult,
    asciiEscapes: asciiEscapesResult,
    binary: binaryResult,
    successfulDecodings
  };
}

/**
 * Attempts to determine the most likely encoding of a string
 * based on the success of various decoding methods and heuristics
 *
 * @param {string} str - The string to analyze
 * @returns {string} - The most likely encoding method
 */
export function detectEncoding(str) {
  if (!str) return 'unknown';

  const decodingResults = decodeString(str);

  // If we have successful decodings, prioritize them
  if (decodingResults.successfulDecodings.length > 0) {
    // Check each encoding in priority order
    for (const encoding of CONFIG.ENCODING_PRIORITY) {
      if (decodingResults.successfulDecodings.includes(encoding)) {
        return encoding;
      }
    }

    // If none of the priority encodings match, use the first successful one
    return decodingResults.successfulDecodings[0];
  }

  // If no successful decodings, try to guess based on patterns
  if (PATTERNS.BASE64.test(str)) return 'base64';
  if (PATTERNS.HEX.test(str)) return 'hex';
  if (PATTERNS.URL_ENCODED.test(str)) return 'url';
  if (PATTERNS.ASCII_ESCAPES.test(str)) return 'asciiEscapes';
  if (PATTERNS.BINARY.test(str)) return 'binary';

  return 'unknown';
}
