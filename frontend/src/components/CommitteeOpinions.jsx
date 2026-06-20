const ADVISOR_CONFIG = {
  conservative: {
    label: "Conservative Advisor",
    icon: "🛡️",
    borderColor: "#f59e0b",
    desc: "Capital Preservation Focus",
  },
  growth: {
    label: "Growth Advisor",
    icon: "🚀",
    borderColor: "#00ee67",
    desc: "Long-term Returns Focus",
  },
  cost_efficiency: {
    label: "Cost & Efficiency Advisor",
    icon: "📊",
    borderColor: "#0d9488",
    desc: "Portfolio Simplicity Focus",
  },
  devils_advocate: {
    label: "Devil's Advocate",
    icon: "😈",
    borderColor: "#ef4444",
    desc: "Challenge & Risk Focus",
  },
};

const STANCE_COLORS = {
  BUY: "var(--color-accent-lime)",
  HOLD: "var(--color-text-main)",
  SELL: "#f97316",
  RESTRUCTURE: "var(--color-primary)",
  CAUTION: "#f59e0b",
};

function ConfidenceBar({ value }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 75
      ? "var(--color-accent-lime)"
      : pct >= 50
      ? "#f59e0b"
      : "#f97316";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          flex: 1,
          height: 6,
          background: "rgba(255,255,255,0.06)",
          borderRadius: 3,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: `${pct}%`,
            height: "100%",
            backgroundColor: color,
            borderRadius: 3,
            transition: "width 1.4s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </div>
      <span
        style={{
          fontSize: 13,
          color,
          fontWeight: 700,
          minWidth: 36,
          fontFamily: "var(--font-heading)",
        }}
      >
        {pct}%
      </span>
    </div>
  );
}

function AdvisorCard({ type, opinion, index }) {
  const config = ADVISOR_CONFIG[type] || {
    label: type,
    icon: "🤖",
    borderColor: "var(--color-primary)",
    desc: "",
  };

  return (
    <div
      className={`rs-glass-card animate-slide-up stagger-${index + 1}`}
      style={{ borderTop: `4px solid ${config.borderColor}` }}
    >
      <div className="rs-card-body">
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                fontSize: 26,
                background: "var(--color-surface-2)",
                width: 52,
                height: 52,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 14,
                border: "1px solid var(--color-border)",
              }}
            >
              {config.icon}
            </div>
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: config.borderColor,
                  fontFamily: "var(--font-heading)",
                  lineHeight: 1.2,
                }}
              >
                {config.label}
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 3 }}>
                {config.desc}
              </div>
            </div>
          </div>

          {opinion?.stance && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "5px 13px",
                borderRadius: 20,
                backgroundColor: "var(--color-surface-2)",
                color: STANCE_COLORS[opinion.stance] || "var(--color-text-main)",
                border: `1px solid ${STANCE_COLORS[opinion.stance] || "var(--color-border)"}44`,
                fontFamily: "var(--font-heading)",
                letterSpacing: "0.8px",
              }}
            >
              {opinion.stance}
            </span>
          )}
        </div>

        {opinion ? (
          <>
            {/* Confidence */}
            <div style={{ marginBottom: 22 }}>
              <div className="rs-stat-label">CONFIDENCE</div>
              <ConfidenceBar value={opinion.confidence} />
            </div>

            {/* Reasoning */}
            <div style={{ marginBottom: 22 }}>
              <div className="rs-stat-label">ANALYSIS</div>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: "var(--color-text-main)",
                  margin: 0,
                }}
              >
                {opinion.reasoning}
              </p>
            </div>

            {/* Key Points */}
            <div style={{ marginBottom: 20 }}>
              <div className="rs-stat-label">KEY POINTS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {opinion.key_points?.map((point, i) => (
                  <div key={i} className="rs-key-point">
                    <span className="rs-key-point-arrow">▸</span>
                    <span style={{ fontSize: 13, color: "var(--color-text-main)", lineHeight: 1.5 }}>
                      {point}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence */}
            {opinion.evidence_used?.length > 0 && (
              <div>
                <div className="rs-stat-label">EVIDENCE USED</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {opinion.evidence_used.map((e, i) => (
                    <span key={i} className="rs-chip">
                      {e.length > 40 ? e.slice(0, 37) + "..." : e}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              color: "var(--color-text-muted)",
              fontStyle: "italic",
              fontSize: 14,
            }}
          >
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
      <div
        style={{
          fontSize: 12,
          color: "var(--color-primary)",
          fontWeight: 700,
          marginBottom: 24,
          letterSpacing: "1.5px",
          fontFamily: "var(--font-heading)",
          textTransform: "uppercase",
        }}
      >
        Committee Debate — {Object.keys(opinions).length} Advisors
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: 20,
        }}
      >
        {Object.entries(opinions).map(([type, opinion], index) => (
          <AdvisorCard key={type} type={type} opinion={opinion} index={index} />
        ))}
      </div>
    </div>
  );
}
