// src/utils/entropyUtils.js
import { detectEncoding } from './decodeUtils';

export function calculateEntropy(str) {
  const len = str.length;
  const freq = {};

  for (let char of str) {
    freq[char] = (freq[char] || 0) + 1;
  }

  return Object.values(freq).reduce((entropy, count) => {
    const p = count / len;
    return entropy - p * Math.log2(p);
  }, 0);
}

export function findHighEntropyStrings(code, threshold = 4.0) {
  const stringRegex = /(["'`])(?:(?=(\\?))\2.)*?\1/g; // Matches string literals
  const matches = code.match(stringRegex) || [];

  return matches
    .map(str => {
      const clean = str.slice(1, -1); // Remove quotes
      const entropy = calculateEntropy(clean);
      return { value: clean, entropy };
    })
    .filter(entry => entry.entropy >= threshold);
}

/**
 * Analyze a string to determine its encoding and potential threat level
 *
 * @param {string} str - The string to analyze
 * @returns {Object} - Analysis results including encoding and threat assessment
 */
export function analyzeString(str) {
  if (!str) return { likelyEncoding: 'unknown' };

  const entropy = calculateEntropy(str);
  const likelyEncoding = detectEncoding(str);

  // Check for potentially dangerous patterns
  const hasDangerousPatterns = /eval\(|exec\(|setTimeout\(|setInterval\(|Function\(|document\.write\(|innerHTML|fromCharCode|atob\(|btoa\(/.test(str);

  // Determine threat level based on entropy and patterns
  let threatLevel = 'low';
  if (entropy > 6.0 || hasDangerousPatterns) {
    threatLevel = 'high';
  } else if (entropy > 4.5) {
    threatLevel = 'medium';
  }

  return {
    entropy,
    likelyEncoding,
    threatLevel,
    hasDangerousPatterns,
    length: str.length
  };
}
