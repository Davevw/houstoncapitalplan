import React, { useState } from "react";

const NAVY = "#1B2A4A";
const GOLD = "#C9A84C";
const CREAM = "#F5F0E8";
const STEEL = "#E0E4E8";
const POS = "#2E8B57";
const NEG = "#CC0000";

// Project-level constants for per-lot allocations
const PROJECT = {
  totalSellableAcres: 99.58,
  infrastructureHardSoft: 31_500_000,
  mudReimbursementBase: 23_400_000,
  partnerBuyout: 10_000_000,
};

const TYPE_COLORS = {
  Multifamily: "#D4A84B",
  Retail: "#5C6E3D",
  Flex: "#A8B57A",
  Industrial: "#E8E4D8",
};

const fmt = (n) => {
  if (n === null || n === undefined || isNaN(n)) return "—";
  const abs = Math.abs(Math.round(n));
  const s = "$" + abs.toLocaleString();
  return n < 0 ? `(${s})` : s;
};

function computeLot(lot) {
  const sf = Math.round(lot.acres * 43560);
  const gross = sf * lot.asking;
  const brokerage = gross * 0.04;
  const netSale = gross - brokerage;
  const acreShare = lot.acres / PROJECT.totalSellableAcres;
  const horizontalAlloc = Math.round(PROJECT.infrastructureHardSoft * acreShare);
  const mudReimbursement = Math.round(PROJECT.mudReimbursementBase * acreShare);
  const landCostAlloc = Math.round(PROJECT.partnerBuyout * acreShare);
  const netToDevStay = netSale - horizontalAlloc + mudReimbursement;
  const netToDevBuy = netSale - landCostAlloc - horizontalAlloc + mudReimbursement;
  return {
    sf, gross, brokerage, netSale,
    horizontalAlloc, mudReimbursement, landCostAlloc,
    netToDevStay, netToDevBuy,
    shareOfSitePct: (acreShare * 100).toFixed(1),
  };
}

function Row({ label, value, sub, indent = 0, bold = false, color, divider }) {
  return (
    <>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        padding: "6px 0", paddingLeft: indent,
        fontSize: 12.5, color: color || NAVY,
        fontWeight: bold ? 700 : 500,
      }}>
        <div>
          {label}
          {sub && <div style={{ fontSize: 10.5, color: "#7A8B9A", fontWeight: 400, marginTop: 1 }}>{sub}</div>}
        </div>
        <div style={{ fontFamily: "Georgia,serif", fontVariantNumeric: "tabular-nums", fontWeight: bold ? 700 : 500 }}>
          {value}
        </div>
      </div>
      {divider && <div style={{ borderTop: `1px solid ${STEEL}`, margin: "2px 0" }} />}
    </>
  );
}

function SectionHeader({ children, right }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      marginTop: 18, marginBottom: 6,
    }}>
      <div style={{
        fontSize: 10.5, fontWeight: 800, letterSpacing: 1.2, color: NAVY, textTransform: "uppercase",
      }}>{children}</div>
      {right}
    </div>
  );
}

export default function LotDetailPanel({ lot, onClose }) {
  const [scenario, setScenario] = useState("stay"); // 'stay' | 'buyout'

  // If this is a detention/non-lot parcel, show a simpler card
  const isLot = typeof lot.id === "number" && lot.asking !== undefined && lot.acres;

  if (!isLot) {
    return (
      <div style={panelStyle}>
        <Header lot={lot} onClose={onClose} />
        <div style={{ padding: 16, color: "#5A6B7A", fontSize: 13, lineHeight: 1.5 }}>
          {lot.note || "Detention / drainage area"}
        </div>
      </div>
    );
  }

  const c = computeLot(lot);
  const netToDev = scenario === "buyout" ? c.netToDevBuy : c.netToDevStay;
  const margin = c.gross > 0 ? (netToDev / c.gross) * 100 : 0;
  const netColor = netToDev >= 0 ? POS : NEG;

  return (
    <div style={panelStyle}>
      <Header lot={lot} shareOfSitePct={c.shareOfSitePct} onClose={onClose} />

      <div style={{ padding: "14px 16px 18px" }}>
        {/* P&L */}
        <SectionHeader right={
          <div style={{ display: "inline-flex", border: `1px solid ${STEEL}`, borderRadius: 999, padding: 2, background: "white" }}>
            {[
              { k: "stay", label: "Stay In" },
              { k: "buyout", label: "Buyout" },
            ].map(opt => (
              <button key={opt.k} onClick={() => setScenario(opt.k)}
                style={{
                  border: "none", cursor: "pointer", padding: "4px 10px",
                  fontSize: 10.5, fontWeight: 700, borderRadius: 999,
                  background: scenario === opt.k ? NAVY : "transparent",
                  color: scenario === opt.k ? "white" : NAVY,
                  letterSpacing: 0.3,
                }}>
                {opt.label}
              </button>
            ))}
          </div>
        }>Per-Lot P&amp;L</SectionHeader>

        <div style={{ borderTop: `1.5px solid ${NAVY}`, borderBottom: `1px solid ${STEEL}`, padding: "4px 0" }}>
          <Row label="Gross Value"
            sub={`${c.sf.toLocaleString()} SF × $${lot.asking}/SF`}
            value={fmt(c.gross)} bold />
          <Row label="Less: Brokerage (4%)" value={fmt(-c.brokerage)} color={NEG} />
          <Row label="Net Sale Proceeds" value={fmt(c.netSale)} bold divider />
          {scenario === "buyout" && (
            <Row label="Less: Land Cost Allocation"
              sub="Partner buyout share"
              value={fmt(-c.landCostAlloc)} color={NEG} />
          )}
          <Row label="Less: Horizontal Infrastructure"
            sub="Hard + soft cost share"
            value={fmt(-c.horizontalAlloc)} color={NEG} />
          <Row label="Plus: MUD Reimbursement"
            sub="Pro-rata acre share"
            value={fmt(c.mudReimbursement)} color={POS} divider />
        </div>

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "baseline",
          padding: "10px 0 4px",
        }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: NAVY }}>Net to Developer</div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: netColor, fontFamily: "Georgia,serif", fontVariantNumeric: "tabular-nums" }}>
              {fmt(netToDev)}
            </div>
            <div style={{ fontSize: 10.5, color: "#7A8B9A", fontWeight: 600 }}>
              {margin.toFixed(1)}% margin
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#7A8B9A", paddingTop: 4, borderTop: `1px dashed ${STEEL}`, marginTop: 4 }}>
          <span>Sale Month</span>
          <span style={{ fontWeight: 700, color: NAVY }}>Month {lot.saleMonth}</span>
        </div>

        {/* Capital Stack */}
        <SectionHeader>Capital Stack</SectionHeader>
        <div style={{ borderTop: `1.5px solid ${NAVY}`, padding: "12px 0", fontSize: 12, color: "#94A3B0", fontStyle: "italic" }}>
          (to be provided)
        </div>

        {/* Lot Release */}
        <SectionHeader>Lot Release</SectionHeader>
        <div style={{ borderTop: `1.5px solid ${NAVY}`, padding: "12px 0", fontSize: 12, color: "#94A3B0", fontStyle: "italic" }}>
          (to be provided)
        </div>
      </div>
    </div>
  );
}

function Header({ lot, shareOfSitePct, onClose }) {
  const pillBg = TYPE_COLORS[lot.use] || TYPE_COLORS[lot.type] || GOLD;
  const isIndustrial = (lot.use || lot.type) === "Industrial";
  return (
    <div style={{ background: NAVY, color: "white", padding: "14px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "Georgia,serif" }}>
            Lot {lot.id} — {lot.use || lot.type || "Parcel"}
          </div>
          <div style={{ fontSize: 11.5, color: CREAM, opacity: 0.9, marginTop: 4 }}>
            {lot.acres ? `${lot.acres} ac` : ""}{shareOfSitePct ? ` · ${shareOfSitePct}% of site` : ""}
          </div>
        </div>
        <button onClick={onClose} aria-label="Close"
          style={{
            background: "rgba(255,255,255,0.12)", border: "none", color: "white",
            cursor: "pointer", width: 26, height: 26, borderRadius: 6, fontSize: 14, lineHeight: 1,
          }}>✕</button>
      </div>
      <div style={{
        display: "inline-block", marginTop: 10, padding: "3px 10px", borderRadius: 999,
        background: pillBg, color: isIndustrial ? NAVY : "white",
        fontSize: 10.5, fontWeight: 800, letterSpacing: 0.6, textTransform: "uppercase",
      }}>
        {lot.use || lot.type}
      </div>
    </div>
  );
}

const panelStyle = {
  background: "white",
  border: `1px solid ${STEEL}`,
  borderRadius: 12,
  overflow: "hidden",
  boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
};
