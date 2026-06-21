// ─── MOCK DATA ─────────────────────────────────────────────────────────────────
// Remove this file (and MOCK_MODE in App.jsx) before production use.
// ───────────────────────────────────────────────────────────────────────────────

export const MOCK_PIPELINE_STEPS = [
  { id: "load_profile",         label: "Loading Portfolio",    delay: 500  },
  { id: "planner",              label: "Planner Agent",        delay: 900  },
  { id: "tool_execution",       label: "Running Tools",        delay: 1400 },
  { id: "specialists_parallel", label: "Specialist Advisors",  delay: 2000 },
  { id: "devils_advocate",      label: "Devil's Advocate",     delay: 1200 },
  { id: "consensus",            label: "Consensus Agent",      delay: 1000 },
  { id: "pipeline_complete",    label: "Complete",             delay: 400  },
];

export const MOCK_STEP_MESSAGES = {
  load_profile:         "Fetching portfolio profile from data store...",
  planner:              "Decomposing query into sub-tasks for specialists...",
  tool_execution:       "Fetching NAV data, SIP history, benchmark returns...",
  specialists_parallel: "Running Conservative, Growth, Cost Efficiency advisors in parallel...",
  devils_advocate:      "Challenging consensus with counter-arguments...",
  consensus:            "Synthesising all 4 opinions into a final recommendation...",
  pipeline_complete:    "Analysis complete.",
};

export const MOCK_RESULT = {
  confidence_score: 0.82,

  final_recommendation:
    "Continue your SIP investments without redemption at this stage. Your small cap allocation of ~18% is within a reasonable band for a moderate-risk investor with a 10+ year horizon. Current volatility is cyclical and historically, premature exits from small cap SIPs during drawdowns have cost investors significant long-term alpha. Instead, consider maintaining your SIP cadence and reviewing your allocation annually.",

  action_items: [
    "Do NOT redeem your small cap SIP — stay the course through the current volatility cycle.",
    "Consider stepping up your SIP amount by 10% annually to benefit from rupee cost averaging at lower NAVs.",
    "Review your large cap overlap: your two large cap funds share ~67% of their top 10 holdings — consider consolidating.",
    "Rebalance debt allocation from 5% to 15% if your child's education goal is within 5 years.",
    "Set a 12-month review trigger: if small cap drawdown exceeds 35% from peak, reassess allocation.",
  ],

  agreements: [
    "All 4 advisors agree: redemption during peak volatility is inadvisable for a long-horizon SIP investor.",
    "Consensus that the portfolio is adequately diversified by fund type but shows excessive large-cap overlap.",
    "Universal agreement that the investor's moderate risk profile is broadly consistent with current allocation.",
  ],

  disagreements: [
    "Growth vs Conservative: Disagreement on whether to increase SIP amount now — Growth says yes, Conservative says wait for stability.",
    "Cost Efficiency vs others: Argues for immediate fund consolidation from 8 to 5 funds to reduce drag from tiny positions.",
    "Devil's Advocate disputes the 'stay the course' narrative, citing deteriorating small-cap earnings visibility in Q1.",
  ],

  risk_warnings: [
    "Small cap funds carry elevated liquidity risk during market stress — redemption windows may narrow.",
    "Sectoral technology allocation (12%) is above recommended limit for moderate-risk profiles.",
    "Two large cap funds with high overlap effectively function as a single position — concentration risk exists.",
  ],

  evidence: [
    "Portfolio NAV data (8 funds)",
    "Nifty Small Cap 100 YTD: -14.2%",
    "Historical SIP XIRR (5Y): +16.8%",
    "Large cap overlap analysis",
    "Benchmark comparison (Nifty 50)",
    "Investor age & risk profile",
    "Goal: Child education (7 yrs)",
  ],

  committee_opinions: {
    conservative: {
      stance:     "HOLD",
      confidence: 0.78,
      reasoning:
        "From a capital preservation standpoint, redeeming during a drawdown crystallises losses unnecessarily. The investor's 10-year horizon more than compensates for current volatility. However, I do advocate for trimming the small cap weight from 18% to 12% over the next 12 months through STP rather than lump-sum exit.",
      key_points: [
        "Drawdown of 14% is within the normal volatility band for small cap funds.",
        "SIP averaging mechanism works best during periods of sustained underperformance.",
        "Gradual STP to a balanced advantage fund is preferable to outright redemption.",
        "Emergency liquidity needs should be met from debt/liquid funds, not equity SIPs.",
      ],
      evidence_used: [
        "Nifty Small Cap 100 drawdown history",
        "Investor's 10-year horizon",
        "Existing debt allocation (5%)",
      ],
    },

    growth: {
      stance:     "BUY",
      confidence: 0.87,
      reasoning:
        "Current small cap valuations are presenting a rare entry point. Historically, SIP investors who stayed invested through comparable drawdowns (2018, 2020) saw the strongest 3-year returns. I recommend not only holding but increasing the SIP amount by 15-20% to maximise rupee cost averaging at current levels.",
      key_points: [
        "P/E compression in small caps now aligns with 10-year mean reversion range.",
        "Nifty Small Cap 100 has recovered from every >20% drawdown within 18 months historically.",
        "Stepping up SIP by 15% during this phase would materially enhance 5-year XIRR.",
        "Flexi cap allocation provides natural large-mid pivot if small cap continues to lag.",
      ],
      evidence_used: [
        "Historical SIP XIRR data (5Y: 16.8%)",
        "P/E ratio analysis — small cap index",
        "2018 & 2020 drawdown recovery data",
      ],
    },

    cost_efficiency: {
      stance:     "RESTRUCTURE",
      confidence: 0.74,
      reasoning:
        "The portfolio holds 8 funds — this creates administrative complexity and meaningful overlap without diversification benefit. The two large cap funds share 67% of their top 10 holdings. Consolidating to 5-6 funds would reduce tracking friction and allow more precise allocation control. Small cap SIP should continue, but in a single best-in-class fund rather than two overlapping ones.",
      key_points: [
        "Fund count of 8 is above the optimal 5-6 range for a portfolio this size.",
        "Two large cap funds combined represent a hidden single-fund concentration risk.",
        "Consolidation would reduce TER drag and simplify annual rebalancing.",
        "Redirecting freed capital to the stronger-performing flexi cap fund improves efficiency.",
      ],
      evidence_used: [
        "Overlap analysis: Large cap funds",
        "TER comparison across holdings",
        "Portfolio allocation distribution",
      ],
    },

    devils_advocate: {
      stance:     "CAUTION",
      confidence: 0.69,
      reasoning:
        "The committee's optimistic consensus ignores deteriorating fundamentals in the small cap space. Q1 earnings misses across 60%+ of the Nifty Small Cap 250 constituents signal more pain ahead. The 'stay the course' advice, while historically valid, assumes the investor has the psychological capacity to endure further drawdowns — which many retail investors demonstrably do not. A partial STP (30% of corpus) to a balanced advantage fund should be considered as a stress hedge.",
      key_points: [
        "Q1 FY25 saw earnings misses in 63% of Nifty Small Cap 250 companies.",
        "Global macro headwinds (Fed policy, USD strength) disproportionately affect small caps.",
        "Investor psychology risk: behavioural exits at market bottoms destroy more value than the exit itself.",
        "A 30% STP to balanced advantage acts as a hedge without fully capitulating on the position.",
      ],
      evidence_used: [
        "Q1 FY25 earnings data — small cap universe",
        "Fed rate trajectory analysis",
        "Behavioural finance: retail exit patterns",
      ],
    },
  },
};

export const MOCK_PORTFOLIO = {
  age: 34,
  risk_profile: "Moderate",
  goals: ["Wealth Creation", "Child Education"],
  investment_horizon_years: 10,
  portfolio: [
    { fund_name: "Axis Small Cap Fund",          category: "Small Cap",              allocation_percent: 18, invested_amount: 180000, current_value: 154800  },
    { fund_name: "Mirae Asset Large Cap Fund",   category: "Large Cap",              allocation_percent: 16, invested_amount: 160000, current_value: 183200  },
    { fund_name: "HDFC Flexi Cap Fund",          category: "Flexi Cap",              allocation_percent: 15, invested_amount: 150000, current_value: 181500  },
    { fund_name: "SBI Bluechip Fund",            category: "Large Cap",              allocation_percent: 14, invested_amount: 140000, current_value: 158200  },
    { fund_name: "Kotak Emerging Equity Fund",   category: "Mid Cap",                allocation_percent: 13, invested_amount: 130000, current_value: 143000  },
    { fund_name: "ICICI Pru Technology Fund",    category: "Sectoral - Technology",  allocation_percent: 12, invested_amount: 120000, current_value: 139200  },
    { fund_name: "HDFC Balanced Advantage Fund", category: "Balanced Advantage",     allocation_percent: 7,  invested_amount: 70000,  current_value: 78400   },
    { fund_name: "SBI Gilt Fund",                category: "Debt - Gilt",            allocation_percent: 5,  invested_amount: 50000,  current_value: 51500   },
  ],
};
