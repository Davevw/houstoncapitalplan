import React, { useState, useMemo } from "react";
import { PROJECT, computeLot } from "./LotDetailPanel";
import SiteCompositionTable from "./SiteCompositionTable";

const NAVY = "#1B2A4A";
const GOLD = "#C9A84C";
const CREAM = "#F5F0E8";
const STEEL = "#E0E4E8";
const POS = "#2E8B57";

// v13 lot schedule (kept in sync with SitePlanTab.jsx LOT_SCHEDULE & LOTS in main file)
const LOT_SCHEDULE = [
  {id:1, phase:1, type:"Industrial",  acres:3.88, asking:7.25, saleMonth:13},
  {id:2, phase:1, type:"Retail",      acres:1.4,  asking:15,   saleMonth:13},
  {id:3, phase:1, type:"Retail",      acres:1.2,  asking:15,   saleMonth:1},
  {id:4, phase:1, type:"Retail",      acres:1.2,  asking:15,   saleMonth:14},
  {id:5, phase:1, type:"Industrial",  acres:6.4,  asking:6.5,  saleMonth:8},
  {id:6, phase:1, type:"Industrial",  acres:4.9,  asking:6.5,  saleMonth:11},
  {id:7, phase:1, type:"Industrial",  acres:3.3,  asking:15,   saleMonth:8},
  {id:8, phase:1, type:"Retail",      acres:1.3,  asking:7,    saleMonth:6},
  {id:9, phase:2, type:"Industrial",  acres:3.1,  asking:6.5,  saleMonth:30},
  {id:10,phase:2, type:"Industrial",  acres:2.4,  asking:6.5,  saleMonth:30},
  {id:11,phase:2, type:"Industrial",  acres:1.8,  asking:6.5,  saleMonth:30},
  {id:12,phase:2, type:"Industrial",  acres:1.8,  asking:6.5,  saleMonth:30},
  {id:13,phase:2, type:"Multifamily", acres:11.8, asking:6.5,  saleMonth:28},
  {id:14,phase:2, type:"Multifamily", acres:13.2, asking:7.5,  saleMonth:28},
  {id:15,phase:2, type:"Multifamily", acres:11.2, asking:7.5,  saleMonth:28},
  {id:16,phase:1, type:"Multifamily", acres:12.3, asking:7.5,  saleMonth:17},
  {id:17,phase:1, type:"Retail",      acres:1.2,  asking:15,   saleMonth:8},
  {id:18,phase:2, type:"Retail",      acres:1.2,  asking:15,   saleMonth:22},
  {id:19,phase:1, type:"Retail",      acres:2.0,  asking:15,   saleMonth:12},
  {id:20,phase:1, type:"Retail",      acres:1.4,  asking:15,   saleMonth:10},
  {id:21,phase:1, type:"Retail",      acres:1.1,  asking:15,   saleMonth:15},
  {id:22,phase:1, type:"Retail",      acres:1.2,  asking:15,   saleMonth:11},
  {id:23,phase:1, type:"Retail",      acres:2.0,  asking:15,   saleMonth:16},
  {id:24,phase:1, type:"Retail",      acres:1.2,  asking:15,   saleMonth:15},
  {id:25,phase:1, type:"Retail",      acres:1.4,  asking:15,   saleMonth:16},
  {id:26,phase:1, type:"Retail",      acres:1.2,  asking:15,   saleMonth:18},
  {id:27,phase:1, type:"Retail",      acres:1.0,  asking:15,   saleMonth:19},
  {id:28,phase:2, type:"Retail",      acres:1.0,  asking:15,   saleMonth:20},
  {id:29,phase:1, type:"Retail",      acres:1.0,  asking:15,   saleMonth:14},
  {id:30,phase:1, type:"Retail",      acres:1.5,  asking:15,   saleMonth:5},
];

const fmtMoney = (n) => {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return "$" + Math.round(n).toLocaleString();
};
const fmtCompactM = (n) => `$${(n / 1_000_000).toFixed(2)}M`;

function KpiCard({ label, value, sub }) {
  return (
    <div style={{
      background: "#F7F7F7", border: "1px solid #EEE", borderRadius: 8,
      padding: "16px 18px",
    }}>
      <div style={{ fontSize: 10.5, color: "#7A8B9A", fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{
        fontSize: 22, fontFamily: "Georgia,serif", fontWeight: 700, color: NAVY, marginTop: 6,
        fontVariantNumeric: "tabular-nums",
      }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 10.5, color: "#7A8B9A", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function NoteCard({ title, children }) {
  return (
    <div style={{
      background: CREAM, borderLeft: `3px solid ${GOLD}`,
      padding: "12px 14px", borderRadius: 4, marginBottom: 12,
    }}>
      <div style={{ fontWeight: 800, color: NAVY, fontSize: 12, letterSpacing: 0.5, marginBottom: 6, textTransform: "uppercase" }}>
        {title}
      </div>
      <div style={{ fontSize: 12.5, color: "#3A4A5A", lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}

const COLUMNS = [
  { key: "id", label: "Lot #", numeric: true, w: 60 },
  { key: "type", label: "Use Type", numeric: false, w: 110 },
  { key: "acres", label: "Acres", numeric: true, w: 70, fmt: (v) => v.toFixed(2) },
  { key: "eligibleAcres", label: "Eligible Acres", numeric: true, w: 100, fmt: (v) => v.toFixed(2) },
  { key: "mudSharePct", label: "MUD Share %", numeric: true, w: 100, fmt: (v) => v.toFixed(2) + "%" },
  { key: "mudTotal", label: "Total MUD Allocation", numeric: true, w: 150, fmt: fmtMoney },
  { key: "mudFirst", label: "First Payout (50%) — Mo 24", numeric: true, w: 160, fmt: fmtMoney },
  { key: "mudFinal", label: "Final Payout (50%) — Mo 36", numeric: true, w: 160, fmt: fmtMoney },
  { key: "saleMonth", label: "Sale Month", numeric: true, w: 100 },
  { key: "status", label: "MUD Status", numeric: false, w: 150 },
];

export default function MUDAnalysisTab() {
  const [sortKey, setSortKey] = useState("id");
  const [sortDir, setSortDir] = useState("asc");
  // MUD bond rate slider: 8.0% (baseline $23.4M) to 10.0% (scales toward $35M ceiling)
  const [bondRate, setBondRate] = useState(PROJECT.mudBondRate * 100);

  const mudReimbursement = useMemo(() => {
    const minRate = 8.0, maxRate = 10.0;
    const minVal = 23_400_000, maxVal = 35_000_000;
    const t = (bondRate - minRate) / (maxRate - minRate);
    return Math.round(minVal + t * (maxVal - minVal));
  }, [bondRate]);

  const rows = useMemo(() => {
    return LOT_SCHEDULE.map((lot) => {
      const c = computeLot(lot, LOT_SCHEDULE, { mudReimbursement });
      // For MUD allocation, eligible acres = lot.acres (all 30 lots are allocated based on acreage)
      const eligibleAcres = lot.acres;
      const mudSharePct = (lot.acres / PROJECT.mudEligibleAcres) * 100;
      const status =
        c.mudStatus === "post-final" ? "Full payout available" :
        c.mudStatus === "post-first" ? "Eligible — final Mo 36" :
        "Eligible — first Mo 24";
      return {
        id: lot.id,
        type: lot.type,
        acres: lot.acres,
        eligibleAcres,
        mudSharePct,
        mudTotal: c.mudShareTotal,
        mudFirst: c.mudInitialPayout,
        mudFinal: c.mudFinalPayout,
        saleMonth: lot.saleMonth,
        status,
        mudStatusKey: c.mudStatus,
      };
    });
  }, [mudReimbursement]);

  const sortedRows = useMemo(() => {
    const sorted = [...rows].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      const as = String(av);
      const bs = String(bv);
      return sortDir === "asc" ? as.localeCompare(bs) : bs.localeCompare(as);
    });
    return sorted;
  }, [rows, sortKey, sortDir]);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => ({
        acres: acc.acres + r.acres,
        eligibleAcres: acc.eligibleAcres + r.eligibleAcres,
        mudTotal: acc.mudTotal + r.mudTotal,
        mudFirst: acc.mudFirst + r.mudFirst,
        mudFinal: acc.mudFinal + r.mudFinal,
      }),
      { acres: 0, eligibleAcres: 0, mudTotal: 0, mudFirst: 0, mudFinal: 0 }
    );
  }, [rows]);

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const isBaseline = Math.abs(bondRate - 8.0) < 0.01;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", color: NAVY }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontFamily: "Georgia,serif", fontWeight: 700, margin: 0, color: NAVY }}>
          MUD 584 — Bond Reimbursement Analysis
        </h1>
        <div style={{ fontSize: 13, color: "#5A6B7A", marginTop: 6 }}>
          International Trade Park Houston — Bissonnet 136, LLC
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
        gap: 14, marginBottom: 16,
      }}>
        <KpiCard
          label="Total MUD Principal"
          value={fmtCompactM(mudReimbursement)}
          sub={isBaseline ? "baseline @ 8.0% · up to $35M" : `@ ${bondRate.toFixed(1)}% bond rate`}
        />
        <KpiCard label="MUD Bond Rate" value={`${bondRate.toFixed(1)}%`} sub="adjustable 8.0% – 10.0%" />
        <KpiCard label="First Payout" value={`Month ${PROJECT.mudFirstPayoutMonth}`} sub="50% of MUD share" />
        <KpiCard label="Final Payout" value={`Month ${PROJECT.mudFinalPayoutMonth}`} sub="remaining 50%" />
        <KpiCard label="Total Payout Window" value={`${PROJECT.mudFinalPayoutMonth - PROJECT.mudFirstPayoutMonth} months`} sub={`Month ${PROJECT.mudFirstPayoutMonth}–${PROJECT.mudFinalPayoutMonth}`} />
      </div>

      {/* Bond Rate Slider */}
      <div style={{
        background: CREAM, border: `1px solid ${STEEL}`, borderLeft: `3px solid ${GOLD}`,
        borderRadius: 6, padding: "14px 18px", marginBottom: 28,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10, gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.8, color: NAVY, textTransform: "uppercase" }}>
            MUD Bond Rate Sensitivity
          </div>
          <div style={{ fontSize: 12, color: "#5A6B7A" }}>
            Rate: <b style={{ color: NAVY, fontFamily: "Georgia,serif" }}>{bondRate.toFixed(1)}%</b>
            <span style={{ margin: "0 8px", color: STEEL }}>·</span>
            Principal: <b style={{ color: POS, fontFamily: "Georgia,serif" }}>{fmtCompactM(mudReimbursement)}</b>
          </div>
        </div>
        <input
          type="range"
          min={8.0}
          max={10.0}
          step={0.1}
          value={bondRate}
          onChange={(e) => setBondRate(parseFloat(e.target.value))}
          style={{ width: "100%", accentColor: NAVY, cursor: "pointer" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "#7A8B9A", marginTop: 4, fontWeight: 600 }}>
          <span>8.0% · $23.40M</span>
          <span>9.0% · $29.20M</span>
          <span>10.0% · $35.00M</span>
        </div>
      </div>

      {/* Allocation Table */}
      <div style={{ overflowX: "auto", border: "1px solid #CCC", borderRadius: 8 }}>
        <table style={{
          width: "100%", borderCollapse: "collapse", fontSize: 12,
          fontFamily: "Arial, sans-serif", minWidth: 1100,
        }}>
          <thead>
            <tr style={{ background: NAVY }}>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  style={{
                    color: GOLD, padding: "12px 10px", textAlign: col.numeric ? "right" : "left",
                    fontWeight: 700, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase",
                    cursor: "pointer", borderRight: "1px solid rgba(255,255,255,0.1)",
                    minWidth: col.w, whiteSpace: "nowrap",
                    background: sortKey === col.key ? "#243760" : NAVY,
                  }}
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span style={{ marginLeft: 4, opacity: 0.8 }}>{sortDir === "asc" ? "▲" : "▼"}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((r, i) => {
              const eligible = r.mudStatusKey !== "pre-first";
              const statusColor =
                r.mudStatusKey === "post-final" ? POS :
                r.mudStatusKey === "post-first" ? "#3D8EC9" : "#A87A2A";
              return (
                <tr
                  key={r.id}
                  style={{
                    background: i % 2 === 0 ? "white" : "#FAFAFA",
                    borderLeft: eligible ? `3px solid ${POS}` : "3px solid transparent",
                  }}
                >
                  {COLUMNS.map((col) => {
                    const raw = r[col.key];
                    const display = col.fmt ? col.fmt(raw) : raw;
                    const isStatus = col.key === "status";
                    return (
                      <td
                        key={col.key}
                        style={{
                          padding: "9px 10px",
                          textAlign: col.numeric ? "right" : "left",
                          borderBottom: "1px solid #EEE",
                          borderRight: "1px solid #F2F2F2",
                          fontFamily: col.numeric ? "Georgia,serif" : "Arial,sans-serif",
                          fontVariantNumeric: "tabular-nums",
                          color: isStatus ? statusColor : NAVY,
                          fontWeight: isStatus ? 700 : 500,
                        }}
                      >
                        {display}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {/* Totals row */}
            <tr style={{ background: CREAM, fontWeight: 800, borderTop: `2px solid ${NAVY}` }}>
              <td style={{ padding: "12px 10px", color: NAVY }}>TOTAL</td>
              <td style={{ padding: "12px 10px", color: NAVY }}>30 Lots</td>
              <td style={{ padding: "12px 10px", textAlign: "right", fontFamily: "Georgia,serif" }}>{totals.acres.toFixed(2)}</td>
              <td style={{ padding: "12px 10px", textAlign: "right", fontFamily: "Georgia,serif" }}>{totals.eligibleAcres.toFixed(2)}</td>
              <td style={{ padding: "12px 10px", textAlign: "right", fontFamily: "Georgia,serif" }}>100.00%</td>
              <td style={{ padding: "12px 10px", textAlign: "right", fontFamily: "Georgia,serif" }}>{fmtMoney(totals.mudTotal)}</td>
              <td style={{ padding: "12px 10px", textAlign: "right", fontFamily: "Georgia,serif" }}>{fmtMoney(totals.mudFirst)}</td>
              <td style={{ padding: "12px 10px", textAlign: "right", fontFamily: "Georgia,serif" }}>{fmtMoney(totals.mudFinal)}</td>
              <td colSpan={2}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Site Composition */}
      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 18, fontFamily: "Georgia,serif", fontWeight: 700, color: NAVY, margin: "0 0 14px 0" }}>
          Site Composition — Acreage vs. Market Value
        </h2>
        <SiteCompositionTable lots={LOT_SCHEDULE} />
      </div>

      {/* Explanation Notes */}
      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 18, fontFamily: "Georgia,serif", fontWeight: 700, color: NAVY, margin: "0 0 16px 0" }}>
          How MUD Reimbursement Works
        </h2>
        <NoteCard title="Note 1 — What is a MUD?">
          A Municipal Utility District (MUD) is a political subdivision of the State of Texas that provides water,
          sewage, drainage, and other infrastructure services. MUD 584 was created to finance the horizontal
          infrastructure for International Trade Park Houston. The district issues bonds to reimburse the developer
          for eligible infrastructure costs after construction is complete.
        </NoteCard>
        <NoteCard title="Note 2 — How Reimbursement Works">
          MUD bonds reimburse infrastructure costs based on each lot's share of eligible acreage within the district.
          The total MUD principal of $23.40M is allocated across {PROJECT.mudEligibleAcres} eligible acres. Each lot's
          MUD share is calculated as: (Lot Eligible Acres / {PROJECT.mudEligibleAcres}) × $23.40M. The first payout of
          50% occurs at Month {PROJECT.mudFirstPayoutMonth}. The final payout of the remaining 50% occurs at Month {PROJECT.mudFinalPayoutMonth}.
          The total payout window is {PROJECT.mudFinalPayoutMonth - PROJECT.mudFirstPayoutMonth} months.
        </NoteCard>
        <NoteCard title="Note 3 — MUD Bond Rate">
          MUD bonds carry an 8.0% interest rate. This rate is set by the bond market at the time of issuance and
          reflects the credit quality of the district, the tax base, and prevailing interest rates.
        </NoteCard>
        <NoteCard title="Note 4 — Reimbursement Potential: Up to $35M">
          The current MUD reimbursement estimate of $23.40M is conservative. The cost of land being used for the
          retention basin is not yet included in the reimbursement calculation. Applying the standard MUD underwriting
          benchmark of 8–10% of real estate valuations to anticipated building values on the site supports
          reimbursement as high as $35 million. This gap continues to narrow as additional eligible items are
          negotiated.
        </NoteCard>
        <NoteCard title="Note 5 — MUD Status: Cleared">
          The PCS contested case against MUD 584 was dismissed on November 6, 2025. Harris County withdrew its protest,
          and the State Office of Administrative Hearings (SOAH) dismissed the matter (Docket No. 582-25-23304). MUD
          584 is now clear to proceed to final TCEQ approval with no remaining opposition.
        </NoteCard>
        <NoteCard title="Note 6 — Lincoln Ave Capital MUD Contribution">
          Lincoln Avenue Capital is already contributing its fair share to offset its portion of MUD costs, reducing
          the net infrastructure burden on the project.
        </NoteCard>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 32, padding: "14px 0", borderTop: `1px solid ${STEEL}`,
        textAlign: "center", fontSize: 11, color: "#7A8B9A", letterSpacing: 0.6,
      }}>
        PLUSAdvantage™ 2026 — CONFIDENTIAL | MUD 584 Bond Reimbursement Analysis
      </div>
    </div>
  );
}
