import { AlertTriangle } from "lucide-react";

function ConfidenceDial({ score }) {
  const pct = Math.round(score * 100);
  const color =
    pct >= 75
      ? "var(--color-accent-lime)"
      : pct >= 55
      ? "#f59e0b"
      : "#f97316";
  const label =
    pct >= 75 ? "High Confidence" : pct >= 55 ? "Moderate Confidence" : "Low Confidence";

  const r = 54;
  const circumference = Math.PI * r;
  const offset = circumference * (1 - pct / 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ position: "relative", width: 140, height: 80 }}>
        <svg width={140} height={80} viewBox="0 0 140 80" style={{ position: "absolute", top: 0, left: 0 }}>
          {/* Track */}
          <path
            d="M 14 70 A 56 56 0 0 1 126 70"
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={12}
            strokeLinecap="round"
          />
          {/* Arc fill — always lime green */}
          <path
            d="M 14 70 A 56 56 0 0 1 126 70"
            fill="none"
            stroke="var(--color-accent-lime)"
            strokeWidth={12}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
          <text
            x="70"
            y="65"
            textAnchor="middle"
            fill="var(--color-text-main)"
            fontSize={24}
            fontWeight={700}
            fontFamily="var(--font-heading)"
          >
            {pct}%
          </text>
        </svg>
      </div>
      <span
        style={{
          fontSize: 13,
          color,
          fontWeight: 700,
          fontFamily: "var(--font-heading)",
          letterSpacing: "0.3px",
        }}
      >
        {label}
      </span>
    </div>
  );
}

export default function FinalVerdict({ result }) {
  if (!result) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top row: confidence + recommendation */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20 }}>
        {/* Confidence */}
        <div className="rs-glass-card">
          <div
            className="rs-card-body"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              height: "100%",
              justifyContent: "center",
            }}
          >
            <div className="rs-stat-label" style={{ marginBottom: 0 }}>CONFIDENCE SCORE</div>
            <ConfidenceDial score={result.confidence_score} />
          </div>
        </div>

        {/* Final recommendation — lime green left border */}
        <div
          className="rs-glass-card"
          style={{
            borderLeft: "4px solid var(--color-accent-lime)",
            background: "var(--color-surface-1)",
          }}
        >
          <div className="rs-card-body" style={{ paddingLeft: 28 }}>
            <div
              className="rs-stat-label"
              style={{ color: "var(--color-accent-lime)", marginBottom: 16 }}
            >
              FINAL RECOMMENDATION
            </div>
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.8,
                color: "var(--color-text-main)",
                margin: 0,
                fontFamily: "var(--font-heading)",
              }}
            >
              {result.final_recommendation}
            </p>
          </div>
        </div>
      </div>

      {/* Action items */}
      {result.action_items?.length > 0 && (
        <div className="rs-glass-card">
          <div className="rs-card-body">
            <div className="rs-stat-label" style={{ marginBottom: 18 }}>ACTION ITEMS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {result.action_items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 14,
                    alignItems: "flex-start",
                    background: "var(--color-surface-2)",
                    padding: "14px 18px",
                    borderRadius: 10,
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div
                    style={{
                      minWidth: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "var(--color-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      color: "#fff",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </div>
                  <span
                    style={{
                      fontSize: 14,
                      color: "var(--color-text-main)",
                      lineHeight: 1.6,
                      marginTop: 3,
                    }}
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Agreements & Disagreements */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Agreements — lime green */}
        <div
          className="rs-glass-card"
          style={{ borderTop: "4px solid var(--color-accent-lime)" }}
        >
          <div className="rs-card-body">
            <div
              className="rs-stat-label"
              style={{ color: "var(--color-accent-lime)", marginBottom: 16 }}
            >
              ✓ Committee Agreements
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {result.agreements?.map((a, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 14,
                    color: "var(--color-text-main)",
                    lineHeight: 1.6,
                    paddingLeft: 14,
                    borderLeft: "3px solid var(--color-accent-lime)",
                  }}
                >
                  {a}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Disagreements — amber */}
        <div
          className="rs-glass-card"
          style={{ borderTop: "4px solid var(--color-accent-amber)" }}
        >
          <div className="rs-card-body">
            <div
              className="rs-stat-label"
              style={{ color: "var(--color-accent-amber)", marginBottom: 16 }}
            >
              ✗ Committee Disagreements
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {result.disagreements?.map((d, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 14,
                    color: "var(--color-text-main)",
                    lineHeight: 1.6,
                    paddingLeft: 14,
                    borderLeft: "3px solid var(--color-accent-amber)",
                  }}
                >
                  {d}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Risk warnings — red */}
      {result.risk_warnings?.length > 0 && (
        <div
          className="rs-glass-card"
          style={{
            borderLeft: "4px solid var(--color-accent-red)",
            background: "rgba(239, 68, 68, 0.04)",
          }}
        >
          <div className="rs-card-body">
            <div
              className="rs-stat-label"
              style={{ color: "var(--color-accent-red)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}
            >
              <AlertTriangle size={18} /> Risk Warnings
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {result.risk_warnings.map((w, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 14,
                    color: "var(--color-text-main)",
                    lineHeight: 1.6,
                    display: "flex",
                    gap: 10,
                  }}
                >
                  <span style={{ color: "var(--color-accent-red)", flexShrink: 0 }}>•</span>
                  <span>{w}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Evidence */}
      {result.evidence?.length > 0 && (
        <div className="rs-glass-card">
          <div className="rs-card-body">
            <div className="rs-stat-label" style={{ marginBottom: 14 }}>EVIDENCE BASE</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {result.evidence.map((e, i) => (
                <span key={i} className="rs-chip">
                  {e}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
