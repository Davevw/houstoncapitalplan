import React from "react";

const NAVY = "#1B2A4A";
const GOLD = "#C9A84C";
const CREAM = "#F5F0E8";
const STEEL = "#E0E4E8";
const POS = "#2E8B57";
const NEG = "#CC0000";

// ---------- Project constants (v5 spec) ----------
export const PROJECT = {
  totalLots: 30,
  totalSellableAcres: 99.58,

  // Capital stack (70/30 debt/equity on both layers)
  acquisitionCost: 15_000_000,
  horizontalCost: 24_991_700,
  debtPct: 0.70,
  equityPct: 0.30,

  // MUD (updated v6)
  mudReimbursement: 23_400_000,
  mudFirstPayoutMonth: 24,
  mudFinalPayoutMonth: 36,
  mudInitialPayoutPct: 0.50,
  mudFinalPayoutPct: 0.50,
  mudBondRate: 0.08,
  mudEligibleAcres: 44.08,

  // Per-lot mechanics (escrow now 3% of gross)
  sellingCostPct: 0.05,
  escrowPctOfGross: 0.03,

  // Revolver
  revolverCapacity: 5_000_000,
  revolverRate: 0.11,
};
PROJECT.acqDebt    = PROJECT.acquisitionCost * PROJECT.debtPct;
PROJECT.acqEquity  = PROJECT.acquisitionCost * PROJECT.equityPct;
PROJECT.horizDebt  = PROJECT.horizontalCost * PROJECT.debtPct;
PROJECT.horizEquity= PROJECT.horizontalCost * PROJECT.equityPct;
PROJECT.totalCap   = PROJECT.acquisitionCost + PROJECT.horizontalCost;
PROJECT.totalDebt  = PROJECT.acqDebt + PROJECT.horizDebt;
PROJECT.totalEquity= PROJECT.acqEquity + PROJECT.horizEquity;

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
const fmtCompact = (n) => {
  if (n === null || n === undefined || isNaN(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `$${Math.round(n / 1_000).toLocaleString()}K`;
  return `$${Math.round(n).toLocaleString()}`;
};

export function computeLot(lot, allLots, overrides = {}) {
  const sf = Math.round(lot.acres * 43560);
  const grossValue = lot.grossValue ?? Math.round(sf * lot.asking);
  const share = lot.acres / PROJECT.totalSellableAcres;

  const sellingCosts = Math.round(grossValue * PROJECT.sellingCostPct);
  const netSaleProceeds = grossValue - sellingCosts;
  const buyerEscrow = Math.round(grossValue * PROJECT.escrowPctOfGross);

  const acqDebtRelease = Math.round(PROJECT.acqDebt * share);
  const horizDebtRelease = Math.round(PROJECT.horizDebt * share);

  const residualPreMud =
    netSaleProceeds + buyerEscrow - acqDebtRelease - horizDebtRelease;

  // MUD: every lot is allocated based on acreage share of total eligible acres
  const eligibleAcres = PROJECT.mudEligibleAcres;
  const mudReimbursement = overrides.mudReimbursement ?? PROJECT.mudReimbursement;
  const mudShareTotal = Math.round(
    mudReimbursement * (lot.acres / eligibleAcres)
  );
  const mudInitialPayout = Math.round(mudShareTotal * PROJECT.mudInitialPayoutPct);
  const mudFinalPayout = mudShareTotal - mudInitialPayout;

  // Cumulative MUD received by lot's sale month (v6: tiered)
  let mudReceivedBySaleMonth = 0;
  let mudStatus = "pre-first";
  if (lot.saleMonth >= PROJECT.mudFinalPayoutMonth) {
    mudReceivedBySaleMonth = mudShareTotal;
    mudStatus = "post-final";
  } else if (lot.saleMonth >= PROJECT.mudFirstPayoutMonth) {
    mudReceivedBySaleMonth = mudInitialPayout;
    mudStatus = "post-first";
  }

  // Residual to equity uses cumulative MUD payouts received by sale month
  const residualPostMud = residualPreMud + mudReceivedBySaleMonth;
  const verticalContext = Math.round(PROJECT.horizontalCost * share);

  return {
    sf, grossValue, share, sellingCosts, netSaleProceeds, buyerEscrow,
    acqDebtRelease, horizDebtRelease, residualPreMud,
    eligibleAcres, mudShareTotal, mudInitialPayout, mudFinalPayout,
    mudReceivedBySaleMonth, mudStatus,
    residualPostMud, verticalContext,
    marginPctPostMud: grossValue > 0 ? (residualPostMud / grossValue) * 100 : 0,
  };
}

function Row({ label, value, sub, bold = false, color, divider, big = false }) {
  return (
    <>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        padding: big ? "8px 0" : "5px 0",
        fontSize: big ? 13 : 12, color: color || NAVY,
        fontWeight: bold ? 700 : 500,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {label}
          {sub && <div style={{ fontSize: 10.5, color: "#7A8B9A", fontWeight: 400, marginTop: 1 }}>{sub}</div>}
        </div>
        <div style={{ fontFamily: "Georgia,serif", fontVariantNumeric: "tabular-nums", fontWeight: bold ? 700 : 500, whiteSpace: "nowrap", marginLeft: 12 }}>
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
      marginTop: 18, marginBottom: 6, gap: 8,
    }}>
      <div style={{
        fontSize: 10.5, fontWeight: 800, letterSpacing: 1.2, color: NAVY, textTransform: "uppercase",
      }}>{children}</div>
      {right && <div style={{ fontSize: 10, color: "#7A8B9A", fontWeight: 600, letterSpacing: 0.4 }}>{right}</div>}
    </div>
  );
}

export default function LotDetailPanel({ lot, allLots, onClose }) {
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

  const c = computeLot(lot, allLots || []);
  const sharePct = (c.share * 100).toFixed(2);
  const preMudColor = c.residualPreMud >= 0 ? NAVY : NEG;
  const postMudColor = c.residualPostMud >= 0 ? POS : NEG;

  const escrowPctLabel = `${(PROJECT.escrowPctOfGross * 100).toFixed(0)}% of gross`;
  const mudStatusLabel =
    c.mudStatus === "post-final"
      ? "✓ Eligible — full payout available"
      : c.mudStatus === "post-first"
      ? `◐ Eligible — final payout Month ${PROJECT.mudFinalPayoutMonth}`
      : `⏳ Eligible — first payout Month ${PROJECT.mudFirstPayoutMonth}`;
  const mudStatusColor =
    c.mudStatus === "post-final" ? POS : c.mudStatus === "post-first" ? "#3D8EC9" : "#A87A2A";

  return (
    <div style={panelStyle}>
      <Header lot={lot} c={c} onClose={onClose} />

      <div style={{ padding: "12px 16px 18px" }}>
        {/* Section 1: Lot Waterfall (Pre-MUD) */}
        <SectionHeader right={`Lot Share: ${sharePct}%`}>Lot Waterfall — Pre-MUD</SectionHeader>
        <div style={{ borderTop: `1.5px solid ${NAVY}`, borderBottom: `1px solid ${STEEL}`, padding: "4px 0" }}>
          <Row label="Gross Sale Price" sub={`${c.sf.toLocaleString()} SF × $${lot.asking}/SF`} value={fmt(c.grossValue)} bold />
          <Row label="Less: Selling Costs (5%)" value={fmt(-c.sellingCosts)} color={NEG} />
          <Row label="Net Sale Proceeds" value={fmt(c.netSaleProceeds)} bold />
          <Row label={`Plus: Buyer Escrow (${escrowPctLabel})`} value={fmt(c.buyerEscrow)} color={POS} divider />
          <Row label="Less: Acquisition Debt Release" sub={`$10.5M × ${sharePct}%`} value={fmt(-c.acqDebtRelease)} color={NEG} />
          <Row label="Less: Horizontal Debt Release" sub={`$17.49M × ${sharePct}%`} value={fmt(-c.horizDebtRelease)} color={NEG} divider />
          <Row label="Residual (Pre-MUD)" value={fmt(c.residualPreMud)} color={preMudColor} bold big />
        </div>

        {c.residualPreMud < 0 && (
          <div style={{
            marginTop: 8, padding: "8px 10px", borderLeft: `3px solid ${NEG}`,
            background: "#FFF5F5", fontSize: 11, color: "#7A2A2A", lineHeight: 1.5,
          }}>
            ⚠ Early-close lot — gap funded by revolver until MUD begins flowing (Month {PROJECT.mudFirstPayoutMonth}).
          </div>
        )}

        {/* Section 2: MUD Timing & Post-MUD */}
        <SectionHeader right={`First Payout: Month ${PROJECT.mudFirstPayoutMonth}`}>MUD Reimbursement</SectionHeader>
        <div style={{ borderTop: `1.5px solid ${NAVY}`, borderBottom: `1px solid ${STEEL}`, padding: "4px 0" }}>
          <Row label="Total MUD Principal" value={fmtCompact(PROJECT.mudReimbursement)} />
          <Row label="Initial Payout" value={`${(PROJECT.mudInitialPayoutPct * 100).toFixed(0)}% of MUD Share — Month ${PROJECT.mudFirstPayoutMonth}`} />
          <Row label="Final Payout" value={`Remaining ${(PROJECT.mudFinalPayoutPct * 100).toFixed(0)}% — Month ${PROJECT.mudFinalPayoutMonth}`} />
          <Row label="MUD Bond Rate" value={`${(PROJECT.mudBondRate * 100).toFixed(1)}%`} divider />
          <Row label="This lot's sale month" value={`Month ${lot.saleMonth}`} />
          <Row
            label="MUD Status"
            value={mudStatusLabel}
            color={mudStatusColor}
            divider
          />
          <Row
            label="Total MUD Share"
            sub={`$23.4M × ${lot.acres} ac / ${PROJECT.mudEligibleAcres} eligible ac`}
            value={fmt(c.mudShareTotal)}
            color={POS}
          />
          <Row
            label={`Initial Payout (${(PROJECT.mudInitialPayoutPct * 100).toFixed(0)}%) — Month ${PROJECT.mudFirstPayoutMonth}`}
            value={fmt(c.mudInitialPayout)}
            color={POS}
          />
          <Row
            label={`Final Payout (${(PROJECT.mudFinalPayoutPct * 100).toFixed(0)}%) — Month ${PROJECT.mudFinalPayoutMonth}`}
            value={fmt(c.mudFinalPayout)}
            color={POS}
            divider
          />
          <Row label="Residual (Pre-MUD)" value={fmt(c.residualPreMud)} color={preMudColor} />
          <Row
            label={`Plus: MUD Received by Month ${lot.saleMonth}`}
            sub={
              c.mudStatus === "post-final" ? "Full payout (initial + final)" :
              c.mudStatus === "post-first" ? "Initial payout only — final follows Month 36" :
              "None — sale precedes first payout"
            }
            value={fmt(c.mudReceivedBySaleMonth)}
            color={c.mudReceivedBySaleMonth > 0 ? POS : "#94A3B0"}
            divider
          />
          <Row
            label="Residual to Equity + Partners"
            sub={`${c.marginPctPostMud.toFixed(1)}% of gross · cumulative MUD by sale month`}
            value={fmt(c.residualPostMud)}
            color={postMudColor}
            bold big
          />
        </div>

        {/* Section 3: Capital Stack */}
        <SectionHeader right={`Lot Share: ${sharePct}%`}>Capital Stack</SectionHeader>
        <div style={{ borderTop: `1.5px solid ${NAVY}`, padding: "6px 0" }}>
          <StackRow label="ACQUISITION" total={PROJECT.acquisitionCost} bold />
          <StackRow label="Senior Debt (70%)" total={PROJECT.acqDebt} lotShare={c.acqDebtRelease} indent />
          <StackRow label="Equity (30%)" total={PROJECT.acqEquity} indent />
          <div style={{ height: 6 }} />
          <StackRow label="HORIZONTAL DEVELOPMENT" total={PROJECT.horizontalCost} bold />
          <StackRow label="Senior Debt (70%)" total={PROJECT.horizDebt} lotShare={c.horizDebtRelease} indent />
          <StackRow label="Equity (30%)" total={PROJECT.horizEquity} indent />
          <div style={{ borderTop: `1px solid ${STEEL}`, margin: "6px 0" }} />
          <StackRow label="TOTAL CAPITALIZATION" total={PROJECT.totalCap} bold />
          <StackRow label="Total Senior Debt" total={PROJECT.totalDebt} lotShare={c.acqDebtRelease + c.horizDebtRelease} indent />
          <StackRow label="Total Equity" total={PROJECT.totalEquity} indent />
        </div>
        <div style={{
          marginTop: 10, padding: "8px 10px", background: CREAM,
          borderRadius: 6, fontSize: 10.5, color: "#5A4A2A", lineHeight: 1.5,
        }}>
          <div style={{ fontWeight: 700, color: NAVY, fontSize: 10.5, letterSpacing: 0.4, marginBottom: 4 }}>REVOLVER (project-level)</div>
          Bridge facility covers horizontal work over acquisition during the period before MUD reimbursement begins.<br />
          Capacity: <b>{fmtCompact(PROJECT.revolverCapacity)}</b> · Rate: <b>{(PROJECT.revolverRate * 100).toFixed(1)}%</b>
        </div>

        {/* Section 4: Vertical Construction (context) */}
        <SectionHeader>Vertical Construction (Context)</SectionHeader>
        <div style={{ borderTop: `1.5px solid ${NAVY}`, padding: "8px 0" }}>
          <div style={{ fontSize: 11, color: "#7A8B9A", fontStyle: "italic", marginBottom: 8 }}>
            Not paid from lot sale proceeds — shown for context.
          </div>
          <Row label="Lot's pro-rata share of hard + soft" value={fmt(c.verticalContext)} bold />
          <div style={{ fontSize: 10.5, color: "#7A8B9A", marginTop: 6, lineHeight: 1.5 }}>
            Buyer funds their own vertical build separately based on their program (3% escrow partially offsets horizontal).
          </div>
        </div>
      </div>
    </div>
  );
}

function StackRow({ label, total, lotShare, indent, bold }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8,
      padding: "3px 0", paddingLeft: indent ? 12 : 0,
      fontSize: 11.5, color: NAVY, fontWeight: bold ? 800 : 500,
      letterSpacing: bold ? 0.4 : 0,
    }}>
      <div style={{ textTransform: bold ? "uppercase" : "none" }}>{label}</div>
      <div style={{ fontFamily: "Georgia,serif", fontVariantNumeric: "tabular-nums", textAlign: "right", minWidth: 60 }}>
        {fmtCompact(total)}
      </div>
      <div style={{ fontFamily: "Georgia,serif", fontVariantNumeric: "tabular-nums", textAlign: "right", minWidth: 80, color: lotShare ? POS : "transparent", fontWeight: 600 }}>
        {lotShare ? fmt(lotShare) : "—"}
      </div>
    </div>
  );
}

function Header({ lot, c, onClose }) {
  const pillBg = TYPE_COLORS[lot.use] || TYPE_COLORS[lot.type] || GOLD;
  const isIndustrial = (lot.use || lot.type) === "Industrial";
  return (
    <div style={{ background: NAVY, color: "white", padding: "14px 16px", borderTop: `3px solid ${GOLD}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "Georgia,serif" }}>
            Lot {lot.id} — {lot.use || lot.type || "Parcel"}
          </div>
          <div style={{ fontSize: 11.5, color: CREAM, opacity: 0.9, marginTop: 4, lineHeight: 1.5 }}>
            {lot.acres ? `${lot.acres} ac` : ""}
            {c?.sf ? ` · ${c.sf.toLocaleString()} SF` : ""}
            {lot.asking ? ` · $${lot.asking}/SF` : ""}
            {lot.saleMonth ? ` · Sale Mo ${lot.saleMonth}` : ""}
          </div>
        </div>
        <button onClick={onClose} aria-label="Close"
          style={{
            background: "rgba(255,255,255,0.12)", border: "none", color: "white",
            cursor: "pointer", width: 26, height: 26, borderRadius: 6, fontSize: 14, lineHeight: 1, flexShrink: 0,
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
