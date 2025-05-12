import { useState, useEffect } from 'react';
import { decodeString } from '../../utils/decodeUtils';

/**
 * ThreatScoreCard Component
 *
 * This component is responsible for:
 * - Displaying the threat level of a detected high-entropy string
 * - Showing entropy score and other metrics
 * - Providing context about what the threat level means
 * - Offering recommendations based on the threat assessment
 */
function ThreatScoreCard({ string, entropyScore, decodingSuccess }) {
  const [threatScore, setThreatScore] = useState(0);
  const [decodedContent, setDecodedContent] = useState(null);
  const [threatFactors, setThreatFactors] = useState([]);

  // Calculate threat score and analyze string when props change
  useEffect(() => {
    if (string && entropyScore) {
      // Decode the string to analyze content
      const decoded = decodeString(string);
      setDecodedContent(decoded);

      // Calculate threat score based on multiple factors
      calculateThreatScore(entropyScore, decoded, string);
    }
  }, [string, entropyScore, decodingSuccess]);

  // Calculate a numerical threat score based on multiple factors
  const calculateThreatScore = (entropy, decoded, originalString) => {
    let score = 0;
    const factors = [];

    // Factor 1: Entropy (0-50 points)
    const entropyFactor = Math.min(entropy * 7, 50);
    score += entropyFactor;

    if (entropy > 6) {
      factors.push('Very high entropy detected');
    } else if (entropy > 5) {
      factors.push('Moderately high entropy detected');
    }

    // Factor 2: String length (0-15 points)
    const lengthFactor = Math.min(originalString.length / 20, 15);
    score += lengthFactor;

    if (originalString.length > 100) {
      factors.push('Long string length increases suspicion');
    }

    // Factor 3: Successful decoding (0-15 points)
    if (decoded && decoded.successfulDecodings.length > 0) {
      // If we can decode it, it's potentially less threatening
      // But still somewhat suspicious
      score += 15;
      factors.push('String can be decoded with standard methods');
    } else {
      // If we can't decode it with standard methods, it's more suspicious
      score += 25;
      factors.push('Unable to decode with standard methods');
    }

    // Factor 4: Suspicious patterns (0-20 points)
    const suspiciousPatterns = [
      { pattern: /eval\s*\(/, name: 'eval() function' },
      { pattern: /exec\s*\(/, name: 'exec() function' },
      { pattern: /document\.write\s*\(/, name: 'document.write()' },
      { pattern: /fromCharCode/, name: 'fromCharCode() method' },
      { pattern: /\\x[0-9a-f]{2}/i, name: 'hex escape sequences' },
      { pattern: /\\u[0-9a-f]{4}/i, name: 'unicode escape sequences' },
    ];

    // Check for suspicious patterns in decoded content
    let patternFound = false;
    for (const { pattern, name } of suspiciousPatterns) {
      if (decoded && decoded.successfulDecodings.length > 0) {
        // Check each successful decoding for suspicious patterns
        for (const method of decoded.successfulDecodings) {
          const decodedStr = decoded[method].result;
          if (pattern.test(decodedStr)) {
            score += 20;
            factors.push(`Suspicious pattern found in decoded content: ${name}`);
            patternFound = true;
            break;
          }
        }
        if (patternFound) break;
      }
    }

    setThreatScore(score);
    setThreatFactors(factors);
  };

  // Get threat level based on threat score
  const getThreatLevel = () => {
    if (threatScore >= 70) return 'Critical';
    if (threatScore >= 50) return 'High';
    if (threatScore >= 30) return 'Medium';
    return 'Low';
  };

  // Get threat badge color class based on threat level
  const getThreatColorClass = (level) => {
    switch (level) {
      case 'Critical': return 'bg-red-600';
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Get gauge color class based on threat level
  const getGaugeColorClass = (level) => {
    switch (level) {
      case 'Critical': return 'bg-gradient-to-r from-red-600 to-red-500';
      case 'High': return 'bg-gradient-to-r from-red-500 to-orange-500';
      case 'Medium': return 'bg-gradient-to-r from-yellow-500 to-yellow-400';
      case 'Low': return 'bg-gradient-to-r from-green-500 to-green-400';
      default: return 'bg-gray-500';
    }
  };

  // Get recommendations based on threat level
  const getRecommendations = (level) => {
    switch (level) {
      case 'Critical':
        return 'This string has extremely high entropy and contains suspicious patterns. It is likely malicious code that has been obfuscated to avoid detection. Do not execute this code under any circumstances.';
      case 'High':
        return 'This string has very high entropy and appears to be obfuscated or encoded. Exercise extreme caution and thoroughly analyze the decoded content before using.';
      case 'Medium':
        return 'This string has moderately high entropy. While it may be a legitimate encoded string, review the decoded content carefully before using.';
      case 'Low':
        return 'This string has relatively low entropy. It may be normal text or simple encoding with low risk.';
      default:
        return 'Unable to determine threat level.';
    }
  };

  // Get threat score description
  const getThreatScoreDescription = (score) => {
    if (score >= 70) return 'Extremely suspicious';
    if (score >= 50) return 'Very suspicious';
    if (score >= 30) return 'Moderately suspicious';
    return 'Low suspicion';
  };

  const threatLevel = getThreatLevel();
  const threatColorClass = getThreatColorClass(threatLevel);
  const gaugeColorClass = getGaugeColorClass(threatLevel);

  return (
    <div className="card-content">
      <div className="card-header">
        <h2 className="card-title">Threat Assessment</h2>
        <p className="card-description">Analysis of potential security risks in the detected string</p>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex flex-col items-center">
          <div className={`badge ${threatColorClass} text-white px-3 py-1 text-sm font-medium`}>
            {threatLevel} Threat Level
          </div>

          <div className="w-full mt-4">
            <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
              <div
                className={`h-full ${gaugeColorClass}`}
                style={{ width: `${Math.min(threatScore, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
              <span>Threat Score: <span className="font-medium text-foreground">{threatScore.toFixed(0)}/100</span></span>
              <span className="font-medium">{getThreatScoreDescription(threatScore)}</span>
            </div>
          </div>
        </div>

        <div className="bg-secondary/20 rounded-lg p-4 grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Entropy Score:</span>
            <span className="font-medium">{entropyScore ? entropyScore.toFixed(2) : 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">String Length:</span>
            <span className="font-medium">{string ? string.length : 0} chars</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Decoded:</span>
            <span className={`font-medium ${decodingSuccess ? 'text-green-500' : 'text-red-500'}`}>
              {decodingSuccess ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Methods:</span>
            <span className="font-medium">
              {decodedContent?.successfulDecodings.length > 0
                ? decodedContent.successfulDecodings.length
                : 'None'}
            </span>
          </div>
        </div>

        {threatFactors.length > 0 && (
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium mb-2">Threat Indicators</h3>
            <ul className="space-y-1 text-sm">
              {threatFactors.map((factor, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className={`border-l-4 ${threatColorClass} bg-secondary/20 rounded-r-lg p-4`}>
          <h3 className="text-sm font-medium mb-2">Recommendations</h3>
          <p className="text-sm">{getRecommendations(threatLevel)}</p>
        </div>

        {decodedContent?.successfulDecodings.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-2">Successful Decodings</h3>
            <div className="flex flex-wrap gap-1">
              {decodedContent.successfulDecodings.map(method => (
                <span
                  key={method}
                  className="badge badge-outline"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ThreatScoreCard;
