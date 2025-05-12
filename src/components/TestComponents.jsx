import { useState } from 'react';
import EntropyScanner from './EntropyAnalyzer/EntropyScanner';
import DecoderPreview from './EntropyAnalyzer/DecoderPreview';
import ThreatScoreCard from './EntropyAnalyzer/ThreatScoreCard';
import { sampleCode, testStrings, sampleAnalysisResults } from '../utils/testData.jsx';
import { analyzeString } from '../utils/entropyUtils';
import { decodeString } from '../utils/decodeUtils';

/**
 * Test component for verifying the functionality of the EntropyAnalyzer components
 */
function TestComponents() {
  const [selectedTest, setSelectedTest] = useState('base64');
  const [selectedComponent, setSelectedComponent] = useState('all');

  // Get the current test string
  const currentString = testStrings[selectedTest];

  // Analyze the current string
  const analysis = analyzeString(currentString);

  // Get sample analysis results for ThreatScoreCard
  const threatData = sampleAnalysisResults[selectedTest] || sampleAnalysisResults.normal;

  return (
    <div className="container mx-auto max-w-6xl p-4 space-y-8">
      <div className="card p-6">
        <h1 className="text-2xl font-bold mb-4">Component Testing</h1>

        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Test String:</label>
            <select
              value={selectedTest}
              onChange={(e) => setSelectedTest(e.target.value)}
              className="select"
            >
              {Object.keys(testStrings).map(key => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Component:</label>
            <select
              value={selectedComponent}
              onChange={(e) => setSelectedComponent(e.target.value)}
              className="select"
            >
              <option value="all">All Components</option>
              <option value="scanner">EntropyScanner</option>
              <option value="decoder">DecoderPreview</option>
              <option value="threat">ThreatScoreCard</option>
            </select>
          </div>
        </div>

        <div className="bg-secondary/20 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-medium mb-2">Current Test String:</h2>
          <div className="bg-card border rounded-md p-3 font-mono text-sm overflow-x-auto">
            <code>{currentString}</code>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            <p>Entropy: {analysis.entropy.toFixed(2)}</p>
            <p>Likely Encoding: {analysis.likelyEncoding}</p>
          </div>
        </div>
      </div>

      {/* EntropyScanner Test */}
      {(selectedComponent === 'all' || selectedComponent === 'scanner') && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">EntropyScanner Test</h2>
            <p className="card-description">Testing the EntropyScanner component with sample code</p>
          </div>

          <div className="p-6">
            <EntropyScanner initialCode={sampleCode} />
          </div>
        </div>
      )}

      {/* DecoderPreview Test */}
      {(selectedComponent === 'all' || selectedComponent === 'decoder') && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">DecoderPreview Test</h2>
            <p className="card-description">Testing the DecoderPreview component with the selected string</p>
          </div>

          <div className="p-6">
            <DecoderPreview encodedString={currentString} />
          </div>
        </div>
      )}

      {/* ThreatScoreCard Test */}
      {(selectedComponent === 'all' || selectedComponent === 'threat') && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">ThreatScoreCard Test</h2>
            <p className="card-description">Testing the ThreatScoreCard component with the selected string</p>
          </div>

          <div className="p-6">
            <ThreatScoreCard
              string={currentString}
              entropyScore={threatData.entropy}
              decodingSuccess={threatData.decodingSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default TestComponents;
