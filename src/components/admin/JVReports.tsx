import React, { useState } from "react";
import { ExternalLink, Download, FileText } from "lucide-react";

const NAVY = "#1B2A4A";
const GOLD = "#C9A84C";
const CREAM = "#F5F0E8";

interface Report {
  id: string;
  title: string;
  date: string;
  supplement: string;
  badge?: string;
  driveFileId: string;
}

const REPORTS: Report[] = [
  {
    id: "apr-2026",
    title: "ITP Houston JV Report",
    date: "April 2026",
    supplement: "Supplement 7",
    badge: "NEW",
    driveFileId: "1aOPaPpN-4sjWtWcndmWs0ZLtTwTCwFI9",
  },
];

export default function JVReports() {
  const [selectedId, setSelectedId] = useState(REPORTS[0].id);
  const selected = REPORTS.find((r) => r.id === selectedId) || REPORTS[0];

  const previewUrl = `https://drive.google.com/file/d/${selected.driveFileId}/preview`;
  const viewUrl = `https://drive.google.com/file/d/${selected.driveFileId}/view`;
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${selected.driveFileId}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div
        style={{
          background: NAVY,
          padding: "20px 28px",
          borderBottom: `3px solid ${GOLD}`,
        }}
      >
        <h1
          style={{
            color: "white",
            fontSize: 22,
            fontWeight: 700,
            margin: 0,
            letterSpacing: 0.5,
          }}
        >
          📋 JV Reports
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: 12,
            margin: "4px 0 0",
            letterSpacing: 0.3,
          }}
        >
          Joint Venture Partner Reports · ITP Houston Capital Plan
        </p>
      </div>

      {/* Split pane */}
      <div
        style={{
          display: "flex",
          flex: 1,
          minHeight: 0,
        }}
        className="jv-reports-pane"
      >
        {/* Left panel — report index */}
        <div
          style={{
            width: "30%",
            minWidth: 220,
            maxWidth: 340,
            borderRight: "1px solid #E0E4E8",
            overflowY: "auto",
            padding: 12,
            background: "#FAFBFC",
          }}
          className="jv-reports-left"
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#7A8B9A",
              letterSpacing: 1.5,
              textTransform: "uppercase",
              padding: "8px 8px 12px",
            }}
          >
            Reports
          </div>
          {REPORTS.map((r) => {
            const isActive = r.id === selectedId;
            return (
              <button
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "14px 14px",
                  border: "none",
                  borderLeft: isActive ? `4px solid ${NAVY}` : "4px solid transparent",
                  borderRadius: 8,
                  background: isActive ? CREAM : "white",
                  marginBottom: 6,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = "#F7F9FB";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = "white";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <FileText size={14} color={NAVY} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{r.title}</span>
                  {r.badge && (
                    <span
                      style={{
                        background: GOLD,
                        color: NAVY,
                        fontSize: 9,
                        fontWeight: 800,
                        padding: "2px 8px",
                        borderRadius: 10,
                        letterSpacing: 0.5,
                      }}
                    >
                      {r.badge}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: "#7A8B9A", fontWeight: 500 }}>
                  {r.date} · {r.supplement}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right panel — report viewer */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
          className="jv-reports-right"
        >
          {/* Action bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 20px",
              borderBottom: "1px solid #E0E4E8",
              background: "white",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: NAVY, flex: 1 }}>
              {selected.title} — {selected.date}
            </span>
            <a
              href={viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: NAVY,
                color: "white",
                padding: "7px 14px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <ExternalLink size={13} /> Open Full Screen
            </a>
            <a
              href={downloadUrl}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: GOLD,
                color: NAVY,
                padding: "7px 14px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              <Download size={13} /> Download
            </a>
          </div>

          {/* Iframe */}
          <div style={{ flex: 1, padding: 12, background: "#F0F2F5", minHeight: 500 }}>
            <iframe
              src={previewUrl}
              width="100%"
              height="100%"
              style={{
                border: "none",
                borderRadius: 8,
                minHeight: 500,
              }}
              allow="autoplay"
              title={`${selected.title} - ${selected.date}`}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "10px 20px",
          textAlign: "center",
          fontSize: 10,
          fontWeight: 700,
          color: "#7A8B9A",
          letterSpacing: 1,
          borderTop: "1px solid #E0E4E8",
          background: "white",
        }}
      >
        PLUSAdvantage™ 2026 — CONFIDENTIAL
      </div>

      <style>{`
        @media (max-width: 767px) {
          .jv-reports-pane { flex-direction: column !important; }
          .jv-reports-left { width: 100% !important; max-width: none !important; border-right: none !important; border-bottom: 1px solid #E0E4E8; max-height: 200px; }
          .jv-reports-right { min-height: 500px; }
        }
      `}</style>
    </div>
  );
}
