import React, { useState, useEffect, useRef } from "react";
import { Download, FileText } from "lucide-react";
import { jvReports } from "@/data/jvReports";

const NAVY = "#1B2A4A";
const GOLD = "#C9A84C";

export default function JVReports() {
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string>(jvReports[jvReports.length - 1].id);
  const selected = jvReports.find((r) => r.id === selectedId) ?? jvReports[jvReports.length - 1];
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    fetch(selected.htmlFile)
      .then((res) => res.text())
      .then(setHtmlContent)
      .catch(() => setHtmlContent("<p>Failed to load report.</p>"));
  }, [selected.htmlFile]);

  const handleDownloadHtml = () => {
    if (!htmlContent) return;
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ITP_Houston_JV_Report_${selected.month}_${selected.year}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = () => {
    if (!htmlContent) return;
    const printWindow = window.open("", "_blank", "width=900,height=1000");
    if (!printWindow) {
      alert("Please allow popups to download the PDF.");
      return;
    }
    const docTitle = `ITP_Houston_JV_Report_${selected.month}_${selected.year}`;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.document.title = docTitle;
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 300);
    };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ background: NAVY, padding: "20px 28px", borderBottom: `3px solid ${GOLD}` }}>
        <h1 style={{ color: "white", fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: 0.5 }}>
          📋 JV Reports
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, margin: "4px 0 0", letterSpacing: 0.3 }}>
          {selected.subtitle || `Joint Venture Partner Reports · ITP Houston Capital Plan`}
        </p>
      </div>

      {jvReports.length > 1 && (
        <div style={{ display: "flex", gap: 4, padding: "10px 20px", background: "#F5F0E8", borderBottom: `1px solid #E0D8C5`, overflowX: "auto" }}>
          {jvReports.map((r) => {
            const isActive = r.id === selectedId;
            return (
              <button
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                style={{
                  padding: "7px 14px",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0.4,
                  borderRadius: 6,
                  cursor: "pointer",
                  border: isActive ? `1px solid ${NAVY}` : "1px solid transparent",
                  background: isActive ? NAVY : "rgba(27,42,74,0.06)",
                  color: isActive ? GOLD : NAVY,
                  whiteSpace: "nowrap",
                }}
              >
                {r.month} {r.year}
              </button>
            );
          })}
        </div>
      )}

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", borderBottom: "1px solid #E0E4E8", background: "white" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: NAVY, flex: 1 }}>
              {selected.title} — Supplement {selected.supplement} · {selected.month} {selected.year}
            </span>
            <button
              onClick={handleDownloadPdf}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "white", color: NAVY, padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, border: `1px solid ${NAVY}`, cursor: "pointer" }}>
              <FileText size={13} /> Download {selected.month} PDF
            </button>
            <button
              onClick={handleDownloadHtml}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, background: GOLD, color: NAVY, padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer" }}>
              <Download size={13} /> Download HTML
            </button>
          </div>

          <div style={{ flex: 1, background: "#F0F2F5", minHeight: 500 }}>
            <iframe
              srcDoc={htmlContent}
              title={`${selected.title} — ${selected.month} ${selected.year}`}
              sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
              style={{ width: "100%", height: "100%", border: "none", background: "#f4f4f4" }}
            />
          </div>
        </div>
      </div>

      <div style={{ padding: "10px 20px", textAlign: "center", fontSize: 10, fontWeight: 700, color: "#7A8B9A", letterSpacing: 1, borderTop: "1px solid #E0E4E8", background: "white" }}>
        PLUSAdvantage™ 2026 — CONFIDENTIAL
      </div>
    </div>
  );
}
