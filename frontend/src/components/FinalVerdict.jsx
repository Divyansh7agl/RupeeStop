function ConfidenceDial({ score }) {
  const pct   = Math.round(score * 100);
  // Always use lime green for the arc fill, per brand spec
  const color = "#00ee67";
  const label = pct >= 75 ? "High Confidence" : pct >= 55 ? "Moderate Confidence" : "Low Confidence";

  // SVG semicircle arc
  const r            = 54;
  const circumference = Math.PI * r;
  const offset       = circumference * (1 - pct / 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <svg width={140} height={80} viewBox="0 0 140 80">
        {/* Track */}
        <path
          d="M 14 70 A 56 56 0 0 1 126 70"
          fill="none"
          stroke="var(--color-bg-input)"
          strokeWidth={10}
          strokeLinecap="round"
        />
        {/* Progress arc — lime green */}
        <path
          d="M 14 70 A 56 56 0 0 1 126 70"
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.5s ease" }}
        />
        <text
          x="70" y="65"
          textAnchor="middle"
          fill={color}
          fontSize={24}
          fontWeight={700}
          fontFamily="var(--font-heading)"
        >
          {pct}%
        </text>
      </svg>
      <span className="confidence-dial-sublabel" style={{ color }}>{label}</span>
    </div>
  );
}

export default function FinalVerdict({ result }) {
  if (!result) return null;

  return (
    <div className="verdict-layout">
      {/* Top row: confidence dial + final recommendation */}
      <div className="verdict-top-row">
        <div className="verdict-confidence-card">
          <div className="confidence-dial-label">Confidence</div>
          <ConfidenceDial score={result.confidence_score} />
        </div>

        <div className="verdict-rec-card">
          <div className="section-micro-label" style={{ marginBottom: 16 }}>Final Recommendation</div>
          <p className="verdict-rec-text">{result.final_recommendation}</p>
        </div>
      </div>

      {/* Action Items */}
      {result.action_items?.length > 0 && (
        <div className="rs-card">
          <div className="rs-card-body">
            <div className="section-micro-label" style={{ marginBottom: 16 }}>Action Items</div>
            <div className="action-items-list">
              {result.action_items.map((item, i) => (
                <div key={i} className="action-item-row">
                  <div className="action-item-num">{i + 1}</div>
                  <span className="action-item-text">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Agreements & Disagreements */}
      <div className="verdict-split-grid">
        <div className="agreements-card">
          <div className="agreements-label">✓ Committee Agreements</div>
          <div>
            {result.agreements?.map((a, i) => (
              <div key={i} className="verdict-point-item agreement">{a}</div>
            ))}
          </div>
        </div>

        <div className="disagreements-card">
          <div className="disagreements-label">✗ Committee Disagreements</div>
          <div>
            {result.disagreements?.map((d, i) => (
              <div key={i} className="verdict-point-item disagreement">{d}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Warnings */}
      {result.risk_warnings?.length > 0 && (
        <div className="risk-warnings-card">
          <div className="risk-warnings-label">⚠ Risk Warnings</div>
          <div>
            {result.risk_warnings.map((w, i) => (
              <div key={i} className="risk-warning-row">
                <span className="risk-bullet">•</span>
                <span>{w}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evidence Base */}
      {result.evidence?.length > 0 && (
        <div className="rs-card">
          <div className="rs-card-body">
            <div className="section-micro-label" style={{ marginBottom: 16 }}>Evidence Base</div>
            <div className="evidence-base-tags">
              {result.evidence.map((e, i) => (
                <span key={i} className="evidence-base-tag">{e}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
