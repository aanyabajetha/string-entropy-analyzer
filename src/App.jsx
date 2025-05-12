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
      background: "linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%)",
      backgroundAttachment: "fixed"
    }}>
      {/* Header with enhanced tech-oriented gradient background */}
      <header className="py-8 px-4 md:px-6 text-center relative overflow-hidden">
        {/* Tech grid pattern overlay */}
        <div className="absolute inset-0 z-0 opacity-5" style={{
          backgroundImage: `radial-gradient(hsl(var(--primary)/30%) 1px, transparent 1px)`,
          backgroundSize: "20px 20px"
        }}></div>

        {/* Gradient background with animation */}
        <div className="absolute inset-0 z-0 animate-gradient" style={{
          background: "linear-gradient(135deg, hsl(var(--gradient-start)) 0%, hsl(var(--gradient-mid)) 50%, hsl(var(--gradient-end)) 100%)",
          opacity: "0.15"
        }}></div>

        {/* Animated glow effects */}
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full filter blur-3xl opacity-20 animate-pulse-slow"
             style={{background: "radial-gradient(circle, rgba(var(--primary-rgb), 0.8) 0%, rgba(var(--primary-rgb), 0) 70%)"}}></div>

        <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full filter blur-3xl opacity-20 animate-pulse-slow"
             style={{
               background: "radial-gradient(circle, rgba(var(--secondary-rgb), 0.8) 0%, rgba(var(--secondary-rgb), 0) 70%)",
               animationDelay: "1.5s"
             }}></div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div className="flex-1 flex items-center animate-fade-in">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg animate-float">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
            </div>
            <div className="flex-1 text-center">
              <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent animate-fade-in" style={{
                backgroundImage: "linear-gradient(135deg, hsl(var(--gradient-start)) 0%, hsl(var(--gradient-end)) 100%)",
                backgroundSize: "200% auto",
                animationDuration: "0.8s"
              }}>
                String Entropy Analyzer
              </h1>
            </div>
            <div className="flex-1 flex justify-end animate-fade-in" style={{animationDelay: "200ms"}}>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => setShowTestComponents(!showTestComponents)}
              >
                {showTestComponents ? 'Show Main App' : 'Show Test Components'}
              </button>
            </div>
          </div>

          <p className="text-foreground text-lg max-w-2xl mx-auto animate-slide-up" style={{animationDelay: "300ms"}}>
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
              <div className="w-full animate-fade-in" style={{animationDelay: "400ms"}}>
                <div className="card" style={{
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                  borderWidth: "1px",
                  borderImage: "linear-gradient(to bottom right, hsl(var(--gradient-start)/30%), hsl(var(--gradient-end)/10%)) 1",
                  transition: "all 0.3s ease"
                }}>
                  <EntropyScanner
                    onStringSelect={handleStringSelect}
                    onScan={handleScan}
                  />
                </div>
              </div>

              {/* Results Section */}
              {selectedString && (
                <div ref={analysisRef} className="scroll-mt-6 card animate-slide-up" style={{
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                  borderWidth: "1px",
                  borderImage: "linear-gradient(to bottom right, hsl(var(--gradient-end)/30%), hsl(var(--gradient-start)/10%)) 1",
                  animationDuration: "0.5s"
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

      <footer className="py-6 px-4 md:px-6 border-t border-border/50 relative overflow-hidden" style={{
        background: "linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)"
      }}>
        {/* Tech grid pattern overlay */}
        <div className="absolute inset-0 z-0 opacity-5" style={{
          backgroundImage: `radial-gradient(hsl(var(--primary)/20%) 1px, transparent 1px)`,
          backgroundSize: "16px 16px"
        }}></div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground animate-fade-in" style={{animationDelay: "100ms"}}>
              String Entropy Analyzer - A tool for detecting and analyzing high-entropy strings in code
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 animate-fade-in" style={{animationDelay: "200ms"}}>How it works</a>
              <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 animate-fade-in" style={{animationDelay: "300ms"}}>About</a>
              <a href="#privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 animate-fade-in" style={{animationDelay: "400ms"}}>Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
