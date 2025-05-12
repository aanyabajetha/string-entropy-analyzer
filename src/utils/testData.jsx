/**
 * Test data for the String Entropy Analyzer
 *
 * This file contains sample code snippets with various encoded strings
 * for testing the entropy analyzer components.
 * @file
 */ // lines 44 and 65 commented out

// Sample code with various encoded strings
export const sampleCode = `
// This is a sample code snippet with various encoded strings

// Base64 encoded string (Hello, World!)
const base64String = "SGVsbG8sIFdvcmxkIQ==";

// Hex encoded string (Hello, World!)
const hexString = "48656c6c6f2c20576f726c6421";

// URL encoded string
const urlEncodedString = "Hello%2C%20World%21";

// ROT13 encoded string
const rot13String = "Uryyb, Jbeyq!";

// ASCII/Unicode escaped string
const asciiEscapedString = "\\x48\\x65\\x6c\\x6c\\x6f\\x2c\\x20\\x57\\x6f\\x72\\x6c\\x64\\x21";

// Binary string (not actually used in real code, but for testing)
const binaryString = "01001000 01100101 01101100 01101100 01101111 00101100 00100000 01010111 01101111 01110010 01101100 01100100 00100001";

// A suspicious looking obfuscated string (actually just base64 encoded JavaScript)
const suspiciousCode = "ZnVuY3Rpb24gZXZhbFN0cmluZyhzdHIpIHsgZXZhbChzdHIpOyB9";

// A high-entropy string that looks like encryption
const encryptedData = "U2FsdGVkX1/X8/Hx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx";

// A string with mixed encodings
const mixedEncodingString = "SGVsbG8sIFdvcmxkIQ== and 48656c6c6f2c20576f726c6421";

// Normal text with low entropy
const normalText = "This is just a normal string with relatively low entropy.";

// API key (high entropy) - using a fake key for testing
const apiKey = "TEST_API_KEY_XXXXXXXXXXXXX_EXAMPLE_ONLY";


// JWT token (high entropy)
const jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

// Potentially malicious code (base64 encoded eval)
const maliciousCode = "ZXZhbChhdG9iKCJhbGVydCgnWFNTIEF0dGFjaycpIikp";
`;

// Export some individual strings for component testing
export const testStrings = {
  base64: "SGVsbG8sIFdvcmxkIQ==",
  hex: "48656c6c6f2c20576f726c6421",
  url: "Hello%2C%20World%21",
  rot13: "Uryyb, Jbeyq!",
  asciiEscaped: "\\x48\\x65\\x6c\\x6c\\x6f\\x2c\\x20\\x57\\x6f\\x72\\x6c\\x64\\x21",
  binary: "01001000 01100101 01101100 01101100 01101111 00101100 00100000 01010111 01101111 01110010 01101100 01100100 00100001",
  suspicious: "ZnVuY3Rpb24gZXZhbFN0cmluZyhzdHIpIHsgZXZhbChzdHIpOyB9",
  encrypted: "U2FsdGVkX1/X8/Hx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx",
  mixed: "SGVsbG8sIFdvcmxkIQ== and 48656c6c6f2c20576f726c6421",
  normal: "This is just a normal string with relatively low entropy.",
  apiKey: "TEST_API_KEY_XXXXXXXXXXXXX_EXAMPLE_ONLY",
  jwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  malicious: "ZXZhbChhdG9iKCJhbGVydCgnWFNTIEF0dGFjaycpIikp"
};

// Expected decoded values for testing
export const expectedDecodings = {
  base64: "Hello, World!",
  hex: "Hello, World!",
  url: "Hello, World!",
  rot13: "Hello, World!",
  asciiEscaped: "Hello, World!",
  binary: "Hello, World!",
  suspicious: "function evalString(str) { eval(str); }",
  malicious: "eval(atob(\"alert('XSS Attack')\"))",
  apiKey: "TEST_API_KEY_XXXXXXXXXXXXX_EXAMPLE_ONLY" // Not actually encoded, just for completeness
};

// Sample analysis results for testing the ThreatScoreCard
export const sampleAnalysisResults = {
  normal: {
    entropy: 3.2,
    decodingSuccess: false,
    threatLevel: "Low"
  },
  base64: {
    entropy: 4.7,
    decodingSuccess: true,
    threatLevel: "Medium"
  },
  suspicious: {
    entropy: 5.8,
    decodingSuccess: true,
    threatLevel: "High"
  },
  apiKey: {
    entropy: 5.5,
    decodingSuccess: false,
    threatLevel: "Medium",
    threatFactors: [
      "Resembles API key pattern",
      "Medium-high entropy detected"
    ]
  },
  malicious: {
    entropy: 6.2,
    decodingSuccess: true,
    threatLevel: "Critical",
    threatFactors: [
      "Contains eval() function",
      "High entropy detected",
      "Successfully decoded as base64"
    ]
  }
};
