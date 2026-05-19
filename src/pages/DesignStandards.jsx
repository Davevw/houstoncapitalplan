import { useState, useCallback } from "react";

const VAULT_BASE = "https://tibxlixiqcfyljevkdib.supabase.co/storage/v1/object/public/itph-data-vault/";
const DEV_STANDARDS_URL = VAULT_BASE + "General/1779216764005_ITPH_Development_Standards_v1.docx";
const ENV_SUMMARY_URL = VAULT_BASE + "General/1779216764908_ITPH_Environmental_Status_Summary.docx";


const NAVY = "#1B3A5C";
const TEAL = "#0D7377";
const TEAL_LIGHT = "#E1F5EE";
const AMBER = "#D4A843";
const AMBER_LIGHT = "#FAEEDA";
const GREEN_DARK = "#3B6D11";
const GREEN_LIGHT = "#EAF3DE";
const GRAY_MID = "#888780";
const GRAY_LIGHT = "#F1EFE8";
const RED_ACCENT = "#A32D2D";
const BG = "#FAFAF8";
const WHITE = "#FFFFFF";
const TEXT = "#2C2C2A";
const TEXT_SEC = "#5F5E5A";
const BORDER = "#D3D1C7";

const districts = {
  multifamily: {
    name: "Multifamily residential",
    color: AMBER,
    lightColor: AMBER_LIGHT,
    icon: "◻",
    lots: "14, 15, 16",
    acres: "36.62 ac (30.2%)",
    uses: ["Market-rate and affordable multifamily", "Workforce housing and senior living", "Leasing offices, amenity buildings, recreation"],
    materials: {
      encouraged: ["Brick and stone veneer (min 65% primary facades)", "Cementitious fiber board (HardiePlank) on secondary", "Standing seam metal roof", "Architectural metal panel accents"],
      prohibited: ["Vinyl or aluminum siding", "Unfinished CMU", "T-111 wood-grain panels", "Corrugated metal siding"]
    },
    setbacks: { front: "25 ft", side: "15 ft", sideAdj: "15 ft", rear: "20 ft" },
    height: "3–4 stories",
    landscape: "20% minimum open space",
    signage: "Monument: 100 SF max, 8 ft height. Building: 120 SF/bldg naming. Illumination: dusk–11 PM, shielded.",
    screening: "HVAC rooftop equipment screened from ground level. Refuse enclosed in masonry with opaque gates.",
    parking: "1.5 spaces/unit per City of Houston MF code"
  },
  retail: {
    name: "Retail / commercial",
    color: GREEN_DARK,
    lightColor: GREEN_LIGHT,
    icon: "◻",
    lots: "2–4, 8, 17, 19–30",
    acres: "23.48 ac (19.4%)",
    uses: ["Neighborhood retail, restaurant, service", "Professional and medical office", "Financial institutions, convenience retail", "Fuel stations (screened per ARC)"],
    materials: {
      encouraged: ["Masonry, stone, architectural precast", "Glass storefront systems", "Split-face or burnished CMU (secondary only)", "EIFS as accent only (max 15% per facade)"],
      prohibited: ["EIFS below 8 ft on any elevation", "Unfinished concrete block", "Vinyl siding", "Corrugated metal"]
    },
    setbacks: { front: "15 ft", side: "10 ft", sideAdj: "15 ft", rear: "15 ft" },
    height: "1–2 stories",
    landscape: "15% minimum lot area",
    signage: "Monument: 120 SF max, 10 ft height. Building: 1.0 SF/LF frontage (max 200 SF). Illumination: dusk–11 PM, shielded. No pole signs.",
    screening: "Loading areas screened with 6 ft masonry wall when facing street or MF lot. Dumpsters enclosed.",
    parking: "1 space/250 SF GLA per City of Houston"
  },
  flex: {
    name: "Flex / office-warehouse",
    color: TEAL,
    lightColor: TEAL_LIGHT,
    icon: "◻",
    lots: "1, 5–7, 9, 13",
    acres: "21.55 ac (17.8%)",
    uses: ["Flex/office-warehouse, light assembly, R&D", "Technology and data operations", "Showroom and distribution with office component", "Design-build per Metro Structures available"],
    materials: {
      encouraged: ["Architectural tilt-up concrete with reveals/texture", "Insulated metal panel with color banding", "Glass and masonry at office entries", "Composite panel systems for office differentiation"],
      prohibited: ["Plain gray tilt-up without treatment", "Corrugated sheet metal on primary facades", "Unfinished plywood or particle board", "Exposed concrete block"]
    },
    setbacks: { front: "25 ft", side: "15 ft", sideAdj: "25 ft", rear: "20 ft" },
    height: "1–2 stories, clear height per use",
    landscape: "10% minimum lot area",
    signage: "Monument: 100 SF max, 8 ft height. Building: 0.9 SF/LF (max 220 SF). Shared directory signs encouraged. Dusk–11 PM.",
    screening: "Loading docks oriented away from streets and MF lots. 6 ft screen wall with landscaping where facing MF. Mechanical equipment screened.",
    parking: "1 space/300 SF office + 1/1,000 SF warehouse"
  },
  industrial: {
    name: "Commercial / light industrial",
    color: GRAY_MID,
    lightColor: GRAY_LIGHT,
    icon: "◻",
    lots: "10–12, 18",
    acres: "6.00 ac (5.0%)",
    uses: ["Light manufacturing, assembly, fabrication", "Warehousing and logistics", "Automotive service (fully enclosed or screened)", "Distribution centers"],
    materials: {
      encouraged: ["Tilt-up concrete with architectural treatment", "Reveals, form liners, integral color on primary facades", "Insulated metal panel on secondary facades", "Glass and masonry accent at office entries"],
      prohibited: ["Blank gray tilt-up on street-facing facades", "Corrugated metal siding", "Vinyl or aluminum siding", "Unfinished CMU on any visible facade"]
    },
    setbacks: { front: "30 ft", side: "20 ft", sideAdj: "30 ft", rear: "25 ft" },
    height: "1–2 stories",
    landscape: "10% minimum lot area",
    signage: "Monument: 80 SF max, 8 ft height, 15 ft setback. Building: 0.75 SF/LF (max 200 SF). No pole signs. Security lighting allowed, no glare spillover.",
    screening: "Loading docks oriented away from streets and MF. Truck queuing on-site only. 8 ft opaque fence/wall with landscaping for any approved outdoor storage. All mechanical equipment screened.",
    parking: "1 space/1,000 SF plus employee count requirements"
  }
};

const envSummary = {
  title: "Environmental status summary",
  items: [
    { label: "MSW permit", status: "Active — revocation on track Q3 2027", impact: "No impact on construction, permits, sales, or bonding" },
    { label: "MSD", status: "In place — TCEQ and City approved", impact: "Restricts groundwater use only" },
    { label: "Geotechnical", status: "Goodheart engaged — investigation underway", impact: "Site suitable for commercial/industrial construction" },
    { label: "MUD 584", status: "TCEQ approved May 2026", impact: "Approved with full knowledge of site history" },
    { label: "Post-closure care", status: "Secured by letter of credit", impact: "Held by permit holder; transferable at closing" },
    { label: "TPDES permit", status: "Public meeting scheduled", impact: "Required procedural step — on track" }
  ],
  keyMessage: "The site's environmental history is a managed, documented, and nearly resolved regulatory condition — not an open liability. The MSW permit holder is the project principal, providing full transparency and control. TCEQ approved MUD 584 with full knowledge of the site history."
};

const infrastructure = {
  title: "Infrastructure & construction timeline",
  items: [
    { phase: "Design teams engaged", period: "May – Sep 2026" },
    { phase: "METRO clearing / grubbing", period: "Oct – Nov 2026" },
    { phase: "Building permits", period: "Oct 2026 – Mar 2027" },
    { phase: "Mass grading", period: "Feb – Aug 2027" },
    { phase: "Water / sewer / storm", period: "May – Oct 2027" },
    { phase: "Paving", period: "Sep – Nov 2027" },
    { phase: "Certificate of occupancy", period: "Dec 2027" }
  ],
  costs: [
    { item: "Water distribution", cost: "$1.99M" },
    { item: "Sanitary sewer", cost: "$3.43M" },
    { item: "Storm sewer", cost: "$12.53M" },
    { item: "Roadway", cost: "$5.10M" },
    { item: "Erosion control", cost: "$0.26M" },
    { item: "Total hard costs", cost: "$23.59M" }
  ]
};

function Panel({ title, onClose, color, children }) {
  return (
    <div style={{ position: "fixed", top: 0, right: 0, width: "420px", height: "100vh", background: WHITE, borderLeft: `3px solid ${color || TEAL}`, boxShadow: "-4px 0 24px rgba(0,0,0,0.12)", zIndex: 1000, overflowY: "auto", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ position: "sticky", top: 0, background: WHITE, borderBottom: `1px solid ${BORDER}`, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 2 }}>
        <span style={{ fontSize: "16px", fontWeight: 600, color: NAVY }}>{title}</span>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: TEXT_SEC, padding: "4px 8px" }}>✕</button>
      </div>
      <div style={{ padding: "20px" }}>{children}</div>
    </div>
  );
}

function Badge({ color, children }) {
  return (
    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: 600, background: color + "18", color, letterSpacing: "0.5px", textTransform: "uppercase" }}>{children}</span>
  );
}

function DataRow({ label, value, accent }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${BORDER}40` }}>
      <span style={{ fontSize: "13px", color: TEXT_SEC }}>{label}</span>
      <span style={{ fontSize: "13px", fontWeight: 500, color: accent || TEXT }}>{value}</span>
    </div>
  );
}

function MaterialList({ items, type }) {
  const isGood = type === "encouraged";
  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: isGood ? TEAL : RED_ACCENT, marginBottom: "6px" }}>{type}</div>
      {items.map((item, i) => (
        <div key={i} style={{ fontSize: "13px", color: TEXT, padding: "4px 0 4px 16px", borderLeft: `2px solid ${isGood ? TEAL : RED_ACCENT}30`, marginBottom: "2px" }}>{item}</div>
      ))}
    </div>
  );
}

function DistrictPanel({ district, onClose }) {
  const d = districts[district];
  return (
    <Panel title={d.name} onClose={onClose} color={d.color}>
      <Badge color={d.color}>{d.acres}</Badge>
      <div style={{ marginTop: "12px", fontSize: "12px", color: TEXT_SEC }}>Lots: {d.lots}</div>
      
      <div style={{ marginTop: "20px", fontSize: "14px", fontWeight: 600, color: NAVY }}>Permitted uses</div>
      {d.uses.map((u, i) => <div key={i} style={{ fontSize: "13px", color: TEXT, padding: "4px 0 4px 12px", borderLeft: `2px solid ${d.color}40` }}>{u}</div>)}
      
      <div style={{ marginTop: "20px", fontSize: "14px", fontWeight: 600, color: NAVY }}>Exterior materials</div>
      <MaterialList items={d.materials.encouraged} type="encouraged" />
      <MaterialList items={d.materials.prohibited} type="prohibited" />
      
      <div style={{ marginTop: "20px", fontSize: "14px", fontWeight: 600, color: NAVY }}>Setbacks</div>
      <DataRow label="Front (street-facing)" value={d.setbacks.front} />
      <DataRow label="Side (interior)" value={d.setbacks.side} />
      <DataRow label="Side (adjacent to MF)" value={d.setbacks.sideAdj} />
      <DataRow label="Rear" value={d.setbacks.rear} />
      
      <div style={{ marginTop: "20px", fontSize: "14px", fontWeight: 600, color: NAVY }}>Building height</div>
      <div style={{ fontSize: "13px", color: TEXT, marginTop: "4px" }}>{d.height}</div>
      
      <div style={{ marginTop: "20px", fontSize: "14px", fontWeight: 600, color: NAVY }}>Landscape requirement</div>
      <div style={{ fontSize: "13px", color: TEXT, marginTop: "4px" }}>{d.landscape}</div>

      <div style={{ marginTop: "20px", fontSize: "14px", fontWeight: 600, color: NAVY }}>Signage standards</div>
      <div style={{ fontSize: "13px", color: TEXT, marginTop: "4px", lineHeight: 1.5 }}>{d.signage}</div>

      <div style={{ marginTop: "20px", fontSize: "14px", fontWeight: 600, color: NAVY }}>Screening requirements</div>
      <div style={{ fontSize: "13px", color: TEXT, marginTop: "4px", lineHeight: 1.5 }}>{d.screening}</div>

      <div style={{ marginTop: "20px", fontSize: "14px", fontWeight: 600, color: NAVY }}>Parking</div>
      <div style={{ fontSize: "13px", color: TEXT, marginTop: "4px" }}>{d.parking}</div>

      <div style={{ marginTop: "24px", padding: "12px 16px", background: `${d.color}10`, borderLeft: `3px solid ${d.color}`, borderRadius: "0 6px 6px 0", fontSize: "12px", color: TEXT_SEC, lineHeight: 1.5 }}>
        All development requires ARC approval prior to building permit submission. These standards supplement the recorded CC&Rs. Full Development Standards document available in project data vault.
      </div>
    </Panel>
  );
}

function EnvPanel({ onClose }) {
  return (
    <Panel title="Environmental status" onClose={onClose} color={TEAL}>
      <div style={{ padding: "12px 16px", background: TEAL_LIGHT, borderLeft: `3px solid ${TEAL}`, borderRadius: "0 6px 6px 0", fontSize: "13px", color: NAVY, lineHeight: 1.6, marginBottom: "20px", fontWeight: 500 }}>
        {envSummary.keyMessage}
      </div>
      {envSummary.items.map((item, i) => (
        <div key={i} style={{ marginBottom: "12px", padding: "10px 14px", background: i % 2 === 0 ? `${BG}` : WHITE, borderRadius: "6px" }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: NAVY }}>{item.label}</div>
          <div style={{ fontSize: "12px", color: TEAL, marginTop: "2px" }}>{item.status}</div>
          <div style={{ fontSize: "12px", color: TEXT_SEC, marginTop: "2px" }}>{item.impact}</div>
        </div>
      ))}
      <div style={{ marginTop: "20px", padding: "12px 16px", background: `${AMBER}10`, borderLeft: `3px solid ${AMBER}`, borderRadius: "0 6px 6px 0", fontSize: "12px", color: TEXT_SEC, lineHeight: 1.5 }}>
        <strong style={{ color: NAVY }}>Document available:</strong> The full Environmental Status Summary (4 pages) is available in the project data vault for download and distribution to qualified prospects, brokers, and lenders.
      </div>
    </Panel>
  );
}

function InfraPanel({ onClose }) {
  return (
    <Panel title="Infrastructure & timeline" onClose={onClose} color={NAVY}>
      <div style={{ fontSize: "14px", fontWeight: 600, color: NAVY, marginBottom: "12px" }}>Construction schedule</div>
      {infrastructure.items.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: i < 2 ? TEAL : NAVY, marginRight: "12px", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "13px", fontWeight: 500, color: TEXT }}>{item.phase}</div>
            <div style={{ fontSize: "12px", color: TEXT_SEC }}>{item.period}</div>
          </div>
        </div>
      ))}
      <div style={{ fontSize: "14px", fontWeight: 600, color: NAVY, marginTop: "24px", marginBottom: "12px" }}>Infrastructure costs</div>
      {infrastructure.costs.map((item, i) => (
        <DataRow key={i} label={item.item} value={item.cost} accent={i === infrastructure.costs.length - 1 ? NAVY : TEXT} />
      ))}
      <div style={{ marginTop: "16px", fontSize: "12px", color: TEXT_SEC, lineHeight: 1.5 }}>
        MUD 584 bond principal: $23.4M at 8%. Reimbursement potential up to $35M. Payout: 50% at month 24, 50% at month 36. Metro Structures managing all construction.
      </div>
    </Panel>
  );
}

function LotBlock({ x, y, w, h, lot, acres, district, onClick }) {
  const d = districts[district];
  const isSmall = w < 55 || h < 40;
  return (
    <g onClick={() => onClick(district)} style={{ cursor: "pointer" }}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={d.lightColor} stroke={d.color} strokeWidth={1.2} opacity={0.9} />
      <text x={x + w/2} y={isSmall ? y + h/2 + 1 : y + h/2 - 4} textAnchor="middle" dominantBaseline="central" style={{ fontSize: isSmall ? "10px" : "12px", fontWeight: 600, fill: d.color, fontFamily: "'DM Sans', sans-serif" }}>{lot}</text>
      {!isSmall && acres && <text x={x + w/2} y={y + h/2 + 12} textAnchor="middle" dominantBaseline="central" style={{ fontSize: "9px", fill: TEXT_SEC, fontFamily: "'DM Sans', sans-serif" }}>{acres}</text>}
    </g>
  );
}

export default function App() {
  const [activePanel, setActivePanel] = useState(null);
  const [activeDistrict, setActiveDistrict] = useState(null);

  const openDistrict = useCallback((d) => { setActiveDistrict(d); setActivePanel("district"); }, []);
  const openEnv = useCallback(() => { setActivePanel("env"); setActiveDistrict(null); }, []);
  const openInfra = useCallback(() => { setActivePanel("infra"); setActiveDistrict(null); }, []);
  const closePanel = useCallback(() => { setActivePanel(null); setActiveDistrict(null); }, []);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: BG, minHeight: "100vh", padding: "0" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: NAVY, padding: "28px 32px 24px", borderBottom: `3px solid ${TEAL}` }}>
        <div style={{ fontSize: "11px", letterSpacing: "2px", color: TEAL, textTransform: "uppercase", marginBottom: "6px" }}>Houston ITP · Development Standards</div>
        <h1 style={{ fontSize: "28px", fontWeight: 700, color: WHITE, margin: 0, fontFamily: "'Playfair Display', serif", lineHeight: 1.2 }}>International Trade Park Houston</h1>
        <div style={{ fontSize: "14px", color: "#9c9a92", marginTop: "6px" }}>136-acre master-planned mixed-use development · 12000 Bissonnet Street, Houston TX</div>
      </div>

      {/* Nav bar */}
      <div style={{ display: "flex", gap: "8px", padding: "14px 32px", background: WHITE, borderBottom: `1px solid ${BORDER}`, flexWrap: "wrap" }}>
        {Object.entries(districts).map(([key, d]) => (
          <button key={key} onClick={() => openDistrict(key)} style={{ padding: "6px 14px", borderRadius: "6px", border: `1px solid ${d.color}40`, background: activeDistrict === key ? d.color + "18" : "transparent", color: d.color, fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s" }}>
            {d.name}
          </button>
        ))}
        <button onClick={openEnv} style={{ padding: "6px 14px", borderRadius: "6px", border: `1px solid ${RED_ACCENT}40`, background: activePanel === "env" ? RED_ACCENT + "18" : "transparent", color: RED_ACCENT, fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
          Environmental status
        </button>
        <button onClick={openInfra} style={{ padding: "6px 14px", borderRadius: "6px", border: `1px solid ${NAVY}40`, background: activePanel === "infra" ? NAVY + "18" : "transparent", color: NAVY, fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
          Infrastructure
        </button>
      </div>

      {/* Main content */}
      <div style={{ padding: "24px 32px" }}>
        {/* Site composition cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
          {Object.entries(districts).map(([key, d]) => (
            <div key={key} onClick={() => openDistrict(key)} style={{ background: WHITE, borderRadius: "8px", padding: "16px", borderLeft: `4px solid ${d.color}`, cursor: "pointer", transition: "box-shadow 0.15s", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", color: d.color, fontWeight: 600 }}>{d.name}</div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: NAVY, marginTop: "4px" }}>{d.acres.split(" ")[0]}</div>
              <div style={{ fontSize: "11px", color: TEXT_SEC }}>Lots {d.lots}</div>
            </div>
          ))}
        </div>

        {/* Interactive site plan */}
        <div style={{ background: WHITE, borderRadius: "10px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: "24px" }}>
          <div style={{ fontSize: "14px", fontWeight: 600, color: NAVY, marginBottom: "4px" }}>Interactive site plan — click any district or lot</div>
          <div style={{ fontSize: "12px", color: TEXT_SEC, marginBottom: "16px" }}>Districts are color-coded. Click to view full design standards, materials, setbacks, and requirements.</div>
          
          <svg width="100%" viewBox="0 0 620 480" style={{ maxWidth: "100%" }}>
            {/* Property boundary */}
            <rect x="30" y="20" width="460" height="440" rx="4" fill="none" stroke={BORDER} strokeWidth={1.5} strokeDasharray="6 3"/>
            
            {/* Road labels */}
            <text x="12" y="240" textAnchor="middle" transform="rotate(-90 12 240)" style={{ fontSize: "10px", fill: TEXT_SEC, fontFamily: "'DM Sans', sans-serif" }}>Cook Rd</text>
            <text x="506" y="240" textAnchor="middle" transform="rotate(90 506 240)" style={{ fontSize: "10px", fill: TEXT_SEC, fontFamily: "'DM Sans', sans-serif" }}>S Kirkwood Rd</text>
            <text x="260" y="472" textAnchor="middle" style={{ fontSize: "10px", fill: TEXT_SEC, fontFamily: "'DM Sans', sans-serif" }}>Bissonnet Street</text>

            {/* Detention */}
            <rect x="36" y="26" width="448" height="38" rx="3" fill={GRAY_LIGHT} opacity={0.5} stroke={BORDER} strokeWidth={0.5}/>
            <text x="260" y="50" textAnchor="middle" style={{ fontSize: "9px", fill: TEXT_SEC, fontFamily: "'DM Sans', sans-serif" }}>North detention — 10.89 ac</text>
            <rect x="36" y="415" width="448" height="38" rx="3" fill={GRAY_LIGHT} opacity={0.5} stroke={BORDER} strokeWidth={0.5}/>
            <text x="260" y="438" textAnchor="middle" style={{ fontSize: "9px", fill: TEXT_SEC, fontFamily: "'DM Sans', sans-serif" }}>South detention — 13.38 ac</text>

            {/* Internal roads */}
            <line x1="36" y1="260" x2="478" y2="260" stroke={BORDER} strokeWidth={1} opacity={0.5}/>
            <line x1="175" y1="70" x2="175" y2="410" stroke={BORDER} strokeWidth={1} opacity={0.5}/>
            <line x1="330" y1="70" x2="330" y2="410" stroke={BORDER} strokeWidth={1} opacity={0.5}/>

            {/* MULTIFAMILY */}
            <LotBlock x={40} y={70} w={128} h={80} lot="Lot 14" acres="13.2 ac" district="multifamily" onClick={openDistrict}/>
            <LotBlock x={40} y={158} w={128} h={70} lot="Lot 15" acres="11.2 ac" district="multifamily" onClick={openDistrict}/>
            <LotBlock x={40} y={268} w={128} h={70} lot="Lot 16" acres="12.3 ac" district="multifamily" onClick={openDistrict}/>

            {/* FLEX */}
            <LotBlock x={183} y={70} w={68} h={55} lot="Lot 1" acres="3.88 ac" district="flex" onClick={openDistrict}/>
            <LotBlock x={255} y={70} w={68} h={55} lot="Lot 5" acres="6.4 ac" district="flex" onClick={openDistrict}/>
            <LotBlock x={183} y={132} w={68} h={50} lot="Lot 6" acres="4.9 ac" district="flex" onClick={openDistrict}/>
            <LotBlock x={255} y={132} w={68} h={50} lot="Lot 7" acres="3.3 ac" district="flex" onClick={openDistrict}/>
            <LotBlock x={183} y={190} w={68} h={46} lot="Lot 9" acres="2.1 ac" district="flex" onClick={openDistrict}/>
            <LotBlock x={255} y={190} w={68} h={46} lot="Lot 13" acres="1.2 ac" district="flex" onClick={openDistrict}/>

            {/* INDUSTRIAL */}
            <LotBlock x={183} y={268} w={46} h={60} lot="10" acres="1.8" district="industrial" onClick={openDistrict}/>
            <LotBlock x={233} y={268} w={46} h={60} lot="11" acres="2.4" district="industrial" onClick={openDistrict}/>
            <LotBlock x={283} y={268} w={46} h={60} lot="12" acres="3.1" district="industrial" onClick={openDistrict}/>
            <LotBlock x={183} y={336} w={146} h={36} lot="Lot 18 · 1.2 ac" district="industrial" onClick={openDistrict}/>

            {/* RETAIL */}
            <LotBlock x={338} y={70} w={65} h={48} lot="Lot 2" acres="1.4 ac" district="retail" onClick={openDistrict}/>
            <LotBlock x={408} y={70} w={65} h={48} lot="Lot 3" acres="1.2 ac" district="retail" onClick={openDistrict}/>
            <LotBlock x={338} y={124} w={65} h={48} lot="Lot 4" acres="1.2 ac" district="retail" onClick={openDistrict}/>
            <LotBlock x={408} y={124} w={65} h={48} lot="Lot 8" acres="1.3 ac" district="retail" onClick={openDistrict}/>
            <LotBlock x={338} y={178} w={65} h={38} lot="17" district="retail" onClick={openDistrict}/>
            <LotBlock x={408} y={178} w={65} h={38} lot="19" district="retail" onClick={openDistrict}/>
            <LotBlock x={338} y={268} w={44} h={34} lot="20" district="retail" onClick={openDistrict}/>
            <LotBlock x={386} y={268} w={44} h={34} lot="21" district="retail" onClick={openDistrict}/>
            <LotBlock x={434} y={268} w={44} h={34} lot="22" district="retail" onClick={openDistrict}/>
            <LotBlock x={338} y={306} w={44} h={34} lot="23" district="retail" onClick={openDistrict}/>
            <LotBlock x={386} y={306} w={44} h={34} lot="24" district="retail" onClick={openDistrict}/>
            <LotBlock x={434} y={306} w={44} h={34} lot="25" district="retail" onClick={openDistrict}/>
            <LotBlock x={338} y={344} w={44} h={34} lot="26" district="retail" onClick={openDistrict}/>
            <LotBlock x={386} y={344} w={44} h={34} lot="27" district="retail" onClick={openDistrict}/>
            <LotBlock x={434} y={344} w={44} h={34} lot="28" district="retail" onClick={openDistrict}/>
            <LotBlock x={338} y={382} w={68} h={28} lot="29" district="retail" onClick={openDistrict}/>
            <LotBlock x={410} y={382} w={68} h={28} lot="30" district="retail" onClick={openDistrict}/>

            {/* Environmental hotspot */}
            <g onClick={openEnv} style={{ cursor: "pointer" }}>
              <circle cx="555" cy="100" r="18" fill={TEAL} opacity={0.15} stroke={TEAL} strokeWidth={1}/>
              <text x="555" y="97" textAnchor="middle" style={{ fontSize: "14px", fill: TEAL, fontFamily: "'DM Sans', sans-serif" }}>☰</text>
              <text x="555" y="110" textAnchor="middle" style={{ fontSize: "7px", fill: TEAL, fontFamily: "'DM Sans', sans-serif" }}>ENV</text>
            </g>

            {/* Infrastructure hotspot */}
            <g onClick={openInfra} style={{ cursor: "pointer" }}>
              <circle cx="555" cy="150" r="18" fill={NAVY} opacity={0.15} stroke={NAVY} strokeWidth={1}/>
              <text x="555" y="147" textAnchor="middle" style={{ fontSize: "14px", fill: NAVY, fontFamily: "'DM Sans', sans-serif" }}>⚙</text>
              <text x="555" y="160" textAnchor="middle" style={{ fontSize: "7px", fill: NAVY, fontFamily: "'DM Sans', sans-serif" }}>INFRA</text>
            </g>

            {/* Legend */}
            <g>
              <rect x="520" y="200" width="95" height="180" rx="6" fill={WHITE} stroke={BORDER} strokeWidth={0.5}/>
              <text x="567" y="220" textAnchor="middle" style={{ fontSize: "10px", fontWeight: 600, fill: NAVY, fontFamily: "'DM Sans', sans-serif" }}>Legend</text>
              {[
                { color: AMBER, label: "Multifamily", y: 238 },
                { color: GREEN_DARK, label: "Retail", y: 260 },
                { color: TEAL, label: "Flex", y: 282 },
                { color: GRAY_MID, label: "Industrial", y: 304 },
                { color: BORDER, label: "Detention", y: 326 },
              ].map((item, i) => (
                <g key={i}>
                  <rect x={528} y={item.y - 6} width={12} height={12} rx={2} fill={item.color} opacity={0.7}/>
                  <text x={546} y={item.y + 4} style={{ fontSize: "9px", fill: TEXT_SEC, fontFamily: "'DM Sans', sans-serif" }}>{item.label}</text>
                </g>
              ))}
              <text x="567" y="365" textAnchor="middle" style={{ fontSize: "8px", fill: TEXT_SEC, fontFamily: "'DM Sans', sans-serif", opacity: 0.6 }}>Keystone™ 2026</text>
            </g>
          </svg>
        </div>

        {/* Quick reference cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" }}>
          <div onClick={openEnv} style={{ background: WHITE, borderRadius: "8px", padding: "16px", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", borderTop: `3px solid ${TEAL}` }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: NAVY }}>Environmental status</div>
            <div style={{ fontSize: "12px", color: TEXT_SEC, marginTop: "4px", lineHeight: 1.5 }}>MSW permit, MSD, geotechnical suitability, TCEQ regulatory path. Full summary document available in data vault.</div>
            <div style={{ fontSize: "11px", color: TEAL, fontWeight: 600, marginTop: "8px" }}>View details →</div>
          </div>
          <div onClick={openInfra} style={{ background: WHITE, borderRadius: "8px", padding: "16px", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", borderTop: `3px solid ${NAVY}` }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: NAVY }}>Infrastructure & timeline</div>
            <div style={{ fontSize: "12px", color: TEXT_SEC, marginTop: "4px", lineHeight: 1.5 }}>$23.59M infrastructure program. MUD 584 TCEQ-approved. Construction schedule through C of O Dec 2027.</div>
            <div style={{ fontSize: "11px", color: NAVY, fontWeight: 600, marginTop: "8px" }}>View details →</div>
          </div>
          <div style={{ background: WHITE, borderRadius: "8px", padding: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", borderTop: `3px solid ${AMBER}` }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: NAVY }}>Project documents</div>
            <div style={{ fontSize: "12px", color: TEXT_SEC, marginTop: "4px", lineHeight: 1.5 }}>Development Standards v1.0 and Environmental Status Summary available in the project data vault for download.</div>
            <div style={{ fontSize: "11px", color: AMBER, fontWeight: 600, marginTop: "8px" }}>Data vault →</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "20px 0 12px", borderTop: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: "11px", color: TEXT_SEC }}>Keystone™ 2026 · Bissonnet 136, LLC · Confidential</div>
          <div style={{ fontSize: "10px", color: TEXT_SEC, opacity: 0.6, marginTop: "4px" }}>International Trade Park Houston · 12000 Bissonnet Street, Houston TX 77099</div>
        </div>
      </div>

      {/* Panels */}
      {activePanel === "district" && activeDistrict && <DistrictPanel district={activeDistrict} onClose={closePanel} />}
      {activePanel === "env" && <EnvPanel onClose={closePanel} />}
      {activePanel === "infra" && <InfraPanel onClose={closePanel} />}
    </div>
  );
}
