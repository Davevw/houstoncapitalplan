import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import siteMapImg from "@/assets/itph-site-map.png";
import DesignRequestComposer from "./DesignRequestComposer";

const NAVY = "#0B3D5C";
const TEAL = "#0B4C72";
const STEEL = "#E0E4E8";

// Parcel coordinates (matches SitePlanTab) — used to color lots per scenario
const PARCEL_COORDS = {
  1:{cx:43,cy:18,acres:3.88},  2:{cx:53,cy:35,acres:1.37},  3:{cx:53,cy:39,acres:1.20},
  4:{cx:53,cy:43,acres:1.20},  5:{cx:47,cy:30,acres:6.38},  6:{cx:46,cy:41,acres:4.88},
  7:{cx:42,cy:36,acres:3.28},  8:{cx:53,cy:50,acres:1.26},  9:{cx:47,cy:50,acres:3.13},
  10:{cx:43,cy:60,acres:2.44}, 11:{cx:44,cy:67,acres:1.78}, 12:{cx:45,cy:72,acres:1.78},
  13:{cx:38,cy:27,acres:11.77},14:{cx:22,cy:32,acres:13.20},15:{cx:22,cy:60,acres:11.16},
  16:{cx:35,cy:53,acres:12.26},17:{cx:16,cy:49,acres:1.20}, 18:{cx:19,cy:47,acres:1.18},
  19:{cx:50,cy:60,acres:1.96}, 20:{cx:53,cy:32,acres:1.38}, 21:{cx:53,cy:28,acres:1.14},
  22:{cx:53,cy:25,acres:1.16}, 23:{cx:52,cy:17,acres:2.03}, 24:{cx:16,cy:44,acres:1.21},
  25:{cx:16,cy:41,acres:1.38}, 26:{cx:16,cy:35,acres:1.21}, 27:{cx:16,cy:29,acres:1.03},
  28:{cx:16,cy:27,acres:1.03}, 29:{cx:16,cy:24,acres:1.04}, 30:{cx:39,cy:85,acres:1.50},
};

// Position classification (corner / interior / frontage) per lot
const LOT_POSITION = {
  1:"Corner", 2:"Frontage", 3:"Frontage", 4:"Frontage", 5:"Interior", 6:"Interior",
  7:"Interior", 8:"Frontage", 9:"Interior", 10:"Interior", 11:"Interior", 12:"Corner",
  13:"Interior", 14:"Corner", 15:"Corner", 16:"Interior", 17:"Frontage", 18:"Frontage",
  19:"Interior", 20:"Frontage", 21:"Frontage", 22:"Frontage", 23:"Corner", 24:"Frontage",
  25:"Frontage", 26:"Frontage", 27:"Frontage", 28:"Frontage", 29:"Frontage", 30:"Frontage",
};

// Permitted uses (from Development Standards v1) by district key
const PERMITTED_USES = {
  retail: ["Retail shops", "Restaurants & cafés", "Banks", "Medical / dental office", "Personal services", "Pad-site QSR"],
  multifamily: ["Garden apartments", "Mid-rise multifamily", "Townhomes", "Build-to-rent communities", "Resident amenities"],
  flex: ["Flex office-warehouse", "Light assembly", "Showroom/warehouse", "Professional office", "Last-mile distribution"],
  industrial: ["Light industrial", "Service-commercial", "Contractor yards", "Outdoor storage (screened)", "Maker / fabrication"],
  common: ["Detention ponds", "Open space", "Internal roads", "Utilities & infrastructure", "Public realm"],
};

function SectionTitle({ children, icon }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, marginTop: 16, paddingBottom: 10, borderBottom: `2px solid ${STEEL}` }}>
      {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: NAVY, fontFamily: "Georgia,serif", letterSpacing: 0.5 }}>{children}</h2>
    </div>
  );
}

function DistrictBar({ summary }) {
  const entries = Object.entries(summary || {});
  const total = entries.reduce((s, [, v]) => s + (Number(v.percentage) || 0), 0) || 100;
  return (
    <div style={{ display: "flex", width: "100%", height: 14, borderRadius: 6, overflow: "hidden", border: `1px solid ${STEEL}` }}>
      {entries.map(([k, v]) => (
        <div key={k}
          title={`${v.label}: ${v.acreage} ac (${v.percentage}%)`}
          style={{ width: `${(Number(v.percentage) || 0) / total * 100}%`, background: v.color }} />
      ))}
    </div>
  );
}

function ScenarioCard({ scenario, onOpen, onDelete }) {
  return (
    <div style={{ position: "relative", background: "white", border: `1px solid ${STEEL}`, borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: 14 }}>
      <button onClick={onDelete} title="Delete concept" style={deleteBtn}>×</button>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, paddingRight: 24 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 20, fontFamily: "Georgia,serif", color: NAVY, fontWeight: 700 }}>{scenario.name}</h3>
          <div style={{ fontSize: 12, color: "#5A6B7A", marginTop: 4 }}>{scenario.tagline}</div>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase",
          padding: "4px 10px", borderRadius: 999,
          background: scenario.status === "published" ? "#E6F4EA" : "#FFF4E0",
          color: scenario.status === "published" ? "#1F7A3A" : "#8A6A1F",
        }}>{scenario.status}</span>
      </div>
      <DistrictBar summary={scenario.district_summary} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, fontSize: 11, color: "#5A6B7A" }}>
        {Object.entries(scenario.district_summary || {}).map(([k, v]) => (
          <div key={k} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: v.color, border: `1px solid ${STEEL}` }} />
            {v.label} · {v.percentage}%
          </div>
        ))}
      </div>
      <button onClick={onOpen}
        style={{ marginTop: "auto", background: NAVY, color: "white", border: "none", padding: "10px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
        Open Concept →
      </button>
    </div>
  );
}

const deleteBtn = {
  position: "absolute", top: 10, right: 10,
  width: 26, height: 26, borderRadius: "50%",
  border: `1px solid ${STEEL}`, background: "white",
  color: "#7A8B9A", fontSize: 16, lineHeight: 1, fontWeight: 600,
  cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center",
  zIndex: 2,
};

function TearSheet({ scenario }) {
  const districts = Object.entries(scenario.district_summary || {});
  const lotsByDistrict = useMemo(() => {
    const out = {};
    Object.entries(scenario.lot_assignments || {}).forEach(([lot, dist]) => {
      if (!out[dist]) out[dist] = [];
      out[dist].push(Number(lot));
    });
    Object.keys(out).forEach(k => out[k].sort((a, b) => a - b));
    return out;
  }, [scenario]);

  return (
    <div id="tear-sheet" style={{ background: "white", padding: 36, border: `1px solid ${STEEL}`, borderRadius: 12 }}>
      <div style={{ position: "relative", marginBottom: 18, borderRadius: 10, overflow: "hidden", border: `1px solid ${STEEL}`, background: "#0e1e2c" }}>
        <img src={siteMapImg} alt={`${scenario.name} aerial rendering`} style={{ width: "100%", display: "block" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "18px 22px", background: "linear-gradient(to top, rgba(11,61,92,0.92), rgba(11,61,92,0))", color: "white" }}>
          <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", opacity: 0.85, fontWeight: 700 }}>ITPH Design Concept</div>
          <h1 style={{ margin: "2px 0 4px", fontSize: 28, fontFamily: "Georgia,serif" }}>{scenario.name}</h1>
          <div style={{ fontSize: 13, fontStyle: "italic", opacity: 0.92 }}>{scenario.tagline}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 24, marginBottom: 20, fontSize: 13, color: NAVY, fontWeight: 600 }}>
        <div><strong style={{ fontSize: 20, fontFamily: "Georgia,serif" }}>136</strong> Acres</div>
        <div style={{ borderLeft: `1px solid ${STEEL}`, paddingLeft: 24 }}><strong style={{ fontSize: 20, fontFamily: "Georgia,serif" }}>30</strong> Lots</div>
        <div style={{ borderLeft: `1px solid ${STEEL}`, paddingLeft: 24 }}><strong style={{ fontSize: 20, fontFamily: "Georgia,serif" }}>{districts.length}</strong> Districts</div>
      </div>

      <p style={{ fontSize: 13, lineHeight: 1.6, color: "#3A4A5A", marginBottom: 20 }}>{scenario.description}</p>

      <h3 style={{ fontSize: 13, letterSpacing: 1, textTransform: "uppercase", color: "#7A8B9A", margin: "20px 0 10px" }}>District Breakdown</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginBottom: 20 }}>
        <thead>
          <tr style={{ background: "#F7F9FB", color: NAVY }}>
            <th style={thStyle}>District</th>
            <th style={thStyle}>Lots</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Acreage</th>
            <th style={{ ...thStyle, textAlign: "right" }}>% of Site</th>
            <th style={thStyle}>Color</th>
          </tr>
        </thead>
        <tbody>
          {districts.map(([key, d]) => (
            <tr key={key} style={{ borderBottom: `1px solid ${STEEL}` }}>
              <td style={tdStyle}><strong style={{ color: NAVY }}>{d.label}</strong></td>
              <td style={tdStyle}>{(lotsByDistrict[key] || []).join(", ") || "—"}</td>
              <td style={{ ...tdStyle, textAlign: "right" }}>{d.acreage} ac</td>
              <td style={{ ...tdStyle, textAlign: "right" }}>{d.percentage}%</td>
              <td style={tdStyle}>
                <span style={{ display: "inline-block", width: 16, height: 16, borderRadius: 3, background: d.color, border: `1px solid ${STEEL}`, verticalAlign: "middle" }} />
                <span style={{ marginLeft: 8, fontFamily: "monospace", fontSize: 11 }}>{d.color}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginBottom: 16 }}><DistrictBar summary={scenario.district_summary} /></div>

      <h3 style={{ fontSize: 13, letterSpacing: 1, textTransform: "uppercase", color: "#7A8B9A", margin: "20px 0 8px" }}>Target Profile</h3>
      <p style={{ fontSize: 13, lineHeight: 1.6, color: "#3A4A5A", fontStyle: "italic" }}>{scenario.target_profile}</p>

      <div style={{ marginTop: 28, paddingTop: 14, borderTop: `1px solid ${STEEL}`, fontSize: 10, color: "#7A8B9A", textAlign: "center", letterSpacing: 0.5 }}>
        LANDCO NEXA &nbsp;|&nbsp; Bissonnet 136, LLC &nbsp;|&nbsp; Confidential
      </div>
    </div>
  );
}

const thStyle = { textAlign: "left", padding: "10px 12px", fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 700, borderBottom: `2px solid ${STEEL}` };
const tdStyle = { padding: "10px 12px", color: "#3A4A5A" };

function ScenarioMap({ scenario, onSelect, selectedId }) {
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [hoverId, setHoverId] = useState(null);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const summary = scenario.district_summary || {};
  const assignments = scenario.lot_assignments || {};

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.15 : 0.15;
      setZoom(z => Math.max(1, Math.min(4, z + delta)));
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  // Lot radius scales with acreage (sqrt for visual area ~ acres)
  const radiusFor = (acres) => Math.max(1.4, Math.min(4.2, Math.sqrt(acres || 1) * 0.95));

  return (
    <div style={{ background: "white", border: `1px solid ${STEEL}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: `1px solid ${STEEL}`, background: "#F7F9FB" }}>
        <div style={{ fontSize: 11, color: "#7A8B9A", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>
          {scenario.name} — color-coded by district
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={() => setZoom(z => Math.max(1, z - 0.25))} style={zoomBtn}>−</button>
          <div style={{ minWidth: 50, textAlign: "center", padding: "4px 8px", fontSize: 12, fontWeight: 600, color: NAVY }}>{Math.round(zoom * 100)}%</div>
          <button onClick={() => setZoom(z => Math.min(4, z + 0.25))} style={zoomBtn}>+</button>
          <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} style={{ ...zoomBtn, width: "auto", padding: "4px 10px", fontSize: 11 }}>Reset</button>
        </div>
      </div>
      <div
        ref={containerRef}
        onMouseDown={(e) => { if (zoom <= 1) return; setIsPanning(true); panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y }; }}
        onMouseMove={(e) => { if (!isPanning) return; setPan({ x: panStart.current.panX + (e.clientX - panStart.current.x), y: panStart.current.panY + (e.clientY - panStart.current.y) }); }}
        onMouseUp={() => setIsPanning(false)}
        onMouseLeave={() => setIsPanning(false)}
        style={{ position: "relative", overflow: "hidden", cursor: zoom > 1 ? (isPanning ? "grabbing" : "grab") : "default", background: "#F7F9FB", aspectRatio: "1470 / 834" }}
      >
        <div style={{ position: "absolute", inset: 0, transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "center center", transition: isPanning ? "none" : "transform 0.15s ease-out" }}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            {/* Site boundary outline */}
            <rect x="10" y="10" width="50" height="80" fill="white" stroke={STEEL} strokeWidth="0.3" />
            {/* Street labels */}
            <text x="8" y="50" fontSize="1.4" fill="#7A8B9A" transform="rotate(-90 8 50)" textAnchor="middle">Cook Road</text>
            <text x="62" y="50" fontSize="1.4" fill="#7A8B9A" transform="rotate(90 62 50)" textAnchor="middle">S Kirkwood Rd</text>
            <text x="35" y="94" fontSize="1.4" fill="#7A8B9A" textAnchor="middle">Bissonnet Street</text>

            {Object.entries(PARCEL_COORDS).map(([id, p]) => {
              const dist = assignments[id];
              const color = (summary[dist] && summary[dist].color) || "#C8CFD6";
              const isSelected = String(selectedId) === String(id);
              const isHovered = String(hoverId) === String(id);
              const r = radiusFor(p.acres) * (isSelected ? 1.25 : isHovered ? 1.1 : 1);
              return (
                <g key={id} style={{ cursor: "pointer" }}
                  onClick={(e) => { e.stopPropagation(); onSelect(Number(id)); }}
                  onMouseEnter={() => setHoverId(Number(id))}
                  onMouseLeave={() => setHoverId(null)}
                >
                  <circle cx={p.cx} cy={p.cy} r={r} fill={color} stroke={isSelected ? NAVY : "white"} strokeWidth={isSelected ? 0.6 : 0.3} opacity={0.92} />
                  <text x={p.cx} y={p.cy + 0.6} textAnchor="middle" fontSize={Math.max(1.3, r * 0.7)} fill="white" fontWeight="700" style={{ pointerEvents: "none" }}>{id}</text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}

const zoomBtn = { width: 28, height: 28, border: `1px solid ${STEEL}`, background: "white", color: NAVY, cursor: "pointer", borderRadius: 6, fontSize: 16, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" };

function LotPanel({ lotId, scenario, onClose }) {
  if (!lotId) return null;
  const dist = scenario.lot_assignments[String(lotId)];
  const district = scenario.district_summary[dist];
  const coords = PARCEL_COORDS[lotId];
  const permitted = PERMITTED_USES[dist] || [];
  return (
    <div style={{ background: "white", border: `1px solid ${STEEL}`, borderRadius: 12, padding: 18, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#7A8B9A", fontWeight: 700 }}>Lot</div>
          <div style={{ fontSize: 26, fontFamily: "Georgia,serif", color: NAVY, fontWeight: 700 }}>#{lotId}</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#7A8B9A", fontSize: 18, cursor: "pointer" }}>✕</button>
      </div>
      {district && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 999, background: `${district.color}1A`, color: district.color, fontSize: 12, fontWeight: 700, marginTop: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: district.color }} />
          {district.label}
        </div>
      )}
      <div style={{ marginTop: 14, fontSize: 13, color: "#3A4A5A", display: "flex", flexDirection: "column", gap: 6 }}>
        <div><strong style={{ color: NAVY }}>Acreage:</strong> {coords?.acres ?? "—"} ac</div>
        <div><strong style={{ color: NAVY }}>Position:</strong> {LOT_POSITION[lotId] || "—"}</div>
      </div>
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#7A8B9A", fontWeight: 700, marginBottom: 6 }}>Permitted Uses</div>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#3A4A5A", lineHeight: 1.7 }}>
          {permitted.map(u => <li key={u}>{u}</li>)}
        </ul>
        <div style={{ marginTop: 8, fontSize: 10, color: "#8A99A8", fontStyle: "italic" }}>Per Development Standards v1</div>
      </div>
    </div>
  );
}

function ScenarioDetail({ scenario, onBack }) {
  const [selectedLot, setSelectedLot] = useState(null);

  function handlePrint() {
    window.print();
  }

  return (
    <div>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #tear-sheet, #tear-sheet * { visibility: visible !important; }
          #tear-sheet { position: absolute; left: 0; top: 0; width: 100%; border: none !important; padding: 24px !important; }
        }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }} className="no-print">
        <button onClick={onBack} style={{ background: "none", border: `1px solid ${STEEL}`, color: NAVY, padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          ← Back to Concept Library
        </button>
        <button onClick={handlePrint} style={{ background: NAVY, color: "white", border: "none", padding: "10px 18px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          Download Tear Sheet as PDF
        </button>
      </div>

      <TearSheet scenario={scenario} />

      <div style={{ marginTop: 28 }} className="no-print">
        <SectionTitle icon="🗺️">Interactive Site Plan — {scenario.name}</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 320px", gap: 20, alignItems: "start" }}>
          <ScenarioMap scenario={scenario} onSelect={setSelectedLot} selectedId={selectedLot} />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {selectedLot ? (
              <LotPanel lotId={selectedLot} scenario={scenario} onClose={() => setSelectedLot(null)} />
            ) : (
              <div style={{ background: "white", border: `1px dashed ${STEEL}`, borderRadius: 12, padding: 24, textAlign: "center", color: "#7A8B9A", fontSize: 13 }}>
                Click any lot marker on the map to see its district assignment, acreage, and permitted uses.
              </div>
            )}
            <div style={{ background: "white", border: `1px solid ${STEEL}`, borderRadius: 12, padding: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#7A8B9A", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>District Legend</div>
              {Object.entries(scenario.district_summary || {}).map(([k, v]) => (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, padding: "6px 0", color: "#3A4A5A" }}>
                  <span style={{ width: 14, height: 14, borderRadius: 3, background: v.color, border: `1px solid ${STEEL}` }} />
                  <span style={{ flex: 1 }}>{v.label}</span>
                  <span style={{ color: "#7A8B9A" }}>{v.acreage} ac · {v.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProcessingScenarioCard({ request }) {
  return (
    <div style={{
      background: "#FAFBFC",
      border: `1px dashed ${STEEL}`,
      borderRadius: 12,
      padding: 20,
      display: "flex",
      flexDirection: "column",
      gap: 14,
      opacity: 0.85,
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes itph-pulse { 0%,100% { opacity: 0.55; } 50% { opacity: 1; } }
        .itph-processing-dot { animation: itph-pulse 1.6s ease-in-out infinite; }
      `}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 20, fontFamily: "Georgia,serif", color: NAVY, fontWeight: 700 }}>
            {request.concept_name}
          </h3>
          <div style={{ fontSize: 12, color: "#7A8B9A", marginTop: 4 }}>
            {request.target_client_type}
          </div>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase",
          padding: "4px 10px", borderRadius: 999,
          background: "#FFF4E0", color: "#8A6A1F",
          display: "inline-flex", alignItems: "center", gap: 6,
        }}>
          <span className="itph-processing-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#8A6A1F" }} />
          Processing…
        </span>
      </div>
      <div style={{ fontSize: 12, color: "#7A8B9A", lineHeight: 1.55, fontStyle: "italic" }}>
        Generating lot assignments and district composition. The new concept will appear here once the
        planning pipeline completes processing.
      </div>
      <button disabled style={{
        marginTop: "auto",
        background: "#E5E7EB",
        color: "#7A8B9A",
        border: "none",
        padding: "10px 16px",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        cursor: "not-allowed",
      }}>
        Pending Generation
      </button>
    </div>
  );
}

export default function DesignConceptsTab() {
  const [scenarios, setScenarios] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSlug, setOpenSlug] = useState(null);

  async function loadAll() {
    const [scenRes, reqRes] = await Promise.all([
      supabase
        .from("design_scenarios")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: true }),
      supabase
        .from("design_requests")
        .select("*")
        .in("status", ["submitted", "processing"])
        .order("created_at", { ascending: true }),
    ]);
    if (scenRes.error) { setError(scenRes.error.message); setLoading(false); return; }
    if (reqRes.error) { setError(reqRes.error.message); setLoading(false); return; }
    setScenarios(scenRes.data || []);
    setPendingRequests(reqRes.data || []);
    setLoading(false);
  }

  useEffect(() => { loadAll(); }, []);

  const openScenario = openSlug ? scenarios.find(s => s.slug === openSlug) : null;

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#7A8B9A" }}>Loading concepts…</div>;
  if (error) return <div style={{ padding: 40, color: "#B33" }}>Could not load design concepts: {error}</div>;

  if (openScenario) {
    return <ScenarioDetail scenario={openScenario} onBack={() => setOpenSlug(null)} />;
  }

  return (
    <div>
      <DesignRequestComposer onSubmitted={() => loadAll()} />

      <SectionTitle icon="🏗️">Design Concepts — Master Plan Scenario Library</SectionTitle>
      <div style={{ fontSize: 13, color: "#5A6B7A", marginBottom: 24, lineHeight: 1.6, maxWidth: 800 }}>
        Alternative land-use configurations across the 30-lot, 136-acre ITPH site. Each scenario presents a different
        district assignment for brokers, buyers, and internal stakeholders to evaluate.
      </div>
      {scenarios.length === 0 && pendingRequests.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "#7A8B9A", border: `1px dashed ${STEEL}`, borderRadius: 12 }}>
          No concepts published yet.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
          {scenarios.map(s => (
            <ScenarioCard key={s.id} scenario={s} onOpen={() => setOpenSlug(s.slug)} />
          ))}
          {pendingRequests.map((r) => (
            <ProcessingScenarioCard key={r.id} request={r} />
          ))}
        </div>
      )}
    </div>
  );
}
