import React, { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Predefined examples for recruiters to test instantly
const EXAMPLES = [
  {
    title: "US Senate Approves $36.5 Billion Disaster Relief Bill",
    badge: "Real News",
    text: "WASHINGTON (Reuters) - The U.S. Senate voted on Tuesday to approve a bipartisan bill providing $36.5 billion in emergency disaster relief to help communities recover from recent hurricanes and wildfires. The legislation passed with a broad majority and is headed to the White House for signature. Under the bill, Puerto Rico will receive crucial funding to rebuild its electric grid and restore essential services after Hurricane Maria devastated the island last month."
  },
  {
    title: "Shocking: Government Secretly Created Hurricane inside Lab!",
    badge: "Fake News",
    text: "BREAKING: The government has just admitted that the recent hurricane was actually created in a secret military lab using high-frequency weather control technology! Officials were caught on tape discussing how they managed to steer the storm directly towards the coastline to manipulate the upcoming elections. Spread this everywhere before they take the video down! The mainstream media refuses to cover this shocking cover-up!"
  },
  {
    title: "Starmer Meets EU Leaders in Brussels to Boost Security Pact",
    badge: "Real News",
    text: "LONDON (Reuters) - Prime Minister Keir Starmer met with European leaders in Brussels on Thursday to discuss strengthening bilateral security ties and resolving post-Brexit trade friction. Starmer emphasized the UK's commitment to European security, proposing a new security pact to address shared challenges such as border control and joint defense operations. EU officials welcomed the cooperative tone of the talks."
  }
];

export default function App() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [slowLoading, setSlowLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [serverStatus, setServerStatus] = useState("checking"); // checking | online | offline

  // Ping server health on mount to detect cold starts
  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout

    fetch(`${API_URL}/status`, { signal: controller.signal })
      .then((res) => {
        clearTimeout(timeoutId);
        if (res.ok) {
          setServerStatus("online");
        } else {
          setServerStatus("offline");
        }
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        setServerStatus("offline");
        console.warn("Model server health check failed (possibly cold starting):", err);
      });

    return () => {
      controller.abort();
    };
  }, []);

  // Handle slow loading (if request takes longer than 3 seconds)
  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => {
        setSlowLoading(true);
      }, 3000);
    } else {
      setSlowLoading(false);
      clearTimeout(timer);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "An error occurred during text analysis.");
      }

      setResult(data);
      setServerStatus("online"); // Successful inference implies server is online
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to connect to the model server. It may still be sleeping.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText("");
    setResult(null);
    setError("");
  };

  const loadExample = (exampleText) => {
    setText(exampleText);
    setResult(null);
    setError("");
  };

  return (
    <div className="gradient-bg h-screen w-screen flex flex-col justify-between p-6 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-emerald-400 to-indigo-400">
              Veritas AI
            </span>
          </h1>
          <span className="text-xs text-slate-500 hidden sm:inline">| NLP News Classifier</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/60 rounded-full border border-slate-800 text-[10px] text-slate-400">
          <span className={`w-2 h-2 rounded-full ${
            serverStatus === "online" ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : 
            serverStatus === "checking" ? "bg-amber-500 animate-pulse" : "bg-rose-500 animate-pulse"
          }`} />
          {serverStatus === "online" ? "Model Server Active" : 
           serverStatus === "checking" ? "Verifying status..." : "Model Server Sleeping"}
        </div>
      </header>

      {/* Main Grid Content */}
      <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden mb-4 min-h-0">
        {/* Left Column - Input (2/3 width) */}
        <div className="md:col-span-2 flex flex-col h-full overflow-hidden min-h-0 space-y-4">
          {/* Examples */}
          <div className="shrink-0 space-y-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-extrabold">Quick Templates:</span>
            <div className="grid grid-cols-3 gap-3">
              {EXAMPLES.map((ex, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => loadExample(ex.text)}
                  className="text-left p-2.5 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-900/60 hover:border-slate-700/80 transition-all duration-300 flex flex-col justify-between h-20 group relative overflow-hidden"
                >
                  <span className="text-[11px] font-semibold text-slate-300 line-clamp-2 leading-tight group-hover:text-slate-100">{ex.title}</span>
                  <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                    ex.badge === "Real News" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  } self-start`}>
                    {ex.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleAnalyze} className="flex-grow flex flex-col overflow-hidden min-h-0 space-y-4">
            <div className="flex-grow relative min-h-0">
              <textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Paste the full text of a news article here (minimum 10 characters, maximum 20,000)..."
                className="w-full h-full bg-slate-950/60 border border-slate-800/80 rounded-2xl px-5 py-4 text-slate-200 placeholder-slate-600 focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 focus:outline-none transition-all duration-300 font-sans text-sm resize-none input-glow leading-relaxed"
              />
              <div className="absolute bottom-4 right-5 flex items-center gap-4 text-xs font-semibold">
                <span className={`${text.length > 20000 ? "text-rose-500 font-bold" : "text-slate-500"}`}>
                  {text.length.toLocaleString()} / 20,000
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 shrink-0">
              <button
                type="submit"
                disabled={loading || text.trim().length === 0 || text.length > 20000}
                className="flex-grow py-3 px-6 rounded-xl font-semibold bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/10 active:scale-[0.98] duration-150"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {slowLoading ? "Waking up model server..." : "Analyzing Text..."}
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Analyze Article
                  </>
                )}
              </button>
              {text && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-6 py-3 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 font-semibold bg-slate-950/30 hover:bg-slate-900/40 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Column - Output & Info (1/3 width) */}
        <div className="md:col-span-1 flex flex-col h-full overflow-hidden min-h-0 space-y-4">
          {/* Cold Start warning inside right column */}
          {serverStatus === "offline" && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex gap-2 text-amber-400 text-xs shrink-0 items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="space-y-0.5">
                <p className="font-semibold">Model server is currently asleep</p>
                <p className="text-slate-400">First analysis will take ~30s to spin up the API instance.</p>
              </div>
            </div>
          )}

          {/* Error container */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl flex gap-2 text-xs shrink-0 items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold">Analysis Failed</p>
                <p className="text-slate-400">{error}</p>
              </div>
            </div>
          )}

          {/* Slow loader info */}
          {slowLoading && (
            <div className="glass-panel p-4 border-indigo-500/30 text-center flex flex-col items-center justify-center space-y-2 shrink-0 animate-pulse">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] text-slate-400 leading-normal">
                FastAPI server is spinning up. Loading scikit-learn models (~10MB size) typically takes around 15-25 seconds...
              </p>
            </div>
          )}

          {/* Main output area */}
          <div className="flex-grow flex flex-col justify-between overflow-hidden min-h-0 space-y-4">
            {result ? (
              <div className={`glass-panel p-5 flex-grow flex flex-col justify-between overflow-hidden border-t-4 transition-all duration-500 ${
                result.label === "REAL" ? "border-t-emerald-500 shadow-emerald-950/10" : "border-t-rose-500 shadow-rose-950/10"
              }`}>
                {/* Verdict */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Analysis Verdict</span>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-extrabold tracking-tight">{result.label}</h2>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      result.label === "REAL" 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}>
                      {result.label === "REAL" ? "Verified Style" : "Suspicious Pattern"}
                    </span>
                  </div>
                </div>

                {/* Confidence progress */}
                <div className="space-y-2 my-4">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Classification Confidence</span>
                    <span className={result.label === "REAL" ? "text-emerald-400" : "text-rose-400"}>
                      {result.confidence}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        result.label === "REAL" ? "bg-gradient-to-r from-teal-500 to-emerald-400" : "bg-gradient-to-r from-rose-500 to-orange-400"
                      }`}
                      style={{ width: `${result.confidence}%` }}
                    />
                  </div>
                </div>

                {/* Length */}
                <div className="border-t border-slate-800/80 pt-4 flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-500 uppercase tracking-wider">Cleaned Length</span>
                  <span className="text-slate-300">{result.cleaned_length.toLocaleString()} chars</span>
                </div>
              </div>
            ) : (
              /* Placeholder */
              <div className="glass-panel p-6 flex-grow flex flex-col items-center justify-center text-center text-slate-500 border border-dashed border-slate-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-700 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <p className="text-xs font-semibold">Awaiting input analysis</p>
                <p className="text-[10px] text-slate-600 mt-1 max-w-[200px]">Fill the form on the left and click analyze to display predictions.</p>
              </div>
            )}

            {/* Branding Footer Card */}
            <div className="glass-panel p-4 shrink-0 flex flex-col items-center justify-center space-y-2.5 text-center border border-slate-800/60 bg-slate-950/40 rounded-2xl">
              <p className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 font-extrabold text-sm tracking-wide flex items-center justify-center gap-1.5 drop-shadow-sm">
                Never miss your next win. <span>✌️</span>
              </p>
              <div className="flex items-center gap-4 text-slate-400">
                <a href="https://github.com/DhryXpert" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 hover:scale-110 transition-all duration-300">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                  </svg>
                </a>
                <a href="mailto:dhairyakhatri83@gmail.com" className="hover:text-amber-400 hover:scale-110 transition-all duration-300">
                  <svg className="h-5 w-5 fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </a>
              </div>
              <div className="space-y-0.5">
                <p className="text-teal-400/90 hover:text-teal-300 transition-colors text-xs font-bold tracking-wide">
                  Built with joy by Dhairya
                </p>
                <p className="text-slate-600 text-[10px] font-semibold">
                  &copy; 2025-2026 CodeOrbit.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
