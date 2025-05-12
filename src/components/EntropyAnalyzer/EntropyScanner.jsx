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

  const handleScan = () => {
    setIsScanning(true);
    setSelectedStringIndex(null);

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
        {detectedStrings.length > 0 && (
          <div className="space-y-4 mt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">
                Detected Strings ({detectedStrings.length})
              </h3>

              <button
                onClick={handleExport}
                disabled={isExporting}
                className="btn btn-sm btn-outline"
              >
                {isExporting ? 'Exporting...' : 'Export Results'}
              </button>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 max-h-64 overflow-y-auto">
              {detectedStrings.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No high-entropy strings detected
                </p>
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
