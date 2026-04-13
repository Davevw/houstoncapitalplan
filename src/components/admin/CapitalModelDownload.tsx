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
    tab: "Assumptions",
    prompts: [
      "What are the key inputs that drive the permanent DSCR?",
      "What happens to the interest reserve if the bond rate increases to 6%?",
    ],
  },
  {
    tab: "Dev Budget",
    prompts: [
      "What are the top 3 line items by dollar amount? Show as a bar chart.",
      "Create a pie chart of the Sources of Funds.",
    ],
  },
  {
    tab: "Capital Stack",
    prompts: [
      "Does the project pass both the 80% LTC and 65% LTV tests? Which governs?",
      "Show me the LIHTC equity calculation step by step.",
    ],
  },
  {
    tab: "Pro Forma",
    prompts: [
      "Build a waterfall chart: Gross Rent → Vacancy → EGI → OpEx → NOI.",
      "If vacancy increases to 8%, what happens to NOI and stabilized value?",
    ],
  },
  {
    tab: "JV Waterfall",
    prompts: [
      "Walk me through the 4-step distribution priority in plain English.",
      "How much does the JV Partner receive before any profit split?",
    ],
  },
  {
    tab: "Cap Events",
    prompts: [
      "Compare Year 3 refi vs Year 10 sale for the JV Partner. Which is better?",
      "What is the implied IRR for the JV Partner in the Year 10 sale scenario?",
    ],
  },
  {
    tab: "Sensitivity",
    prompts: [
      "Which interest rate scenarios put the project below 1.15x DSCR?",
      "Create a heat map of the DSCR table — green, yellow, red.",
    ],
  },
  {
    tab: "Cross-Sheet",
    prompts: [
      "Summarize the complete capital story for The Plaza in 5 bullet points.",
      "Build an executive summary table with the top KPIs from each tab.",
      "Model a downside: costs +10%, rents -5%, cap rate 4.75%. Show new DSCR.",
    ],
  },
];

export default function CapitalModelDownload() {
  const [showPrompts, setShowPrompts] = useState(false);
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
        <span style={{ opacity: 0.7 }}>Built by PLUSAdvantage™ · Western Realty Finance</span>
      </div>

      {/* How to use with Copilot */}
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #E0E4E8" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 12 }}>
          <Zap size={16} style={{ color: GOLD }} /> HOW TO USE WITH COPILOT IN EXCEL
        </div>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "#374151", lineHeight: 2 }}>
          <li>Download the file using the button above</li>
          <li>Open in Microsoft 365 Excel (desktop or web)</li>
          <li>Click <strong>Home → Copilot</strong> in the ribbon</li>
          <li>Use the prompt guide below to analyze the model</li>
        </ol>
        <div style={{ marginTop: 12, background: "#FFFBEB", border: "1px solid #FDE68A", color: "#92400E", fontSize: 12, borderRadius: 6, padding: "8px 12px", display: "inline-block" }}>
          ⚠️ Requires Microsoft 365 Business or Enterprise subscription
        </div>
      </div>

      {/* Model Tabs */}
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #E0E4E8" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 12 }}>MODEL TABS</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {MODEL_TABS.map((t) => (
            <div key={t.name} title={t.desc} style={{ background: CREAM, color: NAVY, fontSize: 12, borderRadius: 6, padding: "6px 12px", fontWeight: 500, cursor: "default" }}>
              {t.name}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10 }}>
          {MODEL_TABS.map((t) => (
            <div key={t.name} style={{ fontSize: 12, color: "#6B7280", padding: "3px 0" }}>
              <strong style={{ color: NAVY }}>{t.name}:</strong> {t.desc}
            </div>
          ))}
        </div>
      </div>

      {/* Copilot Prompt Library */}
      <div style={{ padding: "16px 24px" }}>
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
              <div key={group.tab} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ background: CREAM, borderRadius: 4, padding: "2px 8px", fontSize: 11 }}>{group.tab}</span>
                </div>
                {group.prompts.map((prompt, idx) => {
                  const key = `${group.tab}-${idx}`;
                  return (
                    <div
                      key={key}
                      style={{ display: "flex", alignItems: "center", gap: 8, borderLeft: `2px solid ${GOLD}`, paddingLeft: 12, marginLeft: 8, marginBottom: 6, fontSize: 13, color: "#4B5563" }}
                    >
                      <span style={{ flex: 1 }}>{prompt}</span>
                      <button
                        onClick={() => copyPrompt(prompt, key)}
                        title="Copy prompt"
                        style={{ background: "none", border: "none", cursor: "pointer", color: copiedIdx === key ? "#10B981" : "#9CA3AF", padding: 4, flexShrink: 0, transition: "color 0.2s" }}
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
    </div>
  );
}
