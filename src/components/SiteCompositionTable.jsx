import React, { useState, useMemo } from "react";

const NAVY = "#1B2A4A";
const GOLD = "#C9A84C";
const CREAM = "#F5F0E8";

const USE_TYPES = [
  { key: "Multifamily", label: "Multifamily", acres: 36.62, color: "#D4A84B", revenue: true, lotMatch: ["Multifamily"] },
  { key: "Retail", label: "Retail", acres: 23.48, color: "#5C6E3D", revenue: true, lotMatch: ["Retail"] },
  { key: "Flex", label: "Flex", acres: 21.55, color: "#A8B57A", revenue: true, lotMatch: ["Flex"] },
  { key: "Industrial", label: "Commercial / Light Industrial", acres: 6.0, color: "#E8E4D8", revenue: true, lotMatch: ["Industrial"] },
  { key: "Detention", label: "Detention Ponds / Channels", acres: 24.27, color: "#B8B8B0", revenue: false },
  { key: "ROW", label: "Major Right-of-Ways", acres: 9.21, color: "#D8A88A", revenue: false },
];

const fmtMoney = (n) => {
  if (n === null || n === undefined || isNaN(n)) return "—";
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${Math.round(n / 1_000).toLocaleString()}K`;
  return `$${Math.round(n).toLocaleString()}`;
};

/**
 * Site Composition Table — acreage + product value + market value %
 * @param {Array} lots - lot schedule with {type, acres, asking}
 */
export default function SiteCompositionTable({ lots = [], compact = false }) {
  const [sortKey, setSortKey] = useState("acres");
  const [sortDir, setSortDir] = useState("desc");

  const totalAcres = useMemo(
    () => USE_TYPES.reduce((s, u) => s + u.acres, 0),
    []
  );

  const rows = useMemo(() => {
    // Compute product value per use type from lot schedule
    const valueByType = {};
    lots.forEach((lot) => {
      const sf = lot.acres * 43560;
      const gross = lot.grossValue ?? sf * lot.asking;
      valueByType[lot.type] = (valueByType[lot.type] || 0) + gross;
    });

    const totalValue = Object.values(valueByType).reduce((s, v) => s + v, 0);

    return USE_TYPES.map((u) => {
      const productValue = u.revenue
        ? (u.lotMatch || []).reduce((s, t) => s + (valueByType[t] || 0), 0)
        : null;
      return {
        key: u.key,
        label: u.label,
        color: u.color,
        acres: u.acres,
        acresPct: (u.acres / totalAcres) * 100,
        productValue,
        marketPct: productValue !== null && totalValue > 0 ? (productValue / totalValue) * 100 : null,
        revenue: u.revenue,
      };
    });
  }, [lots, totalAcres]);

  const totalValue = rows.reduce((s, r) => s + (r.productValue || 0), 0);

  const sortedRows = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      // null values sort to the end
      if (av === null && bv === null) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  function toggleSort(key) {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  const COLS = [
    { key: "label", label: "Use Type", numeric: false },
    { key: "acres", label: "Acres", numeric: true },
    { key: "acresPct", label: "% of Acres", numeric: true },
    { key: "productValue", label: "Est. Product Value", numeric: true },
    { key: "marketPct", label: "% of Market Value", numeric: true },
  ];

  const Th = ({ col }) => (
    <th
      onClick={() => toggleSort(col.key)}
      style={{
        color: GOLD, padding: "10px 10px",
        textAlign: col.numeric ? "right" : "left",
        fontWeight: 700, fontSize: 10.5, letterSpacing: 0.5, textTransform: "uppercase",
        cursor: "pointer", whiteSpace: "nowrap",
        background: sortKey === col.key ? "#243760" : NAVY,
        borderRight: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {col.label}
      {sortKey === col.key && <span style={{ marginLeft: 4, opacity: 0.85 }}>{sortDir === "asc" ? "▲" : "▼"}</span>}
    </th>
  );

  return (
    <div style={{ fontFamily: "Arial, sans-serif", color: NAVY }}>
      {/* Side-by-side comparison bars: Acreage % vs Market Value % */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 800, color: "#7A8B9A", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 }}>
            Acreage Mix
          </div>
          <div style={{ display: "flex", height: 10, borderRadius: 4, overflow: "hidden", border: "1px solid #E8E4DD" }}>
            {rows.map((r) => (
              <div key={r.key} style={{ width: `${r.acresPct}%`, background: r.color }} title={`${r.label}: ${r.acresPct.toFixed(1)}%`} />
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 800, color: "#7A8B9A", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 }}>
            Market Value Mix
          </div>
          <div style={{ display: "flex", height: 10, borderRadius: 4, overflow: "hidden", border: "1px solid #E8E4DD" }}>
            {rows.filter(r => r.marketPct !== null).map((r) => (
              <div key={r.key} style={{ width: `${r.marketPct}%`, background: r.color }} title={`${r.label}: ${r.marketPct.toFixed(1)}%`} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ overflowX: "auto", border: "1px solid #CCC", borderRadius: 8 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: compact ? 11.5 : 12, minWidth: 560 }}>
          <thead>
            <tr style={{ background: NAVY }}>
              {COLS.map((c) => <Th key={c.key} col={c} />)}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((r, i) => (
              <tr key={r.key} style={{ background: i % 2 === 0 ? "white" : "#FAFAFA" }}>
                <td style={{ padding: "8px 10px", borderBottom: "1px solid #EEE" }}>
                  <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: r.color, marginRight: 8, verticalAlign: "middle", border: "1px solid rgba(0,0,0,0.1)" }} />
                  {r.label}
                </td>
                <td style={{ padding: "8px 10px", textAlign: "right", borderBottom: "1px solid #EEE", fontFamily: "Georgia,serif", fontVariantNumeric: "tabular-nums" }}>
                  {r.acres.toFixed(2)}
                </td>
                <td style={{ padding: "8px 10px", textAlign: "right", borderBottom: "1px solid #EEE", fontFamily: "Georgia,serif", fontVariantNumeric: "tabular-nums" }}>
                  {r.acresPct.toFixed(1)}%
                </td>
                <td style={{ padding: "8px 10px", textAlign: "right", borderBottom: "1px solid #EEE", fontFamily: "Georgia,serif", fontVariantNumeric: "tabular-nums", color: r.productValue === null ? "#94A3B0" : NAVY }}>
                  {r.productValue === null ? "—" : fmtMoney(r.productValue)}
                </td>
                <td style={{ padding: "8px 10px", textAlign: "right", borderBottom: "1px solid #EEE", fontFamily: "Georgia,serif", fontVariantNumeric: "tabular-nums", color: r.marketPct === null ? "#94A3B0" : NAVY }}>
                  {r.marketPct === null ? "—" : `${r.marketPct.toFixed(1)}%`}
                </td>
              </tr>
            ))}
            <tr style={{ background: CREAM, fontWeight: 800, borderTop: `2px solid ${NAVY}` }}>
              <td style={{ padding: "10px 10px" }}>TOTAL</td>
              <td style={{ padding: "10px 10px", textAlign: "right", fontFamily: "Georgia,serif" }}>{totalAcres.toFixed(2)}</td>
              <td style={{ padding: "10px 10px", textAlign: "right", fontFamily: "Georgia,serif" }}>100.0%</td>
              <td style={{ padding: "10px 10px", textAlign: "right", fontFamily: "Georgia,serif" }}>{fmtMoney(totalValue)}</td>
              <td style={{ padding: "10px 10px", textAlign: "right", fontFamily: "Georgia,serif" }}>100.0%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
