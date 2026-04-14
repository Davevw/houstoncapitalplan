import { useState } from "react";
import { Download, ChevronDown, ChevronUp, FileSpreadsheet, Zap, Copy, Check } from "lucide-react";

const NAVY = "#1B2A4A";
const GOLD = "#C9A84C";
const CREAM = "#F5F0E8";

const MODEL_TABS = [
  { name: "Cover", desc: "KPI tiles, navigation, color legend" },
  { name: "Assumptions", desc: "All hardcoded inputs — change to model scenarios" },
  { name: "Dev Budget", desc: "Full cost by line item" },
  { name: "Capital Stack", desc: "Sources & Uses, LTC/LTV tests, funding gap" },
  { name: "Pro Forma", desc: "Lot sales revenue, absorption, cash flow" },
  { name: "JV Waterfall", desc: "Partner equity, preferred return, profit split" },
  { name: "Cap Events", desc: "Buyout vs. development vs. partial sale scenarios" },
  { name: "Balance Sheet", desc: "Day 1 through full sellout" },
  { name: "Sensitivity", desc: "Lot price × loan rate stress matrix" },
  { name: "Project P&L", desc: "Full project profit & loss — gross margin, net profit, per-lot breakdown" },
  { name: "User Instructions", desc: "How to use the model, activate Copilot, quick-start prompts" },
];

const COPILOT_PROMPTS = [
  {
    tab: "📋 Assumptions",
    prompts: [
      "On the Assumptions tab, what are the key inputs that drive the capital stack? Show me which cells I should change to stress test the deal.",
      "Walk me through the financing assumptions. What happens to the interest reserve if the rate increases to 12%?",
      "List every blue input cell on the Assumptions tab and group them by category.",
      "What is the total lot count and the average lot price across all phases?",
    ],
  },
  {
    tab: "💰 Dev Budget",
    prompts: [
      "On the Dev Budget tab, what are the top 3 line items by dollar amount? Show me as a bar chart.",
      "What percentage of total project cost is infrastructure vs. soft costs vs. financing?",
      "What is the per-lot development cost? Break it down by horizontal, vertical, and soft costs.",
    ],
  },
  {
    tab: "🏗️ Capital Stack",
    prompts: [
      "On the Capital Stack tab, what is the current funding gap? How much equity vs. debt is in the stack?",
      "Does the project pass the 80% LTC and 65% LTV tests? Explain which constraint governs and why.",
      "If the landfill permit value is reduced from $3M to $1.5M, how does the capital stack change?",
      "Show me the sources of funds as a pie chart.",
      "What is the debt-to-equity ratio? How does it compare to typical industrial development deals?",
    ],
  },
  {
    tab: "📊 Pro Forma",
    prompts: [
      "On the Pro Forma tab, build a waterfall chart showing Gross Revenue → Sales Costs → Development Costs → Net Margin.",
      "What is the breakeven number of lot sales needed to cover all infrastructure costs?",
      "If absorption slows from 3 lots/month to 1.5 lots/month, how does the cash flow timeline change?",
      "What is the total gross revenue at full sellout?",
    ],
  },
  {
    tab: "🤝 JV Waterfall",
    prompts: [
      "On the JV Waterfall tab, walk me through the 4-step distribution priority in plain English.",
      "How much does the JV Partner need to receive before any profit split occurs? Include return of capital and accrued preferred.",
      "If the partner's equity contribution were only $2M instead of current amount, how does the preferred return change?",
    ],
  },
  {
    tab: "📅 Cap Events",
    prompts: [
      "On the Capital Events tab, compare the JV Partner Buyout scenario vs. Full Development. Which produces a better return for the developer and why?",
      "What is the total buyout cost including accrued preferred return?",
      "If lot prices increase 15%, what happens to the Full Development scenario return?",
      "Model a partial sale: sell 50% of lots at current pricing. What's the return to each party?",
    ],
  },
  {
    tab: "📈 Balance Sheet",
    prompts: [
      "On the Balance Sheet tab, show me the equity position at Day 1 vs. Month 27 vs. end as a column chart.",
      "What is the equity multiple from Day 1 to full sellout?",
      "How much of the net equity at full buildout belongs to the JV partner?",
    ],
  },
  {
    tab: "🔬 Sensitivity",
    prompts: [
      "On the Sensitivity tab, highlight all cells where the project shows a loss. What lot price and rate combinations produce those results?",
      "Create a heat map of the sensitivity table — green for strong, yellow for borderline, red for loss.",
      "What is the minimum lot price the project can absorb and still achieve a 1.5x equity multiple?",
      "What is the maximum interest rate the project can handle before net profit turns negative?",
    ],
  },
  {
    tab: "💵 Project P&L",
    prompts: [
      "On the P&L tab, what is the total gross profit and gross margin percentage for the full project?",
      "Show me the per-lot P&L: revenue, cost, gross margin, and net margin per lot.",
      "What percentage of total project cost is financing costs vs. hard costs vs. soft costs?",
      "If lot prices drop 10%, what happens to the net profit and per-lot margin? Update the P&L.",
      "Create a waterfall chart showing Gross Revenue → Cost of Sales → Gross Profit → Financing Costs → Net Profit.",
      "What is the breakeven lot price — the minimum price per lot needed to achieve a positive net margin?",
      "Compare the developer fee to the net profit. What percentage of total profit is the developer fee?",
    ],
  },
  {
    tab: "🔗 Cross-Sheet Analysis",
    prompts: [
      "Looking across all tabs, summarize the complete capital story for Houston ITP in 5 bullet points — suitable for an investor overview.",
      "What are the three biggest risks to project returns based on the sensitivity tables? Rank them.",
      "Build an executive summary table pulling the top KPIs from each tab: TDC, LTC, LTV, funding gap, lot count, average lot price, JV partner total return, and equity multiple.",
      "Compare the Assumptions tab inputs to the Pro Forma outputs. Are there any assumptions that seem aggressive relative to market norms?",
      "Compare the P&L net margin to the JV Waterfall returns. Is the profit distribution consistent with the project economics?",
    ],
  },
  {
    tab: "🎯 Scenario Modeling",
    prompts: [
      "Model a downside scenario: infrastructure costs increase 20%, lot prices drop 10%, and absorption slows by 50%. Show me the impact on JV partner return and project IRR.",
      "Model an upside scenario: lot prices increase 15%, absorption is 4 lots/month, and interest rate drops to 8%. What does the return look like?",
      "Create a data table showing JV Partner return across 5 lot price scenarios and 3 absorption rate scenarios.",
    ],
  },
  {
    tab: "📊 Charts & Visualization",
    prompts: [
      "Create a stacked bar chart showing Sources of Funds: Senior Loan, JV Equity, Permit Equity, Developer Equity.",
      "Build a line chart showing cumulative lot sales revenue over the development timeline.",
      "Create a waterfall chart of the JV Partner distribution: Return of Capital → Preferred Return → Profit Split → Total.",
      "Make a dashboard summary on a new sheet with the top 8 KPIs displayed as cards.",
    ],
  },
];

const COPILOT_TIPS = [
  { tip: "Name the tab first", detail: '"On the Assumptions tab..." gets better results than generic prompts' },
  { tip: "Reference blue cells", detail: '"Change the blue input in C30 to 12%" — Copilot understands color coding' },
  { tip: "Ask for explanations", detail: '"Explain why the LTV ceiling governs over LTC" — Copilot reads formulas' },
  { tip: "Request new sheets", detail: '"Create a new summary tab with..." — Copilot can build new content' },
  { tip: "Use plain English", detail: '"What\'s the monthly payment?" works as well as "=PMT(...)"' },
  { tip: "Scenario branching", detail: "Save a copy before big scenario changes — Copilot edits are live" },
];

export default function CapitalModelDownload() {
  const [showPrompts, setShowPrompts] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<string | null>(null);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/assets/ITP_Houston_Capital_Model.xlsx";
    link.download = "ITP_Houston_Capital_Model.xlsx";
    link.click();
    console.log("Capital model downloaded at:", new Date().toISOString());
  };

  const copyPrompt = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(key);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #E0E4E8", background: "white" }}>
      {/* Header */}
      <div style={{ background: NAVY, color: "white", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 18, fontWeight: 700 }}>
            <FileSpreadsheet size={22} /> CAPITAL MODEL
          </div>
          <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>
            International Trade Park Houston · ITP_Houston_Capital_Model
          </div>
          <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>
            9 tabs · 106 live formulas · Copilot-ready
          </div>
        </div>
        <button
          onClick={handleDownload}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, background: GOLD, color: "white", border: "none", padding: "12px 24px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#b8973e"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = GOLD; }}
        >
          <Download size={18} /> Download .xlsx
        </button>
      </div>

      {/* Metadata strip */}
      <div style={{ background: CREAM, padding: "10px 24px", fontSize: 12, color: "#6B7280", borderBottom: "1px solid #E0E4E8" }}>
        📊 ITP_Houston_Capital_Model.xlsx &nbsp;·&nbsp; 9 Tabs &nbsp;·&nbsp; 106 Live Formulas &nbsp;·&nbsp; Copilot-Ready &nbsp;·&nbsp; April 14, 2026
        <br />
        <span style={{ opacity: 0.7 }}>Built by PLUSAdvantage™</span>
      </div>

      {/* How to use with Copilot */}
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #E0E4E8" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 12 }}>
          <Zap size={16} style={{ color: GOLD }} /> HOW TO ACTIVATE COPILOT IN EXCEL
        </div>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "#374151", lineHeight: 2 }}>
          <li>Download the file using the button above</li>
          <li>Open in <strong>Microsoft 365 Excel</strong> (desktop or web)</li>
          <li>Click <strong>Home → Copilot</strong> in the ribbon</li>
          <li>The Copilot panel opens on the right side</li>
          <li>Use the prompt guide below to analyze the model</li>
        </ol>
        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", color: "#92400E", fontSize: 12, borderRadius: 6, padding: "8px 12px" }}>
            ⚠️ Requires Microsoft 365 Business, Business Premium, or Enterprise license
          </div>
          <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", color: "#1E40AF", fontSize: 12, borderRadius: 6, padding: "8px 12px" }}>
            💡 Pro tip: Always start your prompt with the sheet name so Copilot knows where to look
          </div>
        </div>
      </div>

      {/* Model Tabs */}
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #E0E4E8" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 12 }}>MODEL TABS</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
          {MODEL_TABS.map((t) => (
            <div key={t.name} title={t.desc} style={{ background: CREAM, color: NAVY, fontSize: 12, borderRadius: 6, padding: "6px 12px", fontWeight: 500, cursor: "default" }}>
              {t.name}
            </div>
          ))}
        </div>
        <div>
          {MODEL_TABS.map((t) => (
            <div key={t.name} style={{ fontSize: 12, color: "#6B7280", padding: "3px 0" }}>
              <strong style={{ color: NAVY }}>{t.name}:</strong> {t.desc}
            </div>
          ))}
        </div>
      </div>

      {/* Copilot Prompt Library */}
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #E0E4E8" }}>
        <button
          onClick={() => setShowPrompts(!showPrompts)}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, color: NAVY, padding: 0 }}
        >
          {showPrompts ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          COPILOT PROMPT LIBRARY — {showPrompts ? "Click to collapse" : "Click to expand"}
        </button>

        {showPrompts && (
          <div style={{ marginTop: 16 }}>
            {COPILOT_PROMPTS.map((group) => (
              <div key={group.tab} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 8, paddingBottom: 4, borderBottom: `1px solid ${CREAM}` }}>
                  {group.tab}
                </div>
                {group.prompts.map((prompt, idx) => {
                  const key = `${group.tab}-${idx}`;
                  return (
                    <div
                      key={key}
                      style={{ display: "flex", alignItems: "flex-start", gap: 8, borderLeft: `2px solid ${GOLD}`, paddingLeft: 12, marginLeft: 8, marginBottom: 8, fontSize: 13, color: "#4B5563", lineHeight: 1.5 }}
                    >
                      <span style={{ flex: 1 }}>{prompt}</span>
                      <button
                        onClick={() => copyPrompt(prompt, key)}
                        title={copiedIdx === key ? "Copied!" : "Copy prompt"}
                        style={{ background: "none", border: "none", cursor: "pointer", color: copiedIdx === key ? "#10B981" : "#9CA3AF", padding: 4, flexShrink: 0, transition: "color 0.2s", marginTop: 1 }}
                      >
                        {copiedIdx === key ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Copilot Tips */}
      <div style={{ padding: "16px 24px" }}>
        <button
          onClick={() => setShowTips(!showTips)}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, color: NAVY, padding: 0 }}
        >
          {showTips ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          COPILOT TIPS — {showTips ? "Click to collapse" : "Click to expand"}
        </button>

        {showTips && (
          <div style={{ marginTop: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${CREAM}` }}>
                  <th style={{ textAlign: "left", padding: "8px 12px", color: NAVY, fontWeight: 600 }}>Tip</th>
                  <th style={{ textAlign: "left", padding: "8px 12px", color: NAVY, fontWeight: 600 }}>Detail</th>
                </tr>
              </thead>
              <tbody>
                {COPILOT_TIPS.map((t) => (
                  <tr key={t.tip} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "8px 12px", fontWeight: 600, color: NAVY, whiteSpace: "nowrap" }}>{t.tip}</td>
                    <td style={{ padding: "8px 12px", color: "#6B7280" }}>{t.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ background: CREAM, padding: "10px 24px", fontSize: 11, color: "#9CA3AF", textAlign: "center", borderTop: "1px solid #E0E4E8" }}>
        PLUSAdvantage™ 2026 · CONFIDENTIAL
      </div>
    </div>
  );
}
