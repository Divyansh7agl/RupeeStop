const STEP_ICONS = {
  load_profile: "👤",
  planner: "🧠",
  tool_execution: "🔧",
  specialists_parallel: "⚡",
  devils_advocate: "😈",
  consensus: "⚖️",
  pipeline_complete: "✅",
};

const STEP_COLORS = {
  pending: "var(--color-text-muted)",
  running: "var(--color-primary)",
  completed: "var(--color-accent-lime)",
  failed: "#ef4444",
};

export default function PipelineProgress({ steps, isRunning }) {
  return (
    <div className="rs-glass-card">
      <div className="rs-card-body">
        <div style={{ fontSize: 13, color: "var(--color-text-main)", fontWeight: 700, marginBottom: 32, letterSpacing: "1px", fontFamily: "var(--font-heading)", display: "flex", alignItems: "center", gap: 10 }}>
          {isRunning ? <span style={{width: 8, height: 8, borderRadius: "50%", background: "var(--color-primary)", boxShadow: "0 0 10px var(--color-primary)", animation: "pulseGlow 2s infinite"}}></span> : null}
          PIPELINE EXECUTION
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 0, overflowX: "auto", paddingBottom: 16 }}>
          {steps.map((step, i) => (
            <div key={step.id} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : 0 }}>
              {/* Step node */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 100 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%",
                  backgroundColor: step.status === "completed" ? "rgba(16, 185, 129, 0.1)"
                    : step.status === "running" ? "rgba(20, 184, 166, 0.1)"
                    : "rgba(255,255,255,0.03)",
                  border: `2px solid ${step.status === "completed" ? "var(--color-accent-lime)" : step.status === "running" ? "var(--color-primary)" : "var(--glass-border)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, position: "relative",
                  boxShadow: step.status === "running" ? `0 0 20px rgba(20, 184, 166, 0.4)` : "none",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform: step.status === "running" ? "scale(1.1)" : "scale(1)"
                }}>
                  {step.status === "running" ? (
                    <span style={{ animation: "spin 1.5s linear infinite", display: "inline-block", color: "var(--color-primary)" }}>⟳</span>
                  ) : STEP_ICONS[step.id]}
                </div>
                <div style={{
                  fontSize: 12, marginTop: 16, textAlign: "center",
                  color: step.status === "completed" ? "var(--color-text-main)"
                    : step.status === "running" ? "var(--color-primary)"
                    : "var(--color-text-muted)",
                  fontWeight: step.status !== "pending" ? 600 : 400,
                  maxWidth: 90, lineHeight: 1.4,
                  fontFamily: "var(--font-heading)"
                }}>
                  {step.label}
                </div>
                {step.status === "running" && step.details && (
                  <div style={{ fontSize: 11, color: "var(--color-text-muted)", textAlign: "center", maxWidth: 110, marginTop: 8, background: "rgba(0,0,0,0.3)", padding: "4px 8px", borderRadius: 4 }}>
                    {step.details.slice(0, 35)}...
                  </div>
                )}
              </div>

              {/* Connector line */}
              {i < steps.length - 1 && (
                <div style={{
                  flex: 1, height: 3, minWidth: 20,
                  background: step.status === "completed"
                    ? "linear-gradient(90deg, var(--color-accent-lime), rgba(255,255,255,0.1))"
                    : "var(--glass-border)",
                  transition: "background 0.5s",
                  marginBottom: 44, // Adjusted to align with the circle centers
                  borderRadius: 2
                }} />
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
