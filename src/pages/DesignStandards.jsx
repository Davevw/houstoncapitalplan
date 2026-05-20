import { useState, useCallback, Suspense, lazy } from "react";
const ITPH3DSiteModel = lazy(() => import("../components/ITPH3DSiteModel.jsx"));

const VAULT = "https://tibxlixiqcfyljevkdib.supabase.co/storage/v1/object/public/itph-data-vault/";
const DEV_STANDARDS_PDF = "/docs/ITPH_Development_Standards_v1.pdf";
const ENV_SUMMARY_PDF = "/docs/ITPH_Environmental_Status_Summary.pdf";
const CCRS_PDF = VAULT + "CCRs_HOA_Documents/1778879026557_ITP_Houston_CCRs_Full_with_Exhibits_final form.pdf";
const SITE_PLAN_PNG = VAULT + "Maps___Plans/1776379030717_ITPH Site Map.png";
const FINANCIAL_MODEL_XLSX = VAULT + "Financial_Models/1776522242769_ITPH v.13.xlsx";
const EQUITY_PRESENTATION_PDF = VAULT + "Presentations/ITP_Houston_Investor_Presentation.pdf";

const C = {
  navy: "#1B3A5C", teal: "#0D7377", tealLight: "#E1F5EE",
  amber: "#D4A843", amberLight: "#FAEEDA",
  green: "#3B6D11", greenLight: "#EAF3DE",
  gray: "#888780", grayLight: "#F1EFE8",
  red: "#A32D2D", redLight: "#FCEBEB",
  bg: "#FAFAF8", white: "#FFFFFF",
  text: "#2C2C2A", textSec: "#5F5E5A", border: "#D3D1C7",
  blue: "#185FA5", blueLight: "#E6F1FB"
};

const tabs = ["Master plan", "Districts", "Infrastructure", "Permitting", "Contacts", "Documents"];

const MAIN_TABS = ["Dashboard","Lot Schedule","Cash Flows","Capital Stack","Expenditures","Deemed Capital","Financial Model","Site Plan","MUD Analysis"];
const MAIN_NAVY = "#0B3D5C";
const MAIN_TEAL = "#0D7377";

const districts = {
  multifamily: { name: "Multifamily", short: "MF", color: C.amber, light: C.amberLight, lots: "14, 15, 16", acres: "36.62", pct: "30.2%", lotCount: 3, uses: ["Market-rate & affordable apartments", "Workforce & senior housing", "Leasing offices, amenities, recreation"], materials: { good: ["Brick/stone veneer (min 65% primary)", "Cementitious fiber board secondary", "Standing seam metal roof", "Architectural metal accents"], bad: ["Vinyl/aluminum siding", "Unfinished CMU", "T-111 panels", "Corrugated metal"] }, setbacks: { front: "25'", side: "15'", adj: "15'", rear: "20'" }, height: "3–4 stories", landscape: "20%", parking: "1.5 sp/unit", signage: "Monument 100 SF / 8 ft. Building 120 SF/bldg." },
  retail: { name: "Retail / commercial", short: "RTL", color: C.green, light: C.greenLight, lots: "2–4, 8, 17, 19–30", acres: "23.48", pct: "19.4%", lotCount: 16, uses: ["Neighborhood retail & restaurant", "Professional & medical office", "Financial institutions", "Fuel stations (screened)"], materials: { good: ["Masonry, stone, precast", "Glass storefront systems", "Split-face CMU (secondary)", "EIFS accent only (max 15%)"], bad: ["EIFS below 8 ft", "Unfinished concrete block", "Vinyl siding", "Corrugated metal"] }, setbacks: { front: "15'", side: "10'", adj: "15'", rear: "15'" }, height: "1–2 stories", landscape: "15%", parking: "1 sp/250 SF", signage: "Monument 120 SF / 10 ft. Building 1.0 SF/LF." },
  flex: { name: "Flex / office-warehouse", short: "FLX", color: C.teal, light: C.tealLight, lots: "1, 5–7, 9, 13", acres: "21.55", pct: "17.8%", lotCount: 6, uses: ["Flex/office-warehouse & R&D", "Technology & data operations", "Showroom & distribution", "Design-build available"], materials: { good: ["Architectural tilt-up w/ reveals", "Insulated metal panel w/ banding", "Glass & masonry at entries", "Composite panels for office"], bad: ["Plain gray tilt-up", "Corrugated sheet metal", "Unfinished plywood", "Exposed concrete block"] }, setbacks: { front: "25'", side: "15'", adj: "25'", rear: "20'" }, height: "1–2 stories", landscape: "10%", parking: "1/300 SF ofc + 1/1000 SF wh", signage: "Monument 100 SF / 8 ft. Building 0.9 SF/LF." },
  industrial: { name: "Commercial / light industrial", short: "IND", color: C.gray, light: C.grayLight, lots: "10–12, 18", acres: "6.00", pct: "5.0%", lotCount: 4, uses: ["Light manufacturing & assembly", "Warehousing & logistics", "Automotive service (enclosed)", "Distribution centers"], materials: { good: ["Tilt-up w/ architectural treatment", "Reveals, form liners, integral color", "Insulated metal panel secondary", "Glass/masonry at entries"], bad: ["Blank gray tilt-up on streets", "Corrugated metal siding", "Vinyl/aluminum siding", "Unfinished CMU visible"] }, setbacks: { front: "30'", side: "20'", adj: "30'", rear: "25'" }, height: "1–2 stories", landscape: "10%", parking: "1 sp/1,000 SF", signage: "Monument 80 SF / 8 ft / 15 ft setback." }
};

const infraData = {
  timeline: [
    { phase: "Design teams engaged", period: "May – Sep 2026", status: "active" },
    { phase: "METRO clearing / grubbing", period: "Oct – Nov 2026", status: "upcoming" },
    { phase: "Building permits", period: "Oct 2026 – Mar 2027", status: "upcoming" },
    { phase: "Mass grading", period: "Feb – Aug 2027", status: "upcoming" },
    { phase: "Water / sewer / storm", period: "May – Oct 2027", status: "upcoming" },
    { phase: "Paving", period: "Sep – Nov 2027", status: "upcoming" },
    { phase: "Certificate of occupancy", period: "Dec 2027", status: "upcoming" }
  ],
  costs: [
    { item: "Water distribution", cost: "$1.99M" },
    { item: "Sanitary sewer", cost: "$3.43M" },
    { item: "Storm sewer", cost: "$12.53M" },
    { item: "Roadway", cost: "$5.10M" },
    { item: "Erosion control", cost: "$0.26M" }
  ],
  specs: [
    { label: "Collector roads", value: "12m ROW" },
    { label: "Secondary streets", value: "8m ROW" },
    { label: "Street trees", value: "1 per 40 LF" },
    { label: "Sidewalks", value: "2m width" },
    { label: "Parking bays", value: "Per COH code" },
    { label: "Storm detention", value: "24.27 ac" }
  ]
};

const contacts = [
  { name: "City of Houston — Planning & Development", hours: "Mon–Fri 8 AM–5 PM", phone: "832-393-6600", email: "planningdepartment@houstontx.gov", address: "611 Walker St, 6th Floor, Houston TX 77002", category: "planning" },
  { name: "Houston Permitting Center", hours: "Mon–Fri 8 AM–5 PM", phone: "832-394-9000", email: "houston.permittingcenter@houstontx.gov", address: "1002 Washington Ave, Houston TX 77002", category: "permitting" },
  { name: "Site Plan Review (Planner of the Day)", hours: "Mon–Fri 8 AM–5 PM", phone: "832-394-8849", email: "planningdepartment@houstontx.gov", address: "1002 Washington Ave, Houston TX 77002", category: "planning" },
  { name: "Development Services (Planner of the Day)", hours: "Mon–Fri 8 AM–5 PM", phone: "832-393-6624", email: "planningdepartment@houstontx.gov", address: "611 Walker St, Houston TX 77002", category: "planning" },
  { name: "TCEQ Region 12 — Houston Office", hours: "Mon–Fri 8 AM–5 PM", phone: "713-767-3500", email: "—", address: "5425 Polk St, Suite H, Houston TX 77023", category: "environmental" },
  { name: "Harris County Flood Control District", hours: "Mon–Fri 8 AM–5 PM", phone: "713-684-4000", email: "info@hcfcd.org", address: "9900 Northwest Fwy, Houston TX 77092", category: "infrastructure" },
  { name: "CenterPoint Energy — New Service", hours: "Mon–Fri 7 AM–7 PM", phone: "713-207-2222", email: "—", address: "Service territory: Houston metro", category: "infrastructure" },
  { name: "MUD 584 — Allen Boone Humphries Robinson", hours: "Mon–Fri 8 AM–5 PM", phone: "713-860-6400", email: "—", address: "3200 Southwest Fwy, Suite 2600, Houston TX 77027", category: "infrastructure" }
];

const envItems = [
  { label: "MSW permit", status: "Revocation on track Q3 2027", impact: "No impact on development", color: C.teal },
  { label: "Municipal setting designation", status: "TCEQ & City approved", impact: "Groundwater restriction only", color: C.teal },
  { label: "Geotechnical", status: "Goodheart engaged", impact: "Suitable for all planned uses", color: C.teal },
  { label: "MUD 584", status: "TCEQ approved May 2026", impact: "Full site history known", color: C.teal },
  { label: "Post-closure care", status: "Secured by letter of credit", impact: "Transferable at closing", color: C.amber },
  { label: "TPDES permit", status: "Public meeting scheduled", impact: "Procedural — on track", color: C.teal }
];

function Badge({ color, children }) {
  return <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: 600, background: color + "18", color, letterSpacing: "0.3px" }}>{children}</span>;
}

function Card({ children, style, onClick }) {
  return <div onClick={onClick} style={{ background: C.white, borderRadius: "10px", padding: "18px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", cursor: onClick ? "pointer" : "default", transition: "box-shadow 0.15s", ...style }}>{children}</div>;
}

function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <h2 style={{ fontSize: "18px", fontWeight: 700, color: C.navy, margin: 0 }}>{children}</h2>
      {sub && <p style={{ fontSize: "13px", color: C.textSec, margin: "4px 0 0" }}>{sub}</p>}
    </div>
  );
}

function MetricCard({ label, value, sub, color, onClick }) {
  return (
    <Card onClick={onClick} style={{ borderTop: `3px solid ${color}`, minWidth: 0 }}>
      <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", color, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: "24px", fontWeight: 700, color: C.navy, marginTop: "4px" }}>{value}</div>
      {sub && <div style={{ fontSize: "11px", color: C.textSec, marginTop: "2px" }}>{sub}</div>}
    </Card>
  );
}

function MaterialList({ items, type }) {
  const good = type === "encouraged";
  return (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: good ? C.teal : C.red, marginBottom: "4px" }}>{type}</div>
      {items.map((it, i) => <div key={i} style={{ fontSize: "12px", color: C.text, padding: "3px 0 3px 12px", borderLeft: `2px solid ${good ? C.teal : C.red}30`, marginBottom: "1px" }}>{it}</div>)}
    </div>
  );
}

function ContactCard({ contact }) {
  const catColors = { planning: C.blue, permitting: C.amber, environmental: C.teal, infrastructure: C.navy };
  const cc = catColors[contact.category] || C.gray;
  return (
    <Card style={{ borderLeft: `3px solid ${cc}` }}>
      <div style={{ fontSize: "14px", fontWeight: 600, color: C.navy }}>{contact.name}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "3px", marginTop: "8px" }}>
        <div style={{ fontSize: "12px", color: C.textSec }}>📅 {contact.hours}</div>
        <div style={{ fontSize: "12px", color: C.textSec }}>📞 {contact.phone}</div>
        {contact.email !== "—" && <div style={{ fontSize: "12px", color: C.textSec }}>✉ {contact.email}</div>}
        <div style={{ fontSize: "12px", color: C.textSec }}>📍 {contact.address}</div>
      </div>
      <Badge color={cc}>{contact.category}</Badge>
    </Card>
  );
}

function Panel({ title, onClose, color, children }) {
  return (
    <div style={{ position: "fixed", top: 0, right: 0, width: "min(420px, 100vw)", height: "100vh", background: C.white, borderLeft: `3px solid ${color || C.teal}`, boxShadow: "-4px 0 24px rgba(0,0,0,0.12)", zIndex: 1000, overflowY: "auto" }}>
      <div style={{ position: "sticky", top: 0, background: C.white, borderBottom: `1px solid ${C.border}`, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 2 }}>
        <span style={{ fontSize: "15px", fontWeight: 600, color: C.navy }}>{title}</span>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: C.textSec, padding: "4px 8px" }}>✕</button>
      </div>
      <div style={{ padding: "18px" }}>{children}</div>
    </div>
  );
}

function DistrictPanel({ dk, onClose }) {
  const d = districts[dk];
  return (
    <Panel title={d.name} onClose={onClose} color={d.color}>
      <div style={{ display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
        <Badge color={d.color}>{d.acres} ac</Badge>
        <Badge color={C.navy}>{d.lotCount} lots</Badge>
        <Badge color={C.textSec}>Lots {d.lots}</Badge>
      </div>
      <div style={{ fontSize: "13px", fontWeight: 600, color: C.navy, marginTop: "16px" }}>Permitted uses</div>
      {d.uses.map((u, i) => <div key={i} style={{ fontSize: "12px", color: C.text, padding: "3px 0 3px 12px", borderLeft: `2px solid ${d.color}40` }}>{u}</div>)}
      <div style={{ fontSize: "13px", fontWeight: 600, color: C.navy, marginTop: "16px" }}>Exterior materials</div>
      <MaterialList items={d.materials.good} type="encouraged" />
      <MaterialList items={d.materials.bad} type="prohibited" />
      <div style={{ fontSize: "13px", fontWeight: 600, color: C.navy, marginTop: "16px" }}>Setbacks</div>
      {[["Front", d.setbacks.front], ["Side", d.setbacks.side], ["Adjacent to MF", d.setbacks.adj], ["Rear", d.setbacks.rear]].map(([l, v], i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${C.border}30`, fontSize: "12px" }}>
          <span style={{ color: C.textSec }}>{l}</span><span style={{ fontWeight: 500, color: C.text }}>{v}</span>
        </div>
      ))}
      {[["Height", d.height], ["Landscape min", d.landscape], ["Parking", d.parking], ["Signage", d.signage]].map(([l, v], i) => (
        <div key={i} style={{ marginTop: i === 0 ? "16px" : "8px" }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: C.navy }}>{l}</div>
          <div style={{ fontSize: "12px", color: C.text, marginTop: "2px" }}>{v}</div>
        </div>
      ))}
      <div style={{ marginTop: "18px", padding: "10px 14px", background: d.light, borderRadius: "6px", fontSize: "11px", color: C.textSec, lineHeight: 1.5 }}>
        ARC approval required prior to building permit. Full Development Standards document available for download in the Documents tab.
      </div>
    </Panel>
  );
}

function LotBlock({ x, y, w, h, lot, acres, dk, onClick }) {
  const d = districts[dk];
  const sm = w < 48 || h < 36;
  return (
    <g onClick={() => onClick(dk)} style={{ cursor: "pointer" }}>
      <rect x={x} y={y} width={w} height={h} rx={3} fill={d.light} stroke={d.color} strokeWidth={1} opacity={0.9}/>
      <text x={x+w/2} y={sm ? y+h/2+1 : y+h/2-3} textAnchor="middle" dominantBaseline="central" style={{ fontSize: sm ? "9px" : "11px", fontWeight: 600, fill: d.color }}>{lot}</text>
      {!sm && acres && <text x={x+w/2} y={y+h/2+10} textAnchor="middle" dominantBaseline="central" style={{ fontSize: "8px", fill: C.textSec }}>{acres}</text>}
    </g>
  );
}

function MasterPlanTab({ onDistrictClick }) {
  return (
    <>
      <SectionTitle sub="136 acres · 30 lots · 4 use districts · MUD 584 approved">Combined masterplan</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px", marginBottom: "20px" }}>
        {Object.entries(districts).map(([k, d]) => (
          <MetricCard key={k} label={d.short + " — " + d.name.split("/")[0].trim()} value={d.acres + " ac"} sub={d.lotCount + " lots · " + d.pct} color={d.color} onClick={() => onDistrictClick(k)} />
        ))}
      </div>
      <Card>
        <div style={{ fontSize: "13px", fontWeight: 600, color: C.navy, marginBottom: "8px" }}>Interactive 3D site model — drag to rotate · click any building for investment detail</div>
        <Suspense fallback={<div style={{ height: 560, display: "flex", alignItems: "center", justifyContent: "center", color: C.textSec, fontSize: 12 }}>Loading 3D model…</div>}>
          <ITPH3DSiteModel />
        </Suspense>
      </Card>

      <Card style={{ marginTop: "16px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: C.navy, marginBottom: "12px", letterSpacing: 0.4 }}>Artist's Renderings</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {[
            "Aerial Perspective — full site development concept",
            "Streetscape — internal road with mixed-use buildings",
            "Bissonnet Entrance — monument and first buildings",
            "Soccer Park & Clubhouse — 5-acre community amenity",
          ].map((cap, i) => (
            <div key={i} style={{
              height: 200, background: "#F1EFE8", borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.06)", padding: 16, textAlign: "center",
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.textSec, lineHeight: 1.5 }}>
                <div style={{ fontSize: 10, letterSpacing: 1.2, color: C.navy, opacity: 0.5, marginBottom: 6 }}>RENDERING {i + 1}</div>
                {cap}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "16px" }}>
        <Card style={{ borderTop: `3px solid ${C.teal}` }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: C.navy }}>Symbol legend</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "10px" }}>
            {Object.entries(districts).map(([k,d]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: d.color, opacity: 0.7 }}/>
                <div><div style={{ fontSize: "11px", fontWeight: 600, color: C.text }}>{d.short}</div><div style={{ fontSize: "9px", color: C.textSec }}>{d.acres} ac · {d.lotCount} lots</div></div>
              </div>
            ))}
            {[["💧","Water feature","Detention/retention"],["🏐","Pickleball park","Recreation amenity"],["📐","Survey parcels","Reference boundary"]].map(([icon,label,sub],i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "12px" }}>{icon}</span>
                <div><div style={{ fontSize: "11px", fontWeight: 600, color: C.text }}>{label}</div><div style={{ fontSize: "9px", color: C.textSec }}>{sub}</div></div>
              </div>
            ))}
          </div>
        </Card>
        <Card style={{ borderTop: `3px solid ${C.navy}` }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: C.navy }}>Infrastructure & specifications</div>
          <div style={{ marginTop: "10px" }}>
            {[["Collector roads","12m ROW"],["Secondary streets","8m ROW"],["Street trees","1 per 40 LF spacing"],["Sidewalks","2m width"],["Storm detention","24.27 ac total"],["MUD bond principal","$23.4M at 8%"]].map(([l,v],i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${C.border}20`, fontSize: "11px" }}>
                <span style={{ color: C.textSec }}>{l}</span><span style={{ fontWeight: 500, color: C.text }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "10px", fontSize: "10px", color: C.textSec }}>Total project cost: $24.99M (v13 model). Metro Structures managing all construction.</div>
        </Card>
      </div>

      {/* Artist's Renderings */}
      <div style={{ marginTop: "24px" }}>
        <SectionTitle sub="Photorealistic architectural visualizations of the completed development">Artist's renderings</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {[
            { src: "/renderings/01-aerial-perspective.jpg", title: "Rendering 1", sub: "Aerial Perspective — full site development concept" },
            { src: "/renderings/02-streetscape.jpg", title: "Rendering 2", sub: "Streetscape — internal road with mixed-use buildings" },
            { src: "/renderings/03-bissonnet-entrance.jpg", title: "Rendering 3", sub: "Bissonnet Entrance — monument and first buildings" },
            { src: "/renderings/04-soccer-park-clubhouse.jpg", title: "Rendering 4", sub: "Soccer Park & Clubhouse — 5-acre community amenity" },
          ].map((r, i) => (
            <Card key={i} style={{ padding: 0, overflow: "hidden" }}>
              <img src={r.src} alt={r.sub} style={{ width: "100%", height: "auto", display: "block" }} />
              <div style={{ padding: "12px 14px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: C.navy }}>{r.title}</div>
                <div style={{ fontSize: "11px", color: C.textSec, marginTop: "2px" }}>{r.sub}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}

function DistrictsTab({ onDistrictClick }) {
  return (
    <>
      <SectionTitle sub="Click any district for full design standards, materials, setbacks, and requirements">Use districts — product metrics</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {Object.entries(districts).map(([k, d]) => (
          <Card key={k} onClick={() => onDistrictClick(k)} style={{ borderLeft: `4px solid ${d.color}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: C.navy }}>{d.name}</div>
                <div style={{ fontSize: "11px", color: C.textSec, marginTop: "2px" }}>Lots {d.lots}</div>
              </div>
              <Badge color={d.color}>{d.short}</Badge>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginTop: "12px" }}>
              {[["Acres", d.acres],[d.lotCount + " lots", d.pct],["Height", d.height]].map(([v, s], i) => (
                <div key={i}><div style={{ fontSize: "16px", fontWeight: 700, color: d.color }}>{v}</div><div style={{ fontSize: "9px", color: C.textSec }}>{s}</div></div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", marginTop: "10px" }}>
              {[["Landscape", d.landscape],["Parking", d.parking],["Front setback", d.setbacks.front],["Adj to MF", d.setbacks.adj]].map(([l,v],i) => (
                <div key={i} style={{ fontSize: "10px" }}><span style={{ color: C.textSec }}>{l}: </span><span style={{ fontWeight: 500, color: C.text }}>{v}</span></div>
              ))}
            </div>
            <div style={{ marginTop: "10px", fontSize: "11px", color: d.color, fontWeight: 600 }}>View full standards →</div>
          </Card>
        ))}
      </div>
    </>
  );
}

function InfraTab() {
  return (
    <>
      <SectionTitle sub="$24.99M total project cost · MUD 584 TCEQ-approved · Metro Structures managing construction">Infrastructure & timeline</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <Card style={{ borderTop: `3px solid ${C.navy}` }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: C.navy, marginBottom: "12px" }}>Construction schedule</div>
          {infraData.timeline.map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: t.status === "active" ? C.teal : C.border, flexShrink: 0 }}/>
              <div style={{ flex: 1 }}><div style={{ fontSize: "12px", fontWeight: 500, color: C.text }}>{t.phase}</div><div style={{ fontSize: "11px", color: C.textSec }}>{t.period}</div></div>
              {t.status === "active" && <Badge color={C.teal}>Active</Badge>}
            </div>
          ))}
        </Card>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Card style={{ borderTop: `3px solid ${C.teal}` }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: C.navy, marginBottom: "10px" }}>Infrastructure costs</div>
            {infraData.costs.map((c, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${C.border}30`, fontSize: "12px" }}>
                <span style={{ color: C.textSec }}>{c.item}</span><span style={{ fontWeight: 500, color: C.text }}>{c.cost}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0 0", fontSize: "12px", fontWeight: 700 }}>
              <span style={{ color: C.navy }}>Total hard costs</span><span style={{ color: C.navy }}>$23.59M</span>
            </div>
          </Card>
          <Card style={{ borderTop: `3px solid ${C.amber}` }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: C.navy, marginBottom: "8px" }}>MUD 584 bond structure</div>
            {[["Bond principal", "$23.4M"],["Rate", "8%"],["Reimbursement potential", "Up to $35M"],["Payout schedule", "50% month 24 / 50% month 36"]].map(([l,v],i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${C.border}30`, fontSize: "12px" }}>
                <span style={{ color: C.textSec }}>{l}</span><span style={{ fontWeight: 500, color: C.text }}>{v}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
      <Card style={{ marginTop: "12px", borderTop: `3px solid ${C.teal}` }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: C.navy, marginBottom: "10px" }}>Environmental status</div>
        <div style={{ padding: "10px 14px", background: C.tealLight, borderLeft: `3px solid ${C.teal}`, borderRadius: "0 6px 6px 0", fontSize: "12px", color: C.navy, lineHeight: 1.5, marginBottom: "12px", fontWeight: 500 }}>
          The site's environmental history is a managed, documented, and nearly resolved regulatory condition. The MSW permit holder is the project principal. TCEQ approved MUD 584 with full knowledge of the site history.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
          {envItems.map((e, i) => (
            <div key={i} style={{ padding: "10px", background: i % 2 === 0 ? C.bg : C.white, borderRadius: "6px", borderLeft: `2px solid ${e.color}` }}>
              <div style={{ fontSize: "11px", fontWeight: 600, color: C.navy }}>{e.label}</div>
              <div style={{ fontSize: "10px", color: C.teal, marginTop: "2px" }}>{e.status}</div>
              <div style={{ fontSize: "10px", color: C.textSec, marginTop: "1px" }}>{e.impact}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "12px", fontSize: "11px", color: C.textSec }}>Full Environmental Status Summary (4 pages) available for download in the Documents tab.</div>
      </Card>
    </>
  );
}

function PermittingTab() {
  const steps = [
    { step: "1", title: "Pre-application conference with ARC", desc: "Discuss proposed use, building program, and design approach before formal submission.", status: "Recommended" },
    { step: "2", title: "Plan submission to ARC", desc: "Complete architectural, site, landscape, and signage plans demonstrating compliance with Development Standards and CC&Rs.", status: "Required" },
    { step: "3", title: "ARC approval", desc: "Written approval, conditional approval with modifications, or denial with stated reasons.", status: "Required" },
    { step: "4", title: "TCEQ authorization (if soil disturbance)", desc: "Form TCEQ-20787 — Authorization to Disturb Final Cover. Required before any excavation or trenching.", status: "Required" },
    { step: "5", title: "City of Houston building permit", desc: "Submit to Houston Permitting Center at 1002 Washington Ave. ARC approval is a prerequisite.", status: "Required" },
    { step: "6", title: "Construction & inspections", desc: "Comply with City codes, MUD 584 requirements, and ARC-approved plans. Metro Structures available for design-build.", status: "Ongoing" },
    { step: "7", title: "Certificate of occupancy", desc: "Required before any commercial building or lease space may be occupied.", status: "Required" }
  ];
  return (
    <>
      <SectionTitle sub="ARC approval required before City permit submission · Houston has no traditional zoning">Permitting workflow</SectionTitle>
      <Card>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: "14px", padding: "12px 0", borderBottom: i < steps.length - 1 ? `1px solid ${C.border}30` : "none" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: s.status === "Recommended" ? C.amberLight : s.status === "Ongoing" ? C.tealLight : C.blueLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: s.status === "Recommended" ? C.amber : s.status === "Ongoing" ? C.teal : C.blue, flexShrink: 0 }}>{s.step}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: C.navy }}>{s.title}</div>
              <div style={{ fontSize: "12px", color: C.textSec, marginTop: "2px", lineHeight: 1.4 }}>{s.desc}</div>
            </div>
            <Badge color={s.status === "Recommended" ? C.amber : s.status === "Ongoing" ? C.teal : C.blue}>{s.status}</Badge>
          </div>
        ))}
      </Card>
    </>
  );
}

function ContactsTab() {
  return (
    <>
      <SectionTitle sub="Planning, permitting, environmental, and infrastructure contacts for the Houston / Harris County area">Community planning offices & resources</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {contacts.map((c, i) => <ContactCard key={i} contact={c} />)}
      </div>
      <Card style={{ marginTop: "16px", borderTop: `3px solid ${C.navy}` }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: C.navy, marginBottom: "8px" }}>Project team</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {[
            { name: "Mark D. Lester", role: "Principal Developer / CEO — LANDCO NEXA", phone: "650-638-0900", email: "mlester@landconexa.com" },
            { name: "David Van Waldick", role: "CFO — Nexa Advisory Services", phone: "760-672-0145", email: "dave@wrfco.com" },
            { name: "Kimley-Horn", role: "Civil Engineering", phone: "—", email: "—" },
            { name: "Goodheart Engineering", role: "Road & Geotechnical", phone: "—", email: "—" },
            { name: "Metro Structures", role: "Construction Management", phone: "—", email: "—" },
            { name: "SKA Environmental", role: "Environmental / TCEQ", phone: "—", email: "—" }
          ].map((t, i) => (
            <div key={i} style={{ padding: "8px 10px", background: i % 2 === 0 ? C.bg : C.white, borderRadius: "6px" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: C.navy }}>{t.name}</div>
              <div style={{ fontSize: "11px", color: C.textSec }}>{t.role}</div>
              {t.phone !== "—" && <div style={{ fontSize: "11px", color: C.textSec }}>📞 {t.phone}</div>}
              {t.email !== "—" && <div style={{ fontSize: "11px", color: C.textSec }}>✉ {t.email}</div>}
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

function DocumentsTab() {
  const docs = [
    { name: "Development Standards v1.0", desc: "12-section design standards document covering all districts — materials, setbacks, signage, screening, landscape, parking.", pages: "13 pages", type: "PDF", color: C.navy, href: DEV_STANDARDS_PDF },
    { name: "Environmental Status Summary", desc: "MSW permit, MSD, geotechnical suitability, regulatory framework, and buyer takeaways.", pages: "4 pages", type: "PDF", color: C.teal, href: ENV_SUMMARY_PDF },
    { name: "CC&Rs — Full with Exhibits", desc: "Declaration of Covenants, Conditions, Restrictions and Easements including Signage Matrix (Exhibit B).", pages: "16 pages", type: "PDF", color: C.amber, href: CCRS_PDF },
    { name: "Site Plan (PNG)", desc: "Full-resolution aerial site plan with lot overlay, color-coded by use type.", pages: "Image", type: "PNG", color: C.green, href: SITE_PLAN_PNG },
    { name: "ITPH v.13 Financial Model", desc: "Project economics, capital stack, cash flows, and MUD reimbursement projections.", pages: "Spreadsheet", type: "XLSX", color: C.blue, href: FINANCIAL_MODEL_XLSX },
    { name: "Equity Investment Presentation", desc: "Investor-facing presentation covering project overview, economics, and development timeline.", pages: "Deck", type: "PDF", color: C.red, href: EQUITY_PRESENTATION_PDF }
  ];
  return (
    <>
      <SectionTitle sub="All project documents available in the data vault for qualified prospects">Project documents — data vault</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {docs.map((d, i) => {
          const Wrap = d.href ? "a" : "div";
          const wrapProps = d.href ? { href: d.href, target: "_blank", rel: "noopener noreferrer", style: { textDecoration: "none" } } : {};
          return (
            <Wrap key={i} {...wrapProps}>
              <Card style={{ borderLeft: `3px solid ${d.color}`, cursor: d.href ? "pointer" : "default" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: C.navy }}>{d.name}</div>
                  <Badge color={d.color}>{d.type}</Badge>
                </div>
                <div style={{ fontSize: "12px", color: C.textSec, marginTop: "6px", lineHeight: 1.4 }}>{d.desc}</div>
                <div style={{ fontSize: "11px", color: C.textSec, marginTop: "6px" }}>{d.pages}</div>
                <div style={{ fontSize: "11px", color: d.color, fontWeight: 600, marginTop: "8px" }}>{d.href ? "View / Download →" : "In data vault →"}</div>
              </Card>
            </Wrap>
          );
        })}
      </div>
    </>
  );
}

export default function App() {
  const [tab, setTab] = useState(0);
  const [panel, setPanel] = useState(null);
  const [panelDk, setPanelDk] = useState(null);

  const openDistrict = useCallback((dk) => { setPanelDk(dk); setPanel("district"); }, []);
  const closePanel = useCallback(() => { setPanel(null); setPanelDk(null); }, []);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: C.bg, minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />

      {/* Main-site nav strip (mirrors ITPHoustonCapitalPlan tabs) */}
      <div style={{ background: `linear-gradient(135deg,${MAIN_NAVY} 0%,${MAIN_TEAL} 100%)`, padding: "10px 28px 0", display: "flex", flexWrap: "wrap", gap: 3, alignItems: "center", fontFamily: "Calibri,-apple-system,sans-serif" }}>
        {MAIN_TABS.map((t, i) => (
          <a key={t} href={`/dashboard?tab=${i}`} style={{
            padding: "9px 16px", borderRadius: "8px 8px 0 0", fontSize: 12, fontWeight: 600, letterSpacing: 0.3,
            background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", textDecoration: "none", whiteSpace: "nowrap"
          }}>{t}</a>
        ))}
        <a href="/design-standards" style={{
          padding: "9px 16px", borderRadius: "8px 8px 0 0", fontSize: 12, fontWeight: 700, letterSpacing: 0.3,
          background: "white", color: MAIN_NAVY, textDecoration: "none", whiteSpace: "nowrap"
        }}>Design Standards</a>
      </div>

      {/* Header */}
      <div style={{ background: C.navy, padding: "24px 28px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
          <div>
            <div style={{ fontSize: "10px", letterSpacing: "2px", color: C.teal, textTransform: "uppercase", marginBottom: "4px" }}>Keystone™ · Design planning</div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: C.white, margin: 0, fontFamily: "'Playfair Display', serif" }}>International Trade Park Houston</h1>
            <div style={{ fontSize: "12px", color: "#9c9a92", marginTop: "4px" }}>Mixed-use master-planned development · 136 acres · 30 lots</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "10px", color: "#9c9a92" }}>Last update: May 2026</div>
            <div style={{ fontSize: "10px", color: "#9c9a92" }}>12000 Bissonnet St, Houston TX</div>
          </div>
        </div>
      </div>

      {/* Sub-tabs (Design Standards sections) */}
      <div style={{ display: "flex", alignItems: "center", gap: "2px", padding: "0 28px", background: C.white, borderBottom: `1px solid ${C.border}`, overflowX: "auto" }}>
        {tabs.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{
            padding: "10px 16px", fontSize: "12px", fontWeight: tab === i ? 600 : 400,
            color: tab === i ? C.teal : C.textSec,
            background: "transparent", border: "none", borderBottom: tab === i ? `2px solid ${C.teal}` : "2px solid transparent",
            cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif"
          }}>{t}</button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px", padding: "6px 0" }}>
          <a href={DEV_STANDARDS_PDF} target="_blank" rel="noopener noreferrer" style={{
            background: C.navy, color: C.white, padding: "6px 14px", borderRadius: "6px",
            fontSize: "12px", fontWeight: 700, textDecoration: "none", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap"
          }}>📄 Master Design Document</a>
          <a href={ENV_SUMMARY_PDF} target="_blank" rel="noopener noreferrer" style={{
            background: C.teal, color: C.white, padding: "6px 14px", borderRadius: "6px",
            fontSize: "12px", fontWeight: 700, textDecoration: "none", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap"
          }}>🌱 Environmental Status</a>
        </div>

      </div>


      {/* Content */}
      <div style={{ padding: "20px 28px" }}>
        {tab === 0 && <MasterPlanTab onDistrictClick={openDistrict} />}
        {tab === 1 && <DistrictsTab onDistrictClick={openDistrict} />}
        {tab === 2 && <InfraTab />}
        {tab === 3 && <PermittingTab />}
        {tab === 4 && <ContactsTab />}
        {tab === 5 && <DocumentsTab />}
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "16px 28px 20px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ fontSize: "10px", color: C.textSec }}>Keystone™ 2026 · Confidential</div>
        <div style={{ fontSize: "9px", color: C.textSec, opacity: 0.5, marginTop: "3px" }}>International Trade Park Houston · 12000 Bissonnet Street, Houston TX 77099</div>
      </div>

      {/* Panel */}
      {panel === "district" && panelDk && <DistrictPanel dk={panelDk} onClose={closePanel} />}
    </div>
  );
}
