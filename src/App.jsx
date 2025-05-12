import { useState, useRef } from 'react'
import './index.css'
import EntropyScanner from './components/EntropyAnalyzer/EntropyScanner'
import DecoderPreview from './components/EntropyAnalyzer/DecoderPreview'
import ThreatScoreCard from './components/EntropyAnalyzer/ThreatScoreCard'
import TestComponents from './components/TestComponents'

function App() {
  const [selectedString, setSelectedString] = useState(null);
  const [showTestComponents, setShowTestComponents] = useState(false);
  const analysisRef = useRef(null);

  // Handle string selection from the EntropyScanner
  const handleStringSelect = (str) => {
    setSelectedString(str);

    if (str) {
      // Scroll to analysis section
      setTimeout(() => {
        if (analysisRef.current) {
          analysisRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  // Handle scan action
  const handleScan = () => {
    // Just a placeholder for any future scan-related functionality
  };

  return (
    <div className="min-h-screen flex flex-col" style={{
      background: "linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%)"
    }}>
      {/* Header with gradient background */}
      <header className="py-8 px-4 md:px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 z-0" style={{
          background: "linear-gradient(135deg, hsl(var(--gradient-start)) 0%, hsl(var(--gradient-mid)) 50%, hsl(var(--gradient-end)) 100%)",
          opacity: "0.15"
        }}></div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div className="flex-1"></div>
            <div className="flex-1 text-center">
              <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent" style={{
                backgroundImage: "linear-gradient(135deg, hsl(var(--gradient-start)) 0%, hsl(var(--gradient-end)) 100%)"
              }}>
                String Entropy Analyzer
              </h1>
            </div>
            <div className="flex-1 flex justify-end">
              <button
                className="btn btn-sm btn-outline"
                onClick={() => setShowTestComponents(!showTestComponents)}
              >
                {showTestComponents ? 'Show Main App' : 'Show Test Components'}
              </button>
            </div>
          </div>

          <p className="text-foreground text-lg max-w-2xl mx-auto">
            Detect high-entropy strings in code that might indicate obfuscation or encoded data
          </p>
        </div>
      </header>

      <main className="flex-1 py-8 px-4 md:px-6">
        {showTestComponents ? (
          <TestComponents />
        ) : (
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col gap-8">
              {/* Code Input Section */}
              <div className="w-full">
                <div className="card" style={{
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                  borderWidth: "1px",
                  borderImage: "linear-gradient(to bottom right, hsl(var(--gradient-start)/30%), hsl(var(--gradient-end)/10%)) 1"
                }}>
                  <EntropyScanner
                    onStringSelect={handleStringSelect}
                    onScan={handleScan}
                  />
                </div>
              </div>

              {/* Results Section */}
              {selectedString && (
                <div ref={analysisRef} className="scroll-mt-6 card" style={{
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                  borderWidth: "1px",
                  borderImage: "linear-gradient(to bottom right, hsl(var(--gradient-end)/30%), hsl(var(--gradient-start)/10%)) 1"
                }}>
                  <div className="card-header border-b border-border/50">
                    <h2 className="card-title">Analysis Results</h2>
                    <p className="card-description">
                      Analyzing string with entropy score of <span className="font-medium">{selectedString.entropy.toFixed(2)}</span>
                    </p>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Decoder Preview */}
                      <div className="bg-muted/50 rounded-lg p-4">
                        <DecoderPreview
                          encodedString={selectedString.value}
                          onDecoded={() => {}}
                        />
                      </div>

                      {/* Threat Score Card */}
                      <div className="bg-muted/50 rounded-lg p-4">
                        <ThreatScoreCard
                          string={selectedString.value}
                          entropyScore={selectedString.entropy}
                          decodingSuccess={selectedString.analysis?.likelyEncoding !== 'unknown'}
                        />
                      </div>
                    </div>

                    <div className="flex justify-center mt-6">
                      <button
                        className="btn btn-outline"
                        onClick={() => {
                          setSelectedString(null);
                          setCurrentStep(1);
                        }}
                      >
                        ← Back to Scanner
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="py-6 px-4 md:px-6 border-t border-border/50" style={{
        background: "linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)"
      }}>
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              String Entropy Analyzer - A tool for detecting and analyzing high-entropy strings in code
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground">How it works</a>
              <a href="#about" className="text-sm text-muted-foreground hover:text-foreground">About</a>
              <a href="#privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
