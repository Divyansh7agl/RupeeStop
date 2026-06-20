import { useState, useRef } from "react";
import PipelineProgress from "./components/PipelineProgress";
import CommitteeOpinions from "./components/CommitteeOpinions";
import FinalVerdict from "./components/FinalVerdict";
import PortfolioSummary from "./components/PortfolioSummary";

const SAMPLE_QUESTIONS = [
  "Should I redeem my small cap fund given current market volatility?",
  "Am I over-diversified with 8 funds in my portfolio?",
  "Is my portfolio allocation consistent with my age and moderate risk profile?",
  "Why might my portfolio be more volatile than expected?",
  "Should I consolidate my two large cap funds into one?",
];

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function App() {
  const [question, setQuestion] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [pipelineSteps, setPipelineSteps] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("committee");
  const [provider, setProvider] = useState("gemini");
  const abortRef = useRef(null);

  const runAnalysis = async () => {
    if (!question.trim()) return;
    setIsRunning(true);
    setResult(null);
    setError(null);
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
            } else if (event.type === "final_result") {
              setResult(event.data);
              setActiveTab("committee");
            } else if (event.type === "error") {
              setError(event.message);
            }
          } catch {}
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
      {/* Header */}
      <header style={{ 
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(10, 10, 15, 0.7)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--glass-border)",
        padding: "16px 40px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent-lime) 100%)",
            color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: "bold",
            boxShadow: "0 4px 20px rgba(20, 184, 166, 0.4)"
          }}>
            ₹
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 20, fontFamily: "var(--font-heading)", letterSpacing: "-0.5px", background: "linear-gradient(to right, #fff, #a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Rupeestop
            </div>
            <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Investment Committee AI</div>
          </div>
        </div>
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
        {/* Query Input */}
        <div className="animate-slide-up" style={{ marginBottom: 60 }}>
          <div style={{ 
            fontSize: 13, 
            color: "var(--color-primary)", 
            marginBottom: 16, 
            fontWeight: 700,
            fontFamily: "var(--font-heading)",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            display: "flex", alignItems: "center", gap: 8
          }}>
            <span style={{width: 8, height: 8, borderRadius: "50%", background: "var(--color-primary)", boxShadow: "0 0 10px var(--color-primary)"}}></span>
            Ask The Committee
          </div>
          <div style={{ display: "flex", gap: 16, position: "relative" }}>
            <textarea
              className="rs-input-glass"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Should I redeem my small cap fund? Am I over-diversified?"
              rows={2}
              style={{
                flex: 1,
                padding: "20px 24px", 
                fontSize: 16, 
                resize: "none", 
                lineHeight: 1.6,
              }}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); runAnalysis(); } }}
            />
            <button
              className="rs-btn-primary"
              onClick={runAnalysis}
              disabled={isRunning || !question.trim()}
              style={{ minWidth: 160, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {isRunning ? (
                <>
                  <span style={{ display: "inline-block", animation: "pulseGlow 2s infinite" }}>●</span>
                  Analyzing
                </>
              ) : "Analyze →"}
            </button>
          </div>

          {/* Sample questions */}
          <div className="stagger-1 animate-slide-up" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
            <span style={{ fontSize: 13, color: "var(--color-text-muted)", alignSelf: "center", marginRight: 8 }}>Suggestions:</span>
            {SAMPLE_QUESTIONS.map((q, i) => (
              <button
                key={i}
                className="rs-btn-outline"
                onClick={() => setQuestion(q)}
                style={{ fontSize: 13 }}
              >
                {q.length > 65 ? q.slice(0, 62) + "..." : q}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rs-glass-card animate-slide-up" style={{ borderLeft: "4px solid #ef4444", padding: "20px 24px", marginBottom: 40, color: "#fca5a5" }}>
            <div style={{fontWeight: 600, marginBottom: 4}}>Error Analysis Failed</div>
            <div style={{fontSize: 14}}>{error}</div>
          </div>
        )}

        {/* Pipeline Progress */}
        {pipelineSteps.length > 0 && (
          <div className="animate-slide-up" style={{ marginBottom: 60 }}>
            <PipelineProgress steps={pipelineSteps} isRunning={isRunning} />
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="animate-slide-up stagger-2">
            {/* Tabs */}
            <div className="rs-tabs">
              {[
                { id: "committee", label: "Committee Opinions" },
                { id: "verdict", label: "Final Verdict" },
                { id: "portfolio", label: "Portfolio Analysis" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`rs-tab ${activeTab === tab.id ? 'active' : ''}`}
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

        {!result && !isRunning && pipelineSteps.length === 0 && (
          <div className="animate-slide-up stagger-2" style={{ textAlign: "center", padding: "100px 0", color: "var(--color-text-muted)" }}>
            <div style={{ 
              width: 100, height: 100, borderRadius: "50%", 
              background: "rgba(20, 184, 166, 0.05)",
              border: "1px solid rgba(20, 184, 166, 0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 30px", fontSize: 40, color: "var(--color-primary)"
            }}>
              ₹
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "var(--font-heading)", marginBottom: 16, color: "var(--color-text-main)", letterSpacing: "-0.5px" }}>
              Committee Standing By
            </div>
            <div style={{ fontSize: 16, maxWidth: 500, margin: "0 auto", lineHeight: 1.6 }}>
              Our 4 AI advisors are ready to debate your question, analyze market data, and reach a holistic consensus recommendation.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
