import { useState, useEffect } from "react";

// Converts snake_case or lowercase to Title Case: "wealth_creation" → "Wealth Creation"
const formatLabel = (str) =>
  str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const CATEGORY_COLORS = {
  "Large Cap":              "var(--color-primary-light)",
  "Flexi Cap":              "var(--color-accent-lime)",
  "Mid Cap":                "#fbbf24",
  "Small Cap":              "#f59e0b",
  "Balanced Advantage":     "var(--color-text-main)",
  "Sectoral - Technology":  "#38bdf8",
  "Debt - Gilt":            "var(--color-text-muted)",
};

export default function PortfolioSummary() {
  const [portfolio, setPortfolio] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:8000"}/portfolio`)
      .then((r) => r.json())
      .then(setPortfolio)
      .catch(() => {});
  }, []);

  if (!portfolio) {
    return <div className="portfolio-loading">Loading portfolio…</div>;
  }

  const totalInvested = portfolio.portfolio.reduce((s, f) => s + f.invested_amount, 0);
  const totalCurrent  = portfolio.portfolio.reduce((s, f) => s + f.current_value, 0);
  const totalReturn   = ((totalCurrent - totalInvested) / totalInvested) * 100;

  return (
    <div className="portfolio-layout">
      {/* Summary Stats */}
      <div className="portfolio-stats-grid">
        {[
          { label: "Total Invested", value: `₹${(totalInvested / 100000).toFixed(1)}L`, color: "var(--color-text-muted)" },
          { label: "Current Value",  value: `₹${(totalCurrent / 100000).toFixed(1)}L`,  color: "var(--color-accent-lime)" },
          { label: "Total Returns",  value: `+${totalReturn.toFixed(1)}%`,               color: "var(--color-accent-lime)" },
          { label: "Total Funds",    value: portfolio.portfolio.length,                  color: "var(--color-primary-light)" },
        ].map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Investor Profile */}
      <div className="rs-card">
        <div className="rs-card-header">
          <div className="component-label" style={{ marginBottom: 0 }}>Investor Profile</div>
        </div>
        <div className="rs-card-body">
          <div className="investor-profile-grid">
            {[
              { label: "Age",         value: `${portfolio.age} years` },
              { label: "Risk Profile", value: formatLabel(portfolio.risk_profile) },
              { label: "Goals",        value: portfolio.goals.map(formatLabel).join(", ") },
              { label: "Horizon",      value: `${portfolio.investment_horizon_years} years` },
            ].map((item, i) => (
              <div key={i}>
                <div className="investor-profile-item-label">{item.label}</div>
                <div className="investor-profile-item-value">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="rs-card">
        <div className="rs-card-header">
          <div className="component-label" style={{ marginBottom: 0 }}>Holdings</div>
        </div>
        <table className="portfolio-table">
          <thead>
            <tr>
              {["Fund", "Category", "Allocation", "Invested", "Current", "Return"].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {portfolio.portfolio.map((fund, i) => {
              const ret      = ((fund.current_value - fund.invested_amount) / fund.invested_amount) * 100;
              const catColor = CATEGORY_COLORS[fund.category] || "var(--color-text-muted)";
              return (
                <tr key={i}>
                  <td className="fund-name-cell">{fund.fund_name}</td>

                  <td>
                    <span
                      className="category-badge"
                      style={{ color: catColor, border: `1px solid ${catColor}44` }}
                    >
                      {fund.category}
                    </span>
                  </td>

                  <td>
                    <div className="alloc-bar-wrap">
                      <div className="alloc-bar-track">
                        <div
                          className="alloc-bar-fill"
                          style={{
                            width: `${fund.allocation_percent * (80 / 25)}px`,
                            maxWidth: "100%",
                            backgroundColor: catColor,
                          }}
                        />
                      </div>
                      <span className="alloc-pct">{fund.allocation_percent}%</span>
                    </div>
                  </td>

                  <td className="invested-cell">₹{(fund.invested_amount / 1000).toFixed(0)}K</td>
                  <td className="current-val-cell">₹{(fund.current_value / 1000).toFixed(0)}K</td>
                  <td
                    className="return-cell"
                    style={{ color: ret >= 0 ? "var(--color-accent-lime)" : "#f59e0b" }}
                  >
                    {ret > 0 ? "+" : ""}{ret.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
