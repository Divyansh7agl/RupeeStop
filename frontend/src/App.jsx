import { useState, useRef } from "react";
import PipelineProgress from "./components/PipelineProgress";
import CommitteeOpinions from "./components/CommitteeOpinions";
import FinalVerdict from "./components/FinalVerdict";
import PortfolioSummary from "./components/PortfolioSummary";

const SAMPLE_QUESTIONS = [
  "Should I redeem my small cap SIP given current market volatility?",
  "Am I over-diversified across my 8 mutual funds?",
  "Is my portfolio allocation consistent with my age and moderate risk profile?",
  "Should I increase my debt allocation for my child's education goal?",
  "Should I consolidate my two large cap funds to reduce overlap?",
];

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function App() {
  const [question, setQuestion] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [pipelineSteps, setPipelineSteps] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [providerNotice, setProviderNotice] = useState(null);
  const [activeTab, setActiveTab] = useState("committee");
  const [provider, setProvider] = useState("gemini");
  const abortRef = useRef(null);

  const runAnalysis = async () => {
    if (!question.trim()) return;
    setIsRunning(true);
    setResult(null);
    setError(null);
    setProviderNotice(null);
    setPipelineSteps([]);

    const STEPS = [
      { id: "load_profile", label: "Loading Portfolio" },
      { id: "planner", label: "Planner Agent" },
      { id: "tool_execution", label: "Running Tools" },
      { id: "specialists_parallel", label: "Specialist Advisors" },
      { id: "devils_advocate", label: "Devil's Advocate" },
      { id: "consensus", label: "Consensus Agent" },
      { id: "pipeline_complete", label: "Complete" },
    ];

    setPipelineSteps(STEPS.map((s) => ({ ...s, status: "pending", details: "" })));

    try {
      const res = await fetch(`${API_BASE}/analyze/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, use_sample_data: true, provider }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      abortRef.current = reader;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          try {
            const event = JSON.parse(line.slice(6));

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
              setActiveTab("committee");
            } else if (event.type === "error") {
              setError(event.message);
            }
          } catch { }
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="app-container" style={{ paddingBottom: "60px" }}>
      {/* ── Header ── */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "var(--color-bg-top)",
        borderBottom: "1px solid var(--color-border)",
        padding: "14px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        {/* Logo + Name */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "#00ee67",
            color: "#042f2e",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: "900",
            boxShadow: "0 2px 12px rgba(0, 238, 103, 0.35)",
            fontFamily: "var(--font-heading)",
          }}>
            ₹
          </div>
          <div>
            <div style={{
              fontWeight: 700, fontSize: 20,
              fontFamily: "var(--font-heading)",
              color: "var(--color-text-main)",
              letterSpacing: "-0.3px",
              lineHeight: 1.1,
            }}>
              Rupeestop
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 1 }}>
              Investment Committee AI
            </div>
          </div>
        </div>

        {/* Provider toggle */}
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 500, color: provider === "gemini" ? "var(--color-text-main)" : "var(--color-text-muted)" }}>
            <input type="radio" value="gemini" checked={provider === "gemini"} onChange={(e) => setProvider(e.target.value)} style={{ accentColor: "var(--color-primary)" }} />
            Gemini 2.0 Flash
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 500, color: provider === "groq" ? "var(--color-accent-lime)" : "var(--color-text-muted)" }}>
            <input type="radio" value="groq" checked={provider === "groq"} onChange={(e) => setProvider(e.target.value)} style={{ accentColor: "var(--color-accent-lime)" }} />
            Groq (Llama-3.3-70b)
          </label>
        </div>
      </header>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "60px 24px" }}>
        {/* ── Query Input ── */}
        <div className="animate-slide-up" style={{ marginBottom: 60 }}>
          <div className="rs-section-label">
            <span className="rs-section-label-dot" />
            Ask The Committee
          </div>

          <div style={{ display: "flex", gap: 16, position: "relative" }}>
            <textarea
              className="rs-input-glass"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Should I redeem my small cap SIP? Am I over-diversified?"
              rows={2}
              style={{ flex: 1, padding: "18px 22px", fontSize: 15, resize: "none", lineHeight: 1.6 }}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); runAnalysis(); } }}
            />
            <button
              className="rs-btn-primary"
              onClick={runAnalysis}
              disabled={isRunning || !question.trim()}
              style={{ minWidth: 160, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {isRunning ? (
                <>
                  <span style={{ display: "inline-block", animation: "pulseGlow 1.5s infinite" }}>●</span>
                  Analyzing
                </>
              ) : "Analyze →"}
            </button>
          </div>

          {/* Sample questions */}
          <div className="stagger-1 animate-slide-up" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
            <span style={{ fontSize: 12, color: "var(--color-text-muted)", alignSelf: "center", marginRight: 4 }}>Suggestions:</span>
            {SAMPLE_QUESTIONS.map((q, i) => (
              <button
                key={i}
                className="rs-btn-outline"
                onClick={() => setQuestion(q)}
                style={{ fontSize: 12 }}
              >
                {q.length > 65 ? q.slice(0, 62) + "..." : q}
              </button>
            ))}
          </div>
        </div>

        {/* ── Provider fallback notice ── */}
        {providerNotice && (
          <div className="rs-glass-card animate-slide-up" style={{
            borderLeft: "4px solid var(--color-accent-amber)",
            padding: "16px 24px",
            marginBottom: 24,
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
          }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, fontFamily: "var(--font-heading)", color: "var(--color-accent-amber)" }}>Switched to Fallback Model</div>
              <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{providerNotice}</div>
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="rs-glass-card animate-slide-up" style={{ borderLeft: "4px solid var(--color-accent-red)", padding: "20px 24px", marginBottom: 40 }}>
            <div style={{ fontWeight: 600, marginBottom: 6, fontFamily: "var(--font-heading)", color: "#fca5a5", display: "flex", alignItems: "center", gap: 8 }}>
              ⚠ Rate Limit Reached
            </div>
            <div style={{ fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.6 }}>
              Both Gemini and Groq API limits are currently exhausted. Please wait a few minutes and try again.
            </div>
          </div>
        )}

        {/* ── Pipeline Progress ── */}
        {pipelineSteps.length > 0 && (
          <div className="animate-slide-up" style={{ marginBottom: 60 }}>
            <PipelineProgress steps={pipelineSteps} isRunning={isRunning} />
          </div>
        )}

        {/* ── Results ── */}
        {result && (
          <div className="animate-slide-up stagger-2">
            <div className="rs-tabs">
              {[
                { id: "committee", label: "Committee Opinions" },
                { id: "verdict", label: "Final Verdict" },
                { id: "portfolio", label: "Portfolio Analysis" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`rs-tab ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ marginTop: 32 }}>
              {activeTab === "committee" && <CommitteeOpinions opinions={result.committee_opinions} />}
              {activeTab === "verdict" && <FinalVerdict result={result} />}
              {activeTab === "portfolio" && <PortfolioSummary />}
            </div>
          </div>
        )}

        {/* ── Empty State ── */}
        {!result && !isRunning && pipelineSteps.length === 0 && (
          <div className="animate-slide-up stagger-2" style={{ textAlign: "center", padding: "100px 0", color: "var(--color-text-muted)" }}>
            <div style={{
              width: 96, height: 96, borderRadius: "50%",
              background: "rgba(0, 238, 103, 0.06)",
              border: "1px solid rgba(0, 238, 103, 0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 30px", fontSize: 38,
              color: "var(--color-accent-lime)",
              fontFamily: "var(--font-heading)", fontWeight: 900,
            }}>
              ₹
            </div>
            <div style={{
              fontSize: 32, fontWeight: 700, fontFamily: "var(--font-heading)",
              marginBottom: 14, color: "var(--color-text-main)", letterSpacing: "-0.5px",
            }}>
              Your Committee. Your Freedom.
            </div>
            <div style={{ fontSize: 16, maxWidth: 480, margin: "0 auto", lineHeight: 1.7, color: "var(--color-text-muted)" }}>
              4 AI advisors will debate your question, analyze market data, and reach a consensus recommendation
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
