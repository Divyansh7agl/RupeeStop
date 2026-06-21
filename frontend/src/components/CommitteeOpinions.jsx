import Icon from "./Icon";

// Advisor config — icon now maps to SVG icon name, not emoji
const ADVISOR_CONFIG = {
  conservative: {
    label:     "Conservative Advisor",
    icon:      "shield",
    desc:      "Capital Preservation Focus",
    topColor:  "#f59e0b",   // amber
    nameColor: "#f59e0b",
  },
  growth: {
    label:     "Growth Advisor",
    icon:      "trendingUp",
    desc:      "Long-term Returns Focus",
    topColor:  "#00ee67",   // lime
    nameColor: "#00ee67",
  },
  cost_efficiency: {
    label:     "Cost & Efficiency Advisor",
    icon:      "barChart",
    desc:      "Portfolio Simplicity Focus",
    topColor:  "#0d9488",   // teal
    nameColor: "#14b8a6",
  },
  devils_advocate: {
    label:     "Devil's Advocate",
    icon:      "alertTriangle",
    desc:      "Challenge & Risk Focus",
    topColor:  "#ef4444",   // red
    nameColor: "#ef4444",
  },
};

const STANCE_COLORS = {
  BUY:         "#00ee67",
  HOLD:        "#f0fdfa",
  SELL:        "#f59e0b",
  RESTRUCTURE: "#14b8a6",
  CAUTION:     "#fbbf24",
};

// Key-point bullet as a tiny SVG chevron
function BulletIcon({ color }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0, marginTop: 3 }}
    >
      <polyline points="3,2 9,6 3,10" stroke={color} strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
    </svg>
  );
}

function ConfidenceBar({ value }) {
  const pct   = Math.round(value * 100);
  const color = pct >= 75 ? "var(--color-accent-lime)" : pct >= 50 ? "#fbbf24" : "#f59e0b";
  return (
    <div className="confidence-bar-row">
      <div className="confidence-bar-track">
        <div
          className="confidence-bar-fill"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="confidence-value" style={{ color }}>{pct}%</span>
    </div>
  );
}

function AdvisorCard({ type, opinion }) {
  const config = ADVISOR_CONFIG[type] ?? {
    label:     type,
    icon:      "barChart",
    desc:      "",
    topColor:  "var(--color-primary)",
    nameColor: "var(--color-text-main)",
  };

  return (
    <div
      className="advisor-card"
      style={{ borderTop: `4px solid ${config.topColor}` }}
    >
      <div className="advisor-card-body">
        {/* Header row */}
        <div className="advisor-card-header-row">
          <div className="advisor-icon-wrap">
            {/* SVG icon in a tinted box */}
            <div
              className="advisor-icon"
              style={{
                backgroundColor: `${config.topColor}18`,
                border: `1px solid ${config.topColor}40`,
              }}
            >
              <Icon name={config.icon} size={20} color={config.topColor} />
            </div>
            <div>
              <div className="advisor-name" style={{ color: config.nameColor }}>
                {config.label}
              </div>
              <div className="advisor-desc">{config.desc}</div>
            </div>
          </div>

          {opinion?.stance && (
            <span
              className="stance-badge"
              style={{
                color:  STANCE_COLORS[opinion.stance] ?? "var(--color-text-main)",
                border: `1px solid ${STANCE_COLORS[opinion.stance] ?? "var(--color-border)"}`,
              }}
            >
              {opinion.stance}
            </span>
          )}
        </div>

        {opinion ? (
          <>
            {/* Confidence */}
            <div className="confidence-row">
              <div className="section-micro-label">Confidence</div>
              <ConfidenceBar value={opinion.confidence} />
            </div>

            {/* Reasoning — flex:1 so bottom sections stay aligned across cards */}
            <div style={{ marginBottom: 18, flex: 1 }}>
              <div className="section-micro-label">Analysis</div>
              <p className="advisor-analysis-text">{opinion.reasoning}</p>
            </div>

            {/* Key Points */}
            <div style={{ marginBottom: 16 }}>
              <div className="section-micro-label">Key Points</div>
              <div className="key-points-list">
                {opinion.key_points?.map((point, i) => (
                  <div key={i} className="key-point-item">
                    <BulletIcon color={config.topColor} />
                    <span className="key-point-text">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence */}
            {opinion.evidence_used?.length > 0 && (
              <div>
                <div className="section-micro-label">Evidence Used</div>
                <div className="evidence-tags">
                  {opinion.evidence_used.map((e, i) => (
                    <span key={i} className="evidence-tag">
                      {e.length > 40 ? e.slice(0, 37) + "…" : e}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="advisor-awaiting">Awaiting analysis…</div>
        )}
      </div>
    </div>
  );
}

export default function CommitteeOpinions({ opinions }) {
  return (
    <div>
      <div className="component-label">
        Committee Debate — {Object.keys(opinions).length} Advisors
      </div>
      <div className="committee-grid">
        {Object.entries(opinions).map(([type, opinion]) => (
          <AdvisorCard key={type} type={type} opinion={opinion} />
        ))}
      </div>
    </div>
  );
}
