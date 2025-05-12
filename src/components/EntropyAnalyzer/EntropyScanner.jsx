import { findHighEntropyStrings, analyzeString } from '../../utils/entropyUtils';
import { useState } from 'react';

/**
 * EntropyScanner Component
 *
 * This component provides a code input interface and scanning functionality
 * for detecting high-entropy strings that might indicate encoded or obfuscated content.
 */
export default function EntropyScanner({ onStringSelect, onScan, initialCode = '' }) {
  const [inputCode, setInputCode] = useState(initialCode);
  const [detectedStrings, setDetectedStrings] = useState([]);
  const [entropyThreshold, setEntropyThreshold] = useState(4.5);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedStringIndex, setSelectedStringIndex] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  // Decoder method information
  const decoderMethods = [
    { id: 'base64', name: 'Base64', description: 'Decodes Base64-encoded strings, commonly used for binary data transmission' },
    { id: 'hex', name: 'Hex', description: 'Converts hexadecimal strings to their ASCII or binary equivalents' },
    { id: 'rot13', name: 'ROT13', description: 'Simple letter substitution cipher that replaces each letter with the 13th letter after it' },
    { id: 'url', name: 'URL', description: 'Decodes URL-encoded strings where special characters are replaced with % followed by hex values' },
    { id: 'asciiEscapes', name: 'ASCII', description: 'Converts escaped ASCII/Unicode sequences back to readable text' },
    { id: 'binary', name: 'Binary', description: 'Converts binary data (0s and 1s) to text or other formats' }
  ];

  const handleScan = () => {
    setIsScanning(true);
    setSelectedStringIndex(null);
    setHasScanned(false);

    // Short timeout to allow UI to update before potentially intensive operation
    setTimeout(() => {
      try {
        const results = findHighEntropyStrings(inputCode, entropyThreshold);

        // Add analysis data to each result
        const resultsWithAnalysis = results.map(str => ({
          ...str,
          analysis: analyzeString(str.value)
        }));

        setDetectedStrings(resultsWithAnalysis);
        setHasScanned(true);

        if (onScan) {
          onScan(resultsWithAnalysis);
        }
      } catch (error) {
        console.error("Error scanning for high entropy strings:", error);
      } finally {
        setIsScanning(false);
      }
    }, 50);
  };

  const handleStringSelect = (index) => {
    setSelectedStringIndex(index);

    if (onStringSelect && detectedStrings[index]) {
      onStringSelect(detectedStrings[index]);
    }
  };

  const handleExport = () => {
    if (detectedStrings.length === 0) return;

    setIsExporting(true);

    try {
      const exportData = {
        timestamp: new Date().toISOString(),
        entropyThreshold,
        detectedStrings: detectedStrings.map(str => ({
          value: str.value,
          entropy: str.entropy,
          position: str.position,
          likelyEncoding: str.analysis?.likelyEncoding || 'unknown'
        }))
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

      const exportFileName = `entropy-analysis-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileName);
      linkElement.click();
    } catch (error) {
      console.error("Error exporting results:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="card-header border-b border-border/50">
        <h2 className="card-title">Code Scanner</h2>
        <p className="card-description">
          Paste your code to scan for high-entropy strings that might indicate encoded or obfuscated content
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Decoder Method Info Buttons */}
        <div className="w-full max-w-4xl mx-auto">
          <div className="text-xs text-muted-foreground mb-2 text-center">
            Hover over these methods to learn about the encoding types this tool can detect:
          </div>
          <div className="flex flex-wrap gap-3 justify-center px-4">
            {decoderMethods.map(method => (
              <div key={method.id} className="relative group">
                <button className="btn btn-sm btn-ghost bg-muted/30 hover:bg-muted/50 transition-colors min-w-[80px]">
                  {method.name}
                </button>
                <div className="absolute z-50 bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-48 p-2 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="relative">
                    <div className="font-medium mb-1">{method.name}</div>
                    <p>{method.description}</p>
                    <div className="absolute w-2 h-2 bg-popover rotate-45 -bottom-1 left-1/2 transform -translate-x-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Code Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="code-input" className="text-sm font-medium">
              Code Input
            </label>
            <div className="flex items-center space-x-2">
              <label htmlFor="entropy-threshold" className="text-xs text-muted-foreground">
                Entropy Threshold:
              </label>
              <input
                id="entropy-threshold"
                type="number"
                min="1"
                max="8"
                step="0.1"
                value={entropyThreshold}
                onChange={(e) => setEntropyThreshold(parseFloat(e.target.value))}
                className="w-16 h-7 text-xs rounded border border-input bg-background px-2"
              />
            </div>
          </div>

          <div className="relative">
            <textarea
              id="code-input"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="// Paste your code here..."
              className="textarea font-mono h-64 w-full resize-none"
              style={{
                backgroundColor: "hsl(var(--muted))",
                color: "hsl(var(--foreground))"
              }}
            />

            {inputCode.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="text-center">
                  <div className="text-4xl mb-2">📝</div>
                  <p>Paste your code here</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scan Button */}
        <div className="flex justify-center">
          <button
            onClick={handleScan}
            disabled={isScanning || inputCode.trim().length === 0}
            className="btn btn-default px-8 py-2"
            style={{
              background: "linear-gradient(135deg, hsl(var(--gradient-start)) 0%, hsl(var(--gradient-end)) 100%)"
            }}
          >
            {isScanning ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Scanning...
              </>
            ) : (
              "Scan for Suspicious Strings"
            )}
          </button>
        </div>

        {/* Results Section */}
        {hasScanned && (
          <div className="space-y-4 mt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">
                {detectedStrings.length > 0
                  ? `Detected Strings (${detectedStrings.length})`
                  : 'Scan Results'}
              </h3>

              {detectedStrings.length > 0 && (
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="btn btn-sm btn-outline"
                >
                  {isExporting ? 'Exporting...' : 'Export Results'}
                </button>
              )}
            </div>

            <div className="bg-muted/50 rounded-lg p-4 max-h-64 overflow-y-auto">
              {detectedStrings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-5xl mb-4 opacity-30">✓</div>
                  <h4 className="text-lg font-medium mb-2">No Suspicious Strings Found</h4>
                  <p>
                    No high-entropy strings were detected in the provided code using the current threshold.
                  </p>
                  <p className="mt-2 text-sm">
                    Try adjusting the entropy threshold or check a different code sample.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {detectedStrings.map((str, index) => (
                    <li
                      key={index}
                      className={`p-3 rounded-md cursor-pointer transition-colors ${
                        selectedStringIndex === index
                          ? 'bg-primary/20 border border-primary/30'
                          : 'hover:bg-muted border border-transparent'
                      }`}
                      onClick={() => handleStringSelect(index)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-mono text-sm truncate max-w-[80%]">
                          {str.value}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              str.entropy > 6 ? 'bg-entropy-critical/20 text-entropy-critical' :
                              str.entropy > 5.5 ? 'bg-entropy-high/20 text-entropy-high' :
                              str.entropy > 5 ? 'bg-entropy-medium/20 text-entropy-medium' :
                              'bg-entropy-low/20 text-entropy-low'
                            }`}
                          >
                            {str.entropy.toFixed(2)}
                          </span>

                          {str.analysis?.likelyEncoding !== 'unknown' && (
                            <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full">
                              {str.analysis.likelyEncoding}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
