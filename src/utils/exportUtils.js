/**
 * Utility functions for exporting data
 */

import { decodeString } from './decodeUtils';

/**
 * Prepare data for export by adding decoded results to each string
 * 
 * @param {Array} strings - Array of detected high-entropy strings
 * @returns {Object} - Formatted data for export
 */
export function prepareExportData(strings) {
  if (!strings || !strings.length) return { strings: [] };
  
  const exportData = {
    exportDate: new Date().toISOString(),
    totalStrings: strings.length,
    strings: strings.map(str => {
      // Get full decoding results for each string
      const decodingResults = decodeString(str.value);
      
      // Format the data for export
      return {
        value: str.value,
        entropy: str.entropy,
        position: str.position,
        length: str.length,
        likelyEncoding: str.analysis?.likelyEncoding || 'unknown',
        decodingResults: {
          successfulDecodings: decodingResults.successfulDecodings,
          // Include only successful decodings with their results
          results: decodingResults.successfulDecodings.reduce((acc, method) => {
            acc[method] = decodingResults[method].result;
            return acc;
          }, {})
        }
      };
    })
  };
  
  return exportData;
}

/**
 * Generate a downloadable JSON file from data
 * 
 * @param {Object} data - The data to export
 * @returns {string} - Data URL for the JSON file
 */
export function generateJsonFile(data) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  return URL.createObjectURL(blob);
}

/**
 * Generate a downloadable text report from data
 * 
 * @param {Object} data - The data to export
 * @returns {string} - Data URL for the text file
 */
export function generateTextReport(data) {
  let report = `String Entropy Analysis Report\n`;
  report += `Generated: ${new Date().toLocaleString()}\n`;
  report += `Total suspicious strings detected: ${data.totalStrings}\n\n`;
  
  data.strings.forEach((str, index) => {
    report += `String #${index + 1}\n`;
    report += `${'='.repeat(40)}\n`;
    report += `Value: ${str.value}\n`;
    report += `Entropy: ${str.entropy.toFixed(2)}\n`;
    report += `Position in code: character ${str.position}\n`;
    report += `Likely encoding: ${str.likelyEncoding}\n\n`;
    
    if (str.decodingResults.successfulDecodings.length > 0) {
      report += `Successful decodings:\n`;
      str.decodingResults.successfulDecodings.forEach(method => {
        report += `\n${method.toUpperCase()}:\n`;
        report += `${str.decodingResults.results[method]}\n`;
      });
    } else {
      report += `No successful decodings found.\n`;
    }
    
    report += `\n\n`;
  });
  
  const blob = new Blob([report], { type: 'text/plain' });
  return URL.createObjectURL(blob);
}

/**
 * Trigger a file download
 * 
 * @param {string} url - Data URL for the file
 * @param {string} filename - Name for the downloaded file
 */
export function downloadFile(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url); // Clean up
}
