import { useState } from "react";
import { Download, ChevronDown, ChevronUp, FileSpreadsheet, Zap, Copy, Check } from "lucide-react";

const NAVY = "#1B2A4A";
const GOLD = "#C9A84C";
const CREAM = "#F5F0E8";

const MODEL_TABS = [
  { name: "Cover", desc: "KPI tiles, navigation, color legend" },
  { name: "Assumptions", desc: "All hardcoded inputs — change to model scenarios" },
  { name: "Dev Budget", desc: "Sources & Uses · Full cost by line item" },
  { name: "Capital Stack", desc: "LIHTC structure · Bond test · Construction financing" },
  { name: "Pro Forma", desc: "Unit mix · Revenue · NOI · Stabilized value" },
  { name: "JV Waterfall", desc: "Land equity · 8% pref · 50/50 profit split" },
  { name: "Cap Events", desc: "Refi Year 3 · Sale Year 10 · JV partner returns" },
  { name: "Balance Sheet", desc: "Day 1 · Year 15 LIHTC exit · Net equity" },
  { name: "Sensitivity", desc: "NOI × Cap rate · DSCR stress matrix" },
];

const COPILOT_PROMPTS = [
  {
    tab: "📋 Assumptions",
    prompts: [
      "On the Assumptions tab, what are the key inputs that drive the permanent DSCR? Show me which cells I should change to stress test the debt coverage.",
      "Walk me through the financing assumptions. What happens to the interest reserve if the bond rate increases to 6%?",
      "List every blue input cell on the Assumptions tab and group them by category.",
    ],
  },
  {
    tab: "💰 Dev Budget",
    prompts: [
      "On the Dev Budget tab, what are the top 3 line items by dollar amount? Show me as a bar chart.",
      "What percentage of total project cost is hard construction costs? Include new construction, air-rights, horizontal, and retail pavilion.",
      "Create a pie chart of the Sources of Funds showing Senior Loan, LIHTC Equity, JV Land, and City Contribution.",
    ],
  },
  {
    tab: "🏗️ Capital Stack",
    prompts: [
      "On the Capital Stack tab, does the project pass both the 80% LTC and 65% LTV tests? Explain which constraint governs and why.",
      "Show me the LIHTC equity calculation step by step — eligible basis through final equity amount.",
      "What is the monthly interest-only payment during construction? What does that annualize to over 36 months?",
      "If the credit price drops from $0.92 to $0.88, how does that change the LIHTC equity? Update the Assumptions tab and show me the new number.",
    ],
  },
  {
    tab: "📊 Pro Forma",
    prompts: [
      "On the Pro Forma tab, build a waterfall chart showing Gross Rent → Vacancy → Retail Income → EGI → OpEx → NOI.",
      "What unit type generates the most annual revenue? Show me a comparison.",
      "If vacancy increases from 5% to 8%, what happens to NOI and the stabilized value? Model it.",
      "What cap rate would be needed for stabilized value to equal total development cost of $69.7M?",
    ],
  },
  {
    tab: "🤝 JV Waterfall",
    prompts: [
      "On the JV Waterfall tab, walk me through the 4-step distribution priority in plain English.",
      "How much does the JV Partner need to receive before any profit split occurs? Include return of capital and accrued preferred.",
      "If the land contribution were only $2M instead of $2.576M, how does that change the preferred return dollar amount?",
    ],
  },
  {
    tab: "📅 Cap Events",
    prompts: [
      "On the Cap Events tab, compare the Year 3 refinance vs. Year 10 sale for the JV Partner. Which produces a better return and why?",
      "Create a timeline chart showing JV Partner cumulative returns from Day 1 through Year 10.",
      "What is the implied IRR for the JV Partner in the Year 10 sale scenario given a $2.576M land contribution and $16.06M total return?",
      "If NOI growth is 2% instead of 2.5%, what does the Year 10 sale price become?",
    ],
  },
  {
    tab: "📈 Balance Sheet",
    prompts: [
      "On the Balance Sheet tab, show me the JV Partner equity position at Day 1 vs. Year 15 as a column chart.",
      "What is the equity multiple from Day 1 to Year 15 for the JV Partner?",
      "If the permanent loan were paid down by $5M by Year 15, how does that change net equity?",
    ],
  },
  {
    tab: "🔬 Sensitivity",
    prompts: [
      "On the Sensitivity tab, highlight all cells where the stabilized value exceeds $65M. What NOI and cap rate combinations produce those results?",
      "In the DSCR sensitivity table, which interest rate scenarios put the project below 1.15x coverage?",
      "Create a heat map visualization of the DSCR table — green for strong, yellow for borderline, red for below floor.",
      "What is the maximum permanent rate this project can absorb and still maintain 1.10x DSCR?",
    ],
  },
  {
    tab: "🔗 Cross-Sheet Analysis",
    prompts: [
      "Looking across all tabs, summarize the complete capital story for The Plaza in 5 bullet points — suitable for an investor overview.",
      "What are the three biggest risks to project returns based on the sensitivity tables? Rank them.",
      "Build an executive summary table pulling the top KPIs from each tab: TDC, LTC, LTV, DSCR, NOI, stabilized value, JV partner total return, and equity multiple.",
      "Compare the Assumptions tab inputs to the Pro Forma outputs. Are there any assumptions that seem aggressive relative to market norms?",
    ],
  },
  {
    tab: "🎯 Scenario Modeling",
    prompts: [
      "Model a downside scenario: construction costs increase 10%, rents are 5% lower, and the cap rate is 4.75%. Show me the new DSCR and JV Partner return.",
      "Model an upside scenario: rents increase 8%, exit cap rate is 4.25%, and NOI grows 3% annually. What does the Year 10 sale return look like?",
      "Create a data table showing JV Partner Year 10 return across 5 NOI scenarios and 3 exit cap rates.",
    ],
  },
  {
    tab: "📊 Charts & Visualization",
    prompts: [
      "Create a stacked bar chart showing Sources of Funds: Senior Loan, LIHTC Equity, JV Land, City Contribution.",
      "Build a line chart showing project value growth from stabilization through Year 15 at 2.5% NOI growth.",
      "Create a waterfall chart of the JV Partner Year 10 distribution: Return of Capital → Preferred Return → 50% Residual → Total.",
      "Make a dashboard summary on a new sheet with the top 8 KPIs displayed as cards.",
    ],
  },
];

const COPILOT_TIPS = [
  { tip: "Name the tab first", detail: '"On the Assumptions tab..." gets better results than generic prompts' },
  { tip: "Reference blue cells", detail: '"Change the blue input in C30 to 6%" — Copilot understands color coding' },
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
    link.href = "/assets/ThePlaza_CapitalModel_v1.xlsx";
    link.download = "ThePlaza_CapitalModel_v1.xlsx";
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
            The Plaza at Watsonville · ThePlaza_CapitalModel_v1
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
        📊 ThePlaza_CapitalModel_v1.xlsx &nbsp;·&nbsp; 9 Tabs &nbsp;·&nbsp; 106 Formulas &nbsp;·&nbsp; Zero Errors &nbsp;·&nbsp; April 12, 2026
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
