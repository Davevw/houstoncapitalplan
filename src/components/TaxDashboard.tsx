import React from "react";

const NAVY = "#0B3D5C";
const TEAL = "#0B4C72";
const STEEL = "#95B7C4";
const TERRA = "#C4703E";
const GOLD = "#D4A84B";
const LIGHT = "#F0F6F8";

const TAX_HISTORY = [
  { year: 2019, aliefISD: 36723.66, harrisCounty: 37927.49, imd: 0, total: 74651.15, status: "✅ PAID", notes: "2 parcels — initial year" },
  { year: 2020, aliefISD: 37168.60, harrisCounty: 39065.80, imd: 3085.05, total: 79319.45, status: "✅ PAID", notes: "2 parcels" },
  { year: 2021, aliefISD: 37174.13, harrisCounty: 38144.90, imd: 3085.51, total: 78404.54, status: "✅ PAID", notes: "2 parcels" },
  { year: 2022, aliefISD: 35149.44, harrisCounty: 35258.10, imd: 3026.84, total: 73434.38, status: "✅ PAID", notes: "Paid Jan 2023" },
  { year: 2023, aliefISD: 28932.47, harrisCounty: 33618.51, imd: 2932.25, total: 65483.23, status: "✅ PAID", notes: "Paid Jan 2024" },
  { year: 2024, aliefISD: 30715.17, harrisCounty: 35888.96, imd: 2931.56, total: 69535.69, status: "✅ PAID", notes: "Paid Jan 2025" },
  { year: 2025, aliefISD: 29529.92, harrisCounty: 36557.59, imd: 2931.88, total: 69019.39, status: "✅ PAID", notes: "Paid Dec 2025 / Jan 2026" },
];

const CHART_DATA = [
  { year: 2019, amount: 52000 },
  { year: 2020, amount: 60000 },
  { year: 2021, amount: 63000 },
  { year: 2022, amount: 65000 },
  { year: 2023, amount: 67000 },
  { year: 2024, amount: 70000 },
  { year: 2025, amount: 79000 },
];

const fmt = (n: number) =>
  "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });

export default function TaxDashboard() {
  const grandTotal = TAX_HISTORY.reduce((a, r) => a + r.total, 0);
  const maxChart = Math.max(...CHART_DATA.map(d => d.amount));

  return (
    <div style={{ minHeight: "100vh", background: "#F7F9FB", fontFamily: "Calibri,-apple-system,sans-serif", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg,${NAVY} 0%,${TEAL} 100%)`, padding: "28px 32px 20px", color: "white" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 3, opacity: 0.7, marginBottom: 4 }}>
            ITPH HOUSTON — PROPERTY TAX MANAGEMENT DASHBOARD
          </div>
          <h1 style={{ margin: 0, fontSize: 26, fontFamily: "Georgia,serif", fontWeight: 700, letterSpacing: 0.5 }}>
            🏛️ Property Tax Management Dashboard
          </h1>
          <div style={{ fontSize: 14, opacity: 0.8, marginTop: 4 }}>
            International Trade Park Houston &nbsp;|&nbsp; 12000 Bissonnet St, Houston TX 77099
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 32px" }}>
        {/* Section 1 — Parcel Summary */}
        <SectionTitle icon="📍">Parcel Summary</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <ParcelCard
            label="Parcel 1"
            address="12000 Bissonnet St, Houston TX 77099"
            apn="APN: 0600950000002 (Harris County)"
            county="Alief ISD + Harris County"
            acreage="~50 acres"
            use="Industrial / Development Land"
            color={TEAL}
          />
          <ParcelCard
            label="Parcel 2"
            address="Bissonnet Street Tract — Adjacent Parcel"
            apn="APN: 0600950000001 (Harris County)"
            county="Alief ISD + Harris County + IMD"
            acreage="~86 acres"
            use="Mixed-Use / Development Land"
            color={NAVY}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 32 }}>
          <MetricCard label="7-Year Tax Paid" value={fmt(grandTotal)} sub="2019 – 2025 combined" accent={TERRA} />
          <MetricCard label="Average Annual" value={fmt(grandTotal / TAX_HISTORY.length)} sub="Both parcels combined" accent={GOLD} />
          <MetricCard label="2025 Tax (Last)" value={fmt(TAX_HISTORY[TAX_HISTORY.length - 1].total)} sub="✅ Paid Dec 2025 / Jan 2026" accent="#2E8B57" />
        </div>

        {/* Section 2 — 2026 Action Items */}
        <SectionTitle icon="⚠️">2026 Action Items</SectionTitle>
        <div style={{
          background: "#FFF8E7",
          border: `2px solid ${GOLD}`,
          borderRadius: 12,
          padding: "20px 24px",
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#8B6914", marginBottom: 14 }}>
            ⚠️ ACTION REQUIRED — 2026 Key Deadlines
          </div>
          <div style={{ fontSize: 13, color: "#5A4800", lineHeight: 2 }}>
            <div>• <strong>HCAD Appraisal Protest Deadline:</strong> May 15, 2026 (32 days)</div>
            <div style={{ paddingLeft: 16, fontSize: 12, color: "#8B6914" }}>Status: Protest Analysis Package — Pending Review</div>
            <div style={{ marginTop: 6 }}>• <strong>2025 Property Taxes:</strong> ✅ Paid January 31, 2026</div>
            <div style={{ marginTop: 6 }}>• <strong>2026 Tax Levy:</strong> Set October/November 2026</div>
          </div>
        </div>

        {/* Section 3 — Recommended Actions */}
        <SectionTitle icon="✅">Recommended Actions</SectionTitle>
        <div style={{
          background: "white",
          borderRadius: 12,
          padding: "20px 24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          marginBottom: 32,
        }}>
          {[
            { icon: "🔴", text: "File HCAD appraisal protest before May 15, 2026" },
            { icon: "🟢", text: "Confirm 2025 taxes paid (completed Jan 31, 2026)" },
            { icon: "🟡", text: "Verify IMD assessment is current for both parcels" },
            { icon: "🟡", text: "Budget $75,000–$80,000 reserve for 2026 tax payments" },
            { icon: "🟡", text: "Confirm both APNs with HCAD for accuracy" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < 4 ? "1px solid #EEF1F4" : "none", fontSize: 13, color: NAVY }}>
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        {/* Section 4 — Tax History */}
        <SectionTitle icon="📊">Tax History — Both Parcels Combined</SectionTitle>
        <div style={{ background: "white", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "auto", marginBottom: 32 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: NAVY }}>
                {["Year", "Alief ISD", "Harris County", "IMD", "Total", "Status", "Notes"].map((h) => (
                  <th key={h} style={{ padding: "10px 14px", color: "white", fontWeight: 600, textAlign: h === "Year" || h === "Status" || h === "Notes" ? "left" : "right", fontSize: 12 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TAX_HISTORY.map((row, i) => (
                <tr key={row.year} style={{ background: i % 2 ? "#FAFBFC" : "white", borderBottom: "1px solid #EEF1F4" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 700, color: NAVY }}>{row.year}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", fontFamily: "Georgia,serif" }}>{fmt(row.aliefISD)}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", fontFamily: "Georgia,serif" }}>{fmt(row.harrisCounty)}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", fontFamily: "Georgia,serif", color: row.imd === 0 ? "#B0BEC5" : undefined }}>{row.imd === 0 ? "—" : fmt(row.imd)}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: NAVY, fontFamily: "Georgia,serif" }}>{fmt(row.total)}</td>
                  <td style={{ padding: "10px 14px", fontSize: 12, color: "#2E8B57", fontWeight: 600 }}>{row.status}</td>
                  <td style={{ padding: "10px 14px", fontSize: 11, color: "#7A8B9A" }}>{row.notes}</td>
                </tr>
              ))}
              <tr style={{ background: LIGHT, borderTop: `2px solid ${STEEL}`, fontWeight: 700 }}>
                <td style={{ padding: "12px 14px", color: NAVY }}>TOTAL</td>
                <td style={{ padding: "12px 14px", textAlign: "right", fontFamily: "Georgia,serif", color: NAVY }}>{fmt(TAX_HISTORY.reduce((a, r) => a + r.aliefISD, 0))}</td>
                <td style={{ padding: "12px 14px", textAlign: "right", fontFamily: "Georgia,serif", color: NAVY }}>{fmt(TAX_HISTORY.reduce((a, r) => a + r.harrisCounty, 0))}</td>
                <td style={{ padding: "12px 14px", textAlign: "right", fontFamily: "Georgia,serif", color: NAVY }}>{fmt(TAX_HISTORY.reduce((a, r) => a + r.imd, 0))}</td>
                <td style={{ padding: "12px 14px", textAlign: "right", fontFamily: "Georgia,serif", color: TERRA, fontSize: 15 }}>{fmt(grandTotal)}</td>
                <td colSpan={2} />
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 5 — Tax Trend Chart */}
        <SectionTitle icon="📈">Tax Trend — Annual Total (2019–2025)</SectionTitle>
        <div style={{ background: "white", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", padding: "24px 28px", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 220, paddingBottom: 4 }}>
            {CHART_DATA.map((d) => {
              const barH = (d.amount / maxChart) * 180;
              return (
                <div key={d.year} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: GOLD }}>{fmt(d.amount)}</div>
                  <div style={{ width: "100%", maxWidth: 56, height: barH, background: `linear-gradient(180deg, ${GOLD} 0%, ${NAVY} 100%)`, borderRadius: "6px 6px 0 0", transition: "height 0.3s" }} />
                  <div style={{ fontSize: 11, fontWeight: 600, color: NAVY }}>{d.year}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 6 — 2026 Key Dates */}
        <SectionTitle icon="📅">2026 Key Dates</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 32 }}>
          <DateCard date="January 31, 2026" label="2025 Taxes Due" status="paid" detail="Both parcels paid Dec 2025 / Jan 2026" />
          <DateCard date="May 15, 2026" label="HCAD Protest Deadline" status="action" detail="Harris County Appraisal District — protest 2026 assessed values" />
          <DateCard date="Oct / Nov 2026" label="2026 Tax Levy Set" status="upcoming" detail="HCAD will set 2026 assessed values & tax rates" />
        </div>

        {/* Section 7 — Documents & Reports */}
        <SectionTitle icon="📄">Documents & Reports</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 32 }}>
          <DocCard icon="📄" title="2025 Annual Tax Summary" desc="Full payment history and assessment details" buttonLabel="Download" />
          <DocCard icon="📄" title="HCAD Protest Analysis Package" desc="Comparable sales research and protest documentation" buttonLabel="Download" badge="Due May 15, 2026" />
          <DocCard icon="📄" title="NOI & Reserve Impact Report" desc="Projected tax reserve requirements and NOI impact" buttonLabel="Download" />
        </div>

        {/* Disclaimer */}
        <div style={{ background: "#FFF8E7", border: `1px solid ${GOLD}`, borderRadius: 10, padding: "16px 20px", fontSize: 12, color: "#7A6000", marginBottom: 24 }}>
          <strong>⚠️ Disclaimer:</strong> This dashboard provides analysis and document preparation for review purposes only. No filings or submissions are made on your behalf. All decisions remain with the property owner.
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "16px", fontSize: 11, color: "#9AA5B0", borderTop: "1px solid #E0E4E8" }}>
          PLUSAdvantage™ 2026
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──

function SectionTitle({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, marginTop: 8, paddingBottom: 8, borderBottom: `2px solid ${STEEL}` }}>
      {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: NAVY, fontFamily: "Georgia,serif", letterSpacing: 0.5 }}>{children}</h2>
    </div>
  );
}

function MetricCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div style={{ background: "white", borderRadius: 12, padding: "18px 22px", borderLeft: `4px solid ${accent || TEAL}`, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#7A8B9A", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: NAVY, fontFamily: "Georgia,serif" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#9AA5B0", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function ParcelCard({ label, address, apn, county, acreage, use, color }: { label: string; address: string; apn?: string; county: string; acreage: string; use: string; color: string }) {
  return (
    <div style={{ background: "white", borderRadius: 12, padding: "20px 24px", borderTop: `4px solid ${color}`, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: color, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 4 }}>{address}</div>
      {apn && <div style={{ fontSize: 11, color: "#9AA5B0", marginBottom: 4, fontWeight: 600 }}>{apn}</div>}
      <div style={{ fontSize: 12, color: "#7A8B9A" }}>{county} &nbsp;·&nbsp; {acreage} &nbsp;·&nbsp; {use}</div>
    </div>
  );
}

function DateCard({ date, label, status, detail }: { date: string; label: string; status: "paid" | "action" | "upcoming"; detail: string }) {
  const styles: Record<string, { bg: string; border: string; icon: string; color: string }> = {
    paid: { bg: "#F0FFF4", border: "#2E8B57", icon: "✅", color: "#2E8B57" },
    action: { bg: "#FFF8E7", border: "#D4A84B", icon: "⚠️", color: "#B8860B" },
    upcoming: { bg: "#F0F6F8", border: TEAL, icon: "📅", color: TEAL },
  };
  const s = styles[status];
  return (
    <div style={{ background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 12, padding: "18px 20px" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.icon} {date}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 12, color: "#7A8B9A" }}>{detail}</div>
    </div>
  );
}

function DocCard({ icon, title, desc, buttonLabel, badge }: { icon: string; title: string; desc: string; buttonLabel: string; badge?: string }) {
  return (
    <div style={{ background: "white", borderRadius: 12, padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #E0E4E8", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 24 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{title}</div>
      <div style={{ fontSize: 12, color: "#7A8B9A", lineHeight: 1.5 }}>{desc}</div>
      {badge && (
        <div style={{ display: "inline-flex", alignItems: "center", fontSize: 11, fontWeight: 600, color: "#B8860B", background: "#FFF8E7", border: "1px solid #D4A84B", padding: "3px 8px", borderRadius: 6, width: "fit-content" }}>
          ⚠️ {badge}
        </div>
      )}
      <button
        onClick={() => {}}
        style={{ marginTop: "auto", padding: "8px 16px", borderRadius: 8, background: NAVY, color: "white", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", width: "fit-content" }}
      >
        {buttonLabel}
      </button>
    </div>
  );
}
