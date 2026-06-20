function ConfidenceDial({ score }) {
  const pct = Math.round(score * 100);
  const color = pct >= 75 ? "var(--color-accent-lime)" : pct >= 55 ? "#fbbf24" : "var(--color-accent-orange)";
  const label = pct >= 75 ? "High Confidence" : pct >= 55 ? "Moderate Confidence" : "Low Confidence";

  // SVG arc
  const r = 54;
  const circumference = Math.PI * r;
  const offset = circumference * (1 - pct / 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{position: "relative", width: 140, height: 80}}>
        <svg width={140} height={80} viewBox="0 0 140 80" style={{position: "absolute", top: 0, left: 0}}>
          {/* Track */}
          <path
            d="M 14 70 A 56 56 0 0 1 126 70"
            fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={12} strokeLinecap="round"
          />
          {/* Progress */}
          <path
            d="M 14 70 A 56 56 0 0 1 126 70"
            fill="none" stroke={color} strokeWidth={12} strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1)", filter: `drop-shadow(0 0 8px ${color}66)` }}
          />
          <text x="70" y="65" textAnchor="middle" fill="var(--color-text-main)" fontSize={26} fontWeight={700} fontFamily="var(--font-heading)">{pct}%</text>
        </svg>
      </div>
      <span style={{ fontSize: 14, color, fontWeight: 700, fontFamily: "var(--font-heading)", letterSpacing: "0.5px" }}>{label}</span>
    </div>
  );
}

export default function FinalVerdict({ result }) {
  if (!result) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Top row: confidence + recommendation */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}>
        {/* Confidence */}
        <div className="rs-glass-card">
          <div className="rs-card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, height: "100%", justifyContent: "center" }}>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 700, letterSpacing: "1px", fontFamily: "var(--font-heading)" }}>CONFIDENCE SCORE</div>
            <ConfidenceDial score={result.confidence_score} />
          </div>
        </div>

        {/* Final recommendation */}
        <div className="rs-glass-card" style={{ position: "relative", overflow: "hidden" }}>
          <div style={{position: "absolute", top: 0, left: 0, width: 6, height: "100%", background: "var(--color-primary)", boxShadow: "0 0 15px var(--color-primary)"}}></div>
          <div className="rs-card-body" style={{ paddingLeft: 36 }}>
            <div style={{ fontSize: 12, color: "var(--color-primary)", fontWeight: 700, letterSpacing: "1px", marginBottom: 20, fontFamily: "var(--font-heading)", display: "flex", alignItems: "center", gap: 8 }}>
              FINAL RECOMMENDATION
            </div>
            <p style={{ fontSize: 18, lineHeight: 1.8, color: "var(--color-text-main)", margin: 0, fontWeight: 400, fontFamily: "var(--font-heading)" }}>
              {result.final_recommendation}
            </p>
          </div>
        </div>
      </div>

      {/* Action items */}
      {result.action_items?.length > 0 && (
        <div className="rs-glass-card">
          <div className="rs-card-body">
            <div style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 700, letterSpacing: "1px", marginBottom: 20, fontFamily: "var(--font-heading)" }}>
              ACTION ITEMS
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {result.action_items.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", background: "rgba(0,0,0,0.2)", padding: "16px 20px", borderRadius: 12, border: "1px solid var(--glass-border)" }}>
                  <div style={{
                    minWidth: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, var(--color-primary) 0%, #0d9488 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff", fontWeight: 700,
                    boxShadow: "0 2px 10px rgba(20, 184, 166, 0.3)"
                  }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 15, color: "var(--color-text-main)", lineHeight: 1.6, marginTop: 4 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Agreements & Disagreements */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div className="rs-glass-card" style={{ borderTop: "4px solid var(--color-accent-lime)", background: "linear-gradient(180deg, rgba(16, 185, 129, 0.05) 0%, rgba(0,0,0,0) 100%)" }}>
          <div className="rs-card-body">
            <div style={{ fontSize: 13, color: "var(--color-accent-lime)", fontWeight: 700, letterSpacing: "1px", marginBottom: 20, fontFamily: "var(--font-heading)", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{fontSize: 16}}>✓</span> COMMITTEE AGREEMENTS
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {result.agreements?.map((a, i) => (
                <div key={i} style={{ fontSize: 14, color: "var(--color-text-main)", lineHeight: 1.6, paddingLeft: 16, borderLeft: "3px solid var(--color-accent-lime)" }}>
                  {a}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rs-glass-card" style={{ borderTop: "4px solid var(--color-accent-orange)", background: "linear-gradient(180deg, rgba(249, 115, 22, 0.05) 0%, rgba(0,0,0,0) 100%)" }}>
          <div className="rs-card-body">
            <div style={{ fontSize: 13, color: "var(--color-accent-orange)", fontWeight: 700, letterSpacing: "1px", marginBottom: 20, fontFamily: "var(--font-heading)", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{fontSize: 16}}>✗</span> COMMITTEE DISAGREEMENTS
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {result.disagreements?.map((d, i) => (
                <div key={i} style={{ fontSize: 14, color: "var(--color-text-main)", lineHeight: 1.6, paddingLeft: 16, borderLeft: "3px solid var(--color-accent-orange)" }}>
                  {d}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Risk warnings */}
      {result.risk_warnings?.length > 0 && (
        <div className="rs-glass-card" style={{ borderLeft: "4px solid #ef4444", background: "rgba(239, 68, 68, 0.05)" }}>
          <div className="rs-card-body">
            <div style={{ fontSize: 12, color: "#ef4444", fontWeight: 700, letterSpacing: "1px", marginBottom: 16, fontFamily: "var(--font-heading)" }}>
              ⚠ RISK WARNINGS
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {result.risk_warnings.map((w, i) => (
                <div key={i} style={{ fontSize: 14, color: "var(--color-text-main)", lineHeight: 1.6, display: "flex", gap: 12 }}>
                  <span style={{ color: "#ef4444" }}>•</span><span>{w}</span>
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
            <div style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 700, letterSpacing: "1px", marginBottom: 16, fontFamily: "var(--font-heading)" }}>
              EVIDENCE BASE
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {result.evidence.map((e, i) => (
                <span key={i} style={{
                  fontSize: 13, padding: "8px 16px", borderRadius: 8,
                  backgroundColor: "rgba(0,0,0,0.3)", color: "var(--color-text-muted)", border: "1px solid var(--glass-border)"
                }}>
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
