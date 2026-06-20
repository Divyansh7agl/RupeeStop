import { useState, useEffect } from "react";

const CATEGORY_COLORS = {
  "Large Cap": "var(--color-primary)",
  "Flexi Cap": "var(--color-accent-lime)",
  "Mid Cap": "#f59e0b",
  "Small Cap": "#f97316",
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

  if (!portfolio)
    return (
      <div
        style={{
          textAlign: "center",
          padding: 60,
          color: "var(--color-text-muted)",
          fontFamily: "var(--font-body)",
        }}
      >
        Loading portfolio data...
      </div>
    );

  const totalInvested = portfolio.portfolio.reduce((s, f) => s + f.invested_amount, 0);
  const totalCurrent = portfolio.portfolio.reduce((s, f) => s + f.current_value, 0);
  const totalReturn = ((totalCurrent - totalInvested) / totalInvested) * 100;

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 20 }}
      className="animate-slide-up stagger-1"
    >
      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
        }}
      >
        {[
          {
            label: "TOTAL INVESTED",
            value: `₹${(totalInvested / 100000).toFixed(1)}L`,
            color: "var(--color-text-main)",
          },
          {
            label: "CURRENT VALUE",
            value: `₹${(totalCurrent / 100000).toFixed(1)}L`,
            color: "var(--color-primary)",
          },
          {
            label: "TOTAL RETURNS",
            value: `+${totalReturn.toFixed(1)}%`,
            color: "var(--color-accent-lime)",
          },
          {
            label: "TOTAL FUNDS",
            value: portfolio.portfolio.length,
            color: "var(--color-text-main)",
          },
        ].map((stat, i) => (
          <div key={i} className="rs-glass-card">
            <div className="rs-card-body">
              <div className="rs-stat-label">{stat.label}</div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: stat.color,
                  fontFamily: "var(--font-heading)",
                }}
              >
                {stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Investor profile */}
      <div className="rs-glass-card">
        <div className="rs-card-header">
          <div className="rs-stat-label" style={{ marginBottom: 0 }}>INVESTOR PROFILE</div>
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
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--color-text-muted)",
                    marginBottom: 6,
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "var(--color-text-main)",
                    textTransform: "capitalize",
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fund table */}
      <div className="rs-glass-card">
        <div className="rs-card-header">
          <div className="rs-stat-label" style={{ marginBottom: 0 }}>HOLDINGS</div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="rs-table">
            <thead>
              <tr>
                {["Fund", "Category", "Allocation", "Invested", "Current", "Return"].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {portfolio.portfolio.map((fund, i) => {
                const ret =
                  ((fund.current_value - fund.invested_amount) / fund.invested_amount) * 100;
                const catColor = CATEGORY_COLORS[fund.category] || "var(--color-text-muted)";
                return (
                  <tr key={i}>
                    <td>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "var(--color-text-main)",
                        }}
                      >
                        {fund.fund_name}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: 11,
                          padding: "5px 10px",
                          borderRadius: 8,
                          backgroundColor: `${catColor}18`,
                          color: catColor,
                          fontWeight: 600,
                          border: `1px solid ${catColor}44`,
                        }}
                      >
                        {fund.category}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 90,
                            height: 5,
                            backgroundColor: "rgba(255,255,255,0.07)",
                            borderRadius: 3,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(fund.allocation_percent * 4, 100)}%`,
                              height: "100%",
                              backgroundColor: catColor,
                              borderRadius: 3,
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: 12,
                            color: "var(--color-text-muted)",
                            fontWeight: 600,
                          }}
                        >
                          {fund.allocation_percent}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                        ₹{(fund.invested_amount / 1000).toFixed(0)}K
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: 13,
                          color: "var(--color-text-main)",
                          fontWeight: 600,
                        }}
                      >
                        ₹{(fund.current_value / 1000).toFixed(0)}K
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color:
                            ret >= 0 ? "var(--color-accent-lime)" : "var(--color-accent-orange)",
                        }}
                      >
                        {ret > 0 ? "+" : ""}
                        {ret.toFixed(1)}%
                      </span>
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
