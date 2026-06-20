import { useState, useEffect } from "react";

const CATEGORY_COLORS = {
  "Large Cap": "var(--color-primary)",
  "Flexi Cap": "var(--color-accent-lime)",
  "Mid Cap": "#fbbf24",
  "Small Cap": "var(--color-accent-orange)",
  "Balanced Advantage": "#a855f7",
  "Sectoral - Technology": "#38bdf8",
  "Debt - Gilt": "var(--color-text-muted)",
};

export default function PortfolioSummary() {
  const [portfolio, setPortfolio] = useState(null);

  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    fetch(`${API_BASE}/portfolio`)
      .then((r) => r.json())
      .then(setPortfolio)
      .catch(() => {});
  }, []);

  if (!portfolio) return (
    <div style={{ textAlign: "center", padding: 60, color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>Loading portfolio data...</div>
  );

  const totalInvested = portfolio.portfolio.reduce((s, f) => s + f.invested_amount, 0);
  const totalCurrent = portfolio.portfolio.reduce((s, f) => s + f.current_value, 0);
  const totalReturn = ((totalCurrent - totalInvested) / totalInvested) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }} className="animate-slide-up stagger-1">
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        {[
          { label: "TOTAL INVESTED", value: `₹${(totalInvested / 100000).toFixed(1)}L`, color: "var(--color-text-main)" },
          { label: "CURRENT VALUE", value: `₹${(totalCurrent / 100000).toFixed(1)}L`, color: "var(--color-primary)" },
          { label: "TOTAL RETURNS", value: `+${totalReturn.toFixed(1)}%`, color: "var(--color-accent-lime)" },
          { label: "TOTAL FUNDS", value: portfolio.portfolio.length, color: "var(--color-text-main)" },
        ].map((stat, i) => (
          <div key={i} className="rs-glass-card">
            <div className="rs-card-body">
              <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 12, fontFamily: "var(--font-heading)", letterSpacing: "1px", fontWeight: 700 }}>{stat.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: stat.color, fontFamily: "var(--font-heading)" }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Investor profile */}
      <div className="rs-glass-card">
        <div className="rs-card-header">
          <div style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 700, letterSpacing: "1px", fontFamily: "var(--font-heading)" }}>
            INVESTOR PROFILE
          </div>
        </div>
        <div className="rs-card-body">
          <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
            {[
              { label: "Age", value: `${portfolio.age} years` },
              { label: "Risk Profile", value: portfolio.risk_profile },
              { label: "Goals", value: portfolio.goals.join(", ") },
              { label: "Horizon", value: `${portfolio.investment_horizon_years} years` },
            ].map((item, i) => (
              <div key={i}>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 6 }}>{item.label}</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text-main)", textTransform: "capitalize" }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fund list */}
      <div className="rs-glass-card">
        <div className="rs-card-header">
          <div style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 700, letterSpacing: "1px", fontFamily: "var(--font-heading)" }}>
            HOLDINGS
          </div>
        </div>
        <div style={{overflowX: "auto"}}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
            <thead>
              <tr style={{ backgroundColor: "rgba(0,0,0,0.2)" }}>
                {["Fund", "Category", "Allocation", "Invested", "Current", "Return"].map((h) => (
                  <th key={h} style={{ padding: "16px 24px", textAlign: "left", fontSize: 12, color: "var(--color-text-muted)", fontWeight: 700, fontFamily: "var(--font-heading)", letterSpacing: "1px", borderBottom: "1px solid var(--glass-border)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {portfolio.portfolio.map((fund, i) => {
                const ret = ((fund.current_value - fund.invested_amount) / fund.invested_amount) * 100;
                const catColor = CATEGORY_COLORS[fund.category] || "var(--color-text-muted)";
                return (
                  <tr key={i} style={{ borderBottom: "1px solid var(--glass-border)", transition: "background 0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"} onMouseOut={(e) => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "20px 24px", fontSize: 15, fontWeight: 600, color: "var(--color-text-main)" }}>{fund.fund_name}</td>
                    <td style={{ padding: "20px 24px" }}>
                      <span style={{
                        fontSize: 12, padding: "6px 12px", borderRadius: 8,
                        backgroundColor: "rgba(0,0,0,0.3)", color: catColor, fontWeight: 600,
                        border: `1px solid ${catColor}44`
                      }}>
                        {fund.category}
                      </span>
                    </td>
                    <td style={{ padding: "20px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 100, height: 6, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ width: `${fund.allocation_percent * (100 / 25)}px`, maxWidth: "100%", height: "100%", backgroundColor: catColor, borderRadius: 3, boxShadow: `0 0 8px ${catColor}` }} />
                        </div>
                        <span style={{ fontSize: 13, color: "var(--color-text-muted)", fontWeight: 600 }}>{fund.allocation_percent}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "20px 24px", fontSize: 14, color: "var(--color-text-muted)" }}>₹{(fund.invested_amount / 1000).toFixed(0)}K</td>
                    <td style={{ padding: "20px 24px", fontSize: 14, color: "var(--color-text-main)", fontWeight: 600 }}>₹{(fund.current_value / 1000).toFixed(0)}K</td>
                    <td style={{ padding: "20px 24px", fontSize: 14, fontWeight: 700, color: ret >= 0 ? "var(--color-accent-lime)" : "var(--color-accent-orange)" }}>
                      {ret > 0 ? "+" : ""}{ret.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
