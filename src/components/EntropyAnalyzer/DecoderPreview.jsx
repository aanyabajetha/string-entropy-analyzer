import { useState, useEffect } from 'react';
import { decodeString, detectEncoding } from '../../utils/decodeUtils';

/**
 * DecoderPreview Component
 *
 * This component is responsible for:
 * - Taking high-entropy strings as input
 * - Attempting to decode them using various methods (base64, hex, ROT13, etc.)
 * - Displaying decoded previews for each method
 * - Allowing users to copy decoded results
 */
function DecoderPreview({ encodedString, onDecoded }) {
  const [selectedDecoder, setSelectedDecoder] = useState('');
  const [decodingResults, setDecodingResults] = useState(null);
  const [copySuccess, setCopySuccess] = useState('');
  const [showAllDecodings, setShowAllDecodings] = useState(false);

  // List of available decoders
  const decoders = [
    { id: 'base64', name: 'Base64' },
    { id: 'hex', name: 'Hexadecimal' },
    { id: 'rot13', name: 'ROT13' },
    { id: 'url', name: 'URL Encoding' },
    { id: 'asciiEscapes', name: 'ASCII/Unicode Escapes' },
    { id: 'binary', name: 'Binary' }
  ];

  // Decode the string when it changes
  useEffect(() => {
    if (encodedString) {
      const results = decodeString(encodedString);
      setDecodingResults(results);

      // Auto-select the most likely encoding
      const likelyEncoding = detectEncoding(encodedString);
      setSelectedDecoder(likelyEncoding);

      // Call onDecoded callback if provided and we have successful decodings
      if (onDecoded && results.successfulDecodings.length > 0) {
        onDecoded(results);
      }
    } else {
      setDecodingResults(null);
      setSelectedDecoder('');
    }
  }, [encodedString, onDecoded]);

  // Handle decoder selection change
  const handleDecoderChange = (e) => {
    setSelectedDecoder(e.target.value);
    setCopySuccess('');
  };

  // Copy decoded result to clipboard
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        setCopySuccess('Failed to copy');
      });
  };

  // Get the current decoder result
  const getCurrentDecoderResult = () => {
    if (!decodingResults || !selectedDecoder) return null;
    return decodingResults[selectedDecoder];
  };

  // Render a single decoder result
  const renderDecoderResult = (decoderId, result) => {
    if (!result) return null;

    return (
      <div className={`border rounded-lg p-4 ${result.success ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
        <div className="flex justify-between items-center mb-3">
          <span className={`badge ${result.success ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {result.success ? 'Success' : 'Failed'}
          </span>
        </div>

        <div className="bg-card border rounded-md p-3 font-mono text-sm overflow-x-auto mb-3">
          {result.isBinary ? (
            <div className="text-xs">
              <p className="text-muted-foreground mb-1">Binary data detected. Hex preview:</p>
              <code className="whitespace-pre-wrap break-all">{result.binaryPreview}</code>
            </div>
          ) : (
            <code className="whitespace-pre-wrap break-all">{result.result}</code>
          )}
        </div>

        {result.success && (
          <button
            className="btn btn-sm btn-outline"
            onClick={() => handleCopy(result.result)}
          >
            {copySuccess && selectedDecoder === decoderId ? copySuccess : 'Copy'}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="card-content">
      <div className="card-header">
        <h2 className="card-title">Decoder Preview</h2>
        <p className="card-description">Attempt to decode the suspicious string using various methods</p>
      </div>

      <div className="p-6 space-y-6">
        {encodedString ? (
          <>
            <div className="border rounded-lg p-4 bg-secondary/20">
              <h3 className="text-sm font-medium mb-2">Original String</h3>
              <div className="flex flex-col space-y-3">
                <div className="bg-card border rounded-md p-3 font-mono text-sm overflow-x-auto">
                  <code className="whitespace-pre-wrap break-all">{encodedString}</code>
                </div>
                <div>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => handleCopy(encodedString)}
                  >
                    {copySuccess === 'original' ? 'Copied!' : 'Copy Original'}
                  </button>
                </div>
              </div>
            </div>

            {decodingResults && (
              <>
                <div className="space-y-3">
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="decoder-select" className="text-sm font-medium">
                      Try decoding with:
                    </label>
                    <select
                      id="decoder-select"
                      value={selectedDecoder}
                      onChange={handleDecoderChange}
                      className="select"
                    >
                      <option value="">Select a decoder method</option>
                      {decoders.map(decoder => (
                        <option
                          key={decoder.id}
                          value={decoder.id}
                          disabled={!decodingResults[decoder.id]}
                        >
                          {decoder.name}
                          {decodingResults.successfulDecodings.includes(decoder.id) ? ' ✓' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-secondary/20 rounded-lg p-3 text-sm">
                    {decodingResults.successfulDecodings.length > 0 ? (
                      <div className="flex items-center">
                        <span className="font-medium mr-2">Successful decodings:</span>
                        <div className="flex flex-wrap gap-1">
                          {decodingResults.successfulDecodings.map(method => (
                            <span
                              key={method}
                              className="badge badge-success"
                              onClick={() => setSelectedDecoder(method)}
                              style={{cursor: 'pointer'}}
                            >
                              {method}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No successful decodings found</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedDecoder ? (
                    <div>
                      <h3 className="text-lg font-medium mb-3">
                        {decoders.find(d => d.id === selectedDecoder)?.name} Decoding
                      </h3>
                      {renderDecoderResult(selectedDecoder, getCurrentDecoderResult())}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <p>Select a decoder method above</p>
                    </div>
                  )}

                  <div className="flex justify-center mt-6">
                    <button
                      onClick={() => setShowAllDecodings(!showAllDecodings)}
                      className="btn btn-outline btn-sm"
                    >
                      {showAllDecodings ? 'Hide All Decodings' : 'Show All Decodings'}
                    </button>
                  </div>

                  {showAllDecodings && (
                    <div className="border rounded-lg p-4 mt-4">
                      <h3 className="text-lg font-medium mb-4">All Decoding Attempts</h3>
                      <div className="space-y-4">
                        {decoders.map(decoder => (
                          <div key={decoder.id} className="border-t pt-4 first:border-t-0 first:pt-0">
                            <h4 className="text-sm font-medium mb-2">{decoder.name}</h4>
                            {renderDecoderResult(decoder.id, decodingResults[decoder.id])}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="border-t pt-4 text-xs text-muted-foreground">
              <p>
                Note: Not all strings can be decoded with every method.
                The system automatically selects the most likely encoding, but you can try others.
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No string selected for decoding</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DecoderPreview;
