import { useEffect, useState, useRef } from "react";
import PipelineProgress from "./components/PipelineProgress";
import CommitteeOpinions from "./components/CommitteeOpinions";
import FinalVerdict from "./components/FinalVerdict";
import PortfolioSummary from "./components/PortfolioSummary";

const FINANCE_QUOTES = [
  "In investing, what is comfortable is rarely profitable. - Robert Arnott",
  "The stock market is a device for transferring money from the impatient to the patient. - Warren Buffett",
  "Diversification is the only free lunch in finance. - Harry Markowitz",
  "Compounding works best when time is allowed to do the heavy lifting.",
  "Risk comes from not knowing what you own. - Warren Buffett",
  "A sound portfolio is built on discipline, not headlines.",
];

const SAMPLE_QUESTIONS = [
  "Should I redeem my small cap SIP given current market volatility?",
  "Am I over-diversified across my 8 mutual funds?",
  "Is my portfolio allocation consistent with my age and moderate risk profile?",
  "Should I increase my debt allocation for my child's education goal?",
  "Should I consolidate my two large cap funds to reduce overlap?",
];

const API_BASE = import.meta.env.VITE_API_BASE || "https://rupeestop-backend.onrender.com";

export default function App() {
  const [question, setQuestion] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [pipelineSteps, setPipelineSteps] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [providerNotice, setProviderNotice] = useState(null);
  const [activeTab, setActiveTab] = useState("committee");
  const [provider, setProvider] = useState("gemini");
  const [quoteIndex, setQuoteIndex] = useState(0);
  const abortRef = useRef(null);

  useEffect(() => {
    if (!isRunning) {
      setQuoteIndex(0);
      return;
    }

    const intervalId = setInterval(() => {
      setQuoteIndex((current) => (current + 1) % FINANCE_QUOTES.length);
    }, 4000);

    return () => clearInterval(intervalId);
  }, [isRunning]);

  const runAnalysis = async () => {
    if (!question.trim()) return;
    setIsRunning(true);
    setResult(null);
    setError(null);
    setProviderNotice(null);
    setPipelineSteps([]);

    const STEPS = [
      { id: "load_profile",         label: "Loading Portfolio"   },
      { id: "planner",              label: "Planner Agent"       },
      { id: "tool_execution",       label: "Running Tools"       },
      { id: "specialists_parallel", label: "Specialist Advisors" },
      { id: "devils_advocate",      label: "Devil's Advocate"    },
      { id: "consensus",            label: "Consensus Agent"     },
      { id: "pipeline_complete",    label: "Complete"            },
    ];

    setPipelineSteps(STEPS.map((s) => ({ ...s, status: "pending", details: "" })));

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      // 120-second hard timeout
      const timeoutId = setTimeout(() => controller.abort(), 120_000);

      const res = await fetch(`${API_BASE}/analyze/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, use_sample_data: true, provider }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";  // accumulates partial lines across chunks

      const handleEvent = (event) => {
        if (event.type === "step_update") {
          setPipelineSteps((prev) =>
            prev.map((s) =>
              s.id === event.step
                ? { ...s, status: event.status, details: event.message }
                : s
            )
          );
        } else if (event.type === "provider_notice") {
          setProviderNotice(event.message);
        } else if (event.type === "final_result") {
          setResult(event.data);
          setActiveTab("verdict");
        } else if (event.type === "error") {
          setError(event.message);
        }
      };

      const parseSseLine = (line) => {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) return;

        const jsonStr = trimmed.slice(5).trim();
        if (!jsonStr) return;

        try {
          handleEvent(JSON.parse(jsonStr));
        } catch {
          console.warn("SSE parse error, skipping line:", jsonStr.slice(0, 100));
        }
      };

      while (true) {
        const { done, value } = await reader.read();

        if (value) {
          buffer += decoder.decode(value, { stream: !done });
        }

        const lines = buffer.split("\n");
        buffer = done ? "" : lines.pop() ?? "";

        for (const line of lines) {
          parseSseLine(line);
        }

        if (done) {
          // Flush any trailing event that arrived without a final newline
          if (buffer.trim()) {
            parseSseLine(buffer);
          }
          break;
        }
      }

      clearTimeout(timeoutId);
    } catch (err) {
      if (err.name === "AbortError") {
        setError("Request timed out after 2 minutes. The LLM may be overloaded — please try again.");
      } else {
        setError(err.message);
      }
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="app-header-logo-wrap">
          <div className="app-header-logo">₹</div>
          <div>
            <div className="app-header-title">Rupeestop</div>
            <div className="app-header-subtitle">Investment Committee AI</div>
          </div>
        </div>

        <div className="app-header-controls">
          <label className={`provider-label${provider === "gemini" ? " active" : ""}`}>
            <input
              type="radio"
              value="gemini"
              checked={provider === "gemini"}
              onChange={(e) => setProvider(e.target.value)}
            />
            Gemini 2.0 Flash
          </label>
          <label className={`provider-label${provider === "groq" ? " active" : ""}`}>
            <input
              type="radio"
              value="groq"
              checked={provider === "groq"}
              onChange={(e) => setProvider(e.target.value)}
            />
            Groq (Llama-3.3-70b)
          </label>
        </div>
      </header>

      <div className="app-content">
        {/* Query Input */}
        <div className="query-section">
          <div className="section-label">Ask The Committee</div>

          <div className="query-input-row">
            <textarea
              className="query-textarea"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Should I redeem my small cap SIP? Am I over-diversified?"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  runAnalysis();
                }
              }}
            />
            <button
              className="rs-btn-primary"
              onClick={runAnalysis}
              disabled={isRunning || !question.trim()}
            >
              {isRunning ? "Analyzing…" : "Analyze →"}
            </button>
          </div>

          {/* Sample questions */}
          <div className="suggestions-row">
            {SAMPLE_QUESTIONS.map((q, i) => (
              <button
                key={i}
                className="rs-btn-outline"
                onClick={() => setQuestion(q)}
              >
                {q.length > 65 ? q.slice(0, 62) + "…" : q}
              </button>
            ))}
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="rs-glass-card animate-slide-up" style={{ borderLeft: "4px solid var(--color-accent-red)", padding: "20px 24px", marginBottom: 40 }}>
            <div style={{ fontWeight: 600, marginBottom: 6, fontFamily: "var(--font-heading)", color: "#fca5a5", display: "flex", alignItems: "center", gap: 8 }}>
              ⚠ Analysis Failed
            </div>
            <div style={{ fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.6 }}>
              {error}
            </div>
          </div>
        )}

        {/* ── Pipeline Progress ── */}
        {pipelineSteps.length > 0 && (
          <div className="animate-slide-up" style={{ marginBottom: 60 }}>
            <PipelineProgress steps={pipelineSteps} isRunning={isRunning} />

            {isRunning && (
              <div className="analysis-quote-card">
                <div className="analysis-quote-label">Market Note</div>
                <div className="analysis-quote-text">{FINANCE_QUOTES[quoteIndex]}</div>
                <div className="analysis-quote-foot">While the committee analyzes your portfolio, keep the long view.</div>
              </div>
            )}
          </div>
        )}

        {/* ── Results ── */}
        {result && (
          <div className="animate-slide-up stagger-2">
            <div className="rs-tabs">
              {[
                { id: "committee", label: "Committee Opinions" },
                { id: "verdict",   label: "Final Verdict"      },
                { id: "portfolio", label: "Portfolio Analysis"  },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`rs-tab${activeTab === tab.id ? " active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="tab-content">
              {activeTab === "committee" && <CommitteeOpinions opinions={result.committee_opinions} />}
              {activeTab === "verdict"   && <FinalVerdict result={result} />}
              {activeTab === "portfolio" && <PortfolioSummary />}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && !isRunning && pipelineSteps.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">₹</div>
            <div className="empty-state-heading">Your Committee. Your Freedom.</div>
            <div className="empty-state-sub">
              4 AI advisors will debate your question, analyze market data, and reach a consensus recommendation
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
