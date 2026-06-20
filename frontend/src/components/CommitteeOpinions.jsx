const ADVISOR_CONFIG = {
  conservative: {
    label: "Conservative Advisor",
    icon: "🛡️",
    color: "var(--color-primary)",
    desc: "Capital Preservation Focus"
  },
  growth: {
    label: "Growth Advisor",
    icon: "🚀",
    color: "var(--color-primary)",
    desc: "Long-term Returns Focus"
  },
  cost_efficiency: {
    label: "Cost & Efficiency Advisor",
    icon: "📊",
    color: "var(--color-primary)",
    desc: "Portfolio Simplicity Focus"
  },
  devils_advocate: {
    label: "Devil's Advocate",
    icon: "😈",
    color: "var(--color-primary)",
    desc: "Challenge & Risk Focus"
  },
};

const STANCE_COLORS = {
  BUY: "var(--color-accent-lime)",
  HOLD: "var(--color-text-main)",
  SELL: "var(--color-accent-orange)",
  RESTRUCTURE: "var(--color-primary)",
  CAUTION: "#fbbf24",
};

function ConfidenceBar({ value }) {
  const pct = Math.round(value * 100);
  const color = pct >= 75 ? "var(--color-accent-lime)" : pct >= 50 ? "#fbbf24" : "var(--color-accent-orange)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden", position: "relative" }}>
        <div style={{
          position: "absolute", top: 0, left: 0,
          width: `${pct}%`, height: "100%",
          backgroundColor: color, borderRadius: 3,
          transition: "width 1.5s cubic-bezier(0.22, 1, 0.36, 1)",
          boxShadow: `0 0 10px ${color}`
        }} />
      </div>
      <span style={{ fontSize: 13, color, fontWeight: 700, minWidth: 36, fontFamily: "var(--font-heading)" }}>{pct}%</span>
    </div>
  );
}

function AdvisorCard({ type, opinion, index }) {
  const config = ADVISOR_CONFIG[type];

  return (
    <div className={`rs-glass-card animate-slide-up stagger-${index + 1}`} style={{
      borderTop: `4px solid ${config.color}`,
      background: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)"
    }}>
      <div className="rs-card-body">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ 
              fontSize: 28, 
              background: "rgba(255,255,255,0.05)", 
              width: 56, height: 56,
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "inset 0 2px 10px rgba(255,255,255,0.05)"
            }}>
              {config.icon}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: config.color, fontFamily: "var(--font-heading)" }}>{config.label}</div>
              <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{config.desc}</div>
            </div>
          </div>
          {opinion?.stance && (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "6px 14px", borderRadius: 20,
              backgroundColor: "rgba(0,0,0,0.3)",
              color: STANCE_COLORS[opinion.stance] || "var(--color-text-main)",
              border: `1px solid ${STANCE_COLORS[opinion.stance] || "var(--glass-border)"}`,
              fontFamily: "var(--font-heading)",
              letterSpacing: "1px"
            }}>
              {opinion.stance}
            </span>
          )}
        </div>

        {opinion ? (
          <>
            {/* Confidence */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 8, fontWeight: 700, letterSpacing: "1px", fontFamily: "var(--font-heading)" }}>CONFIDENCE</div>
              <ConfidenceBar value={opinion.confidence} />
            </div>

            {/* Reasoning */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 8, fontWeight: 700, letterSpacing: "1px", fontFamily: "var(--font-heading)" }}>ANALYSIS</div>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--color-text-main)", margin: 0 }}>
                {opinion.reasoning}
              </p>
            </div>

            {/* Key Points */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 12, fontWeight: 700, letterSpacing: "1px", fontFamily: "var(--font-heading)" }}>KEY POINTS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {opinion.key_points?.map((point, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "rgba(0,0,0,0.15)", padding: "10px 14px", borderRadius: 8 }}>
                    <span style={{ color: "var(--color-primary)", fontSize: 14, marginTop: 1, flexShrink: 0 }}>▸</span>
                    <span style={{ fontSize: 14, color: "var(--color-text-main)", lineHeight: 1.5 }}>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence */}
            {opinion.evidence_used?.length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 10, fontWeight: 700, letterSpacing: "1px", fontFamily: "var(--font-heading)" }}>EVIDENCE USED</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {opinion.evidence_used.map((e, i) => (
                    <span key={i} style={{
                      fontSize: 11, padding: "6px 12px", borderRadius: 8,
                      backgroundColor: "rgba(255,255,255,0.03)", color: "var(--color-text-muted)", border: "1px solid var(--glass-border)"
                    }}>
                      {e.length > 40 ? e.slice(0, 37) + "..." : e}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--color-text-muted)" }}>
            Awaiting analysis...
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommitteeOpinions({ opinions }) {
  return (
    <div>
      <div style={{ fontSize: 14, color: "var(--color-primary)", fontWeight: 700, marginBottom: 24, letterSpacing: "1.5px", fontFamily: "var(--font-heading)" }}>
        COMMITTEE DEBATE — {Object.keys(opinions).length} ADVISORS
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 24 }}>
        {Object.entries(opinions).map(([type, opinion], index) => (
          <AdvisorCard key={type} type={type} opinion={opinion} index={index} />
        ))}
      </div>
    </div>
  );
}
