// MUD Analysis download utilities — generates professional PDF & DOCX
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, WidthType, ShadingType, BorderStyle, HeadingLevel, PageBreak,
  Header, Footer, PageNumber,
} from "docx";
import { saveAs } from "file-saver";

const NAVY = "#1B2A4A";
const GOLD = "#C9A84C";
const CREAM = "#F5F0E8";

const fmtMoney = (n) => {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return "$" + Math.round(n).toLocaleString();
};
const fmtCompactM = (n) => `$${(n / 1_000_000).toFixed(2)}M`;

const USE_TYPES = [
  { key: "Multifamily", label: "Multifamily", acres: 36.62, revenue: true, lotMatch: ["Multifamily"] },
  { key: "Retail", label: "Retail", acres: 23.48, revenue: true, lotMatch: ["Retail"] },
  { key: "Flex", label: "Flex", acres: 21.55, revenue: true, lotMatch: ["Flex"] },
  { key: "Industrial", label: "Commercial / Light Industrial", acres: 6.0, revenue: true, lotMatch: ["Industrial"] },
  { key: "Detention", label: "Detention Ponds / Channels", acres: 24.27, revenue: false },
  { key: "ROW", label: "Major Right-of-Ways", acres: 9.21, revenue: false },
];

function buildCompositionRows(lots) {
  const totalAcres = USE_TYPES.reduce((s, u) => s + u.acres, 0);
  const valueByType = {};
  lots.forEach((lot) => {
    const sf = lot.acres * 43560;
    const gross = lot.grossValue ?? sf * lot.asking;
    valueByType[lot.type] = (valueByType[lot.type] || 0) + gross;
  });
  const totalValue = Object.values(valueByType).reduce((s, v) => s + v, 0);
  const rows = USE_TYPES.map((u) => {
    const productValue = u.revenue
      ? (u.lotMatch || []).reduce((s, t) => s + (valueByType[t] || 0), 0)
      : null;
    return {
      label: u.label,
      acres: u.acres,
      acresPct: (u.acres / totalAcres) * 100,
      productValue,
      marketPct: productValue !== null && totalValue > 0 ? (productValue / totalValue) * 100 : null,
    };
  });
  return { rows, totalAcres, totalValue };
}

const NOTES = [
  {
    title: "Note 1 — What is a MUD?",
    body: "A Municipal Utility District (MUD) is a political subdivision of the State of Texas that provides water, sewage, drainage, and other infrastructure services. MUD 584 was created to finance the horizontal infrastructure for International Trade Park Houston. The district issues bonds to reimburse the developer for eligible infrastructure costs after construction is complete.",
  },
  {
    title: "Note 2 — How Reimbursement Works",
    body: "MUD bonds reimburse infrastructure costs based on each lot's share of eligible acreage within the district. The total MUD principal of $23.40M is allocated across eligible acres. Each lot's MUD share is calculated as: (Lot Eligible Acres / Total Eligible Acres) × Total MUD Principal. The first payout of 50% occurs at Month 24. The final payout of the remaining 50% occurs at Month 36.",
  },
  {
    title: "Note 3 — MUD Bond Rate",
    body: "MUD bonds carry an 8.0% interest rate. This rate is set by the bond market at the time of issuance and reflects the credit quality of the district, the tax base, and prevailing interest rates.",
  },
  {
    title: "Note 4 — Reimbursement Potential: Up to $35M",
    body: "The current MUD reimbursement estimate of $23.40M is conservative. The cost of land being used for the retention basin is not yet included in the reimbursement calculation. Applying the standard MUD underwriting benchmark of 8–10% of real estate valuations to anticipated building values on the site supports reimbursement as high as $35 million. This gap continues to narrow as additional eligible items are negotiated.",
  },
  {
    title: "Note 5 — MUD Status: Cleared",
    body: "The PCS contested case against MUD 584 was dismissed on November 6, 2025. Harris County withdrew its protest, and the State Office of Administrative Hearings (SOAH) dismissed the matter (Docket No. 582-25-23304). MUD 584 is now clear to proceed to final TCEQ approval with no remaining opposition.",
  },
  {
    title: "Note 6 — Lincoln Ave Capital MUD Contribution",
    body: "Lincoln Avenue Capital is already contributing its fair share to offset its portion of MUD costs, reducing the net infrastructure burden on the project.",
  },
];

// ---------- PDF ----------
export function downloadMUDPdf({ rows, totals, bondRate, mudReimbursement, lots, project }) {
  const doc = new jsPDF({ unit: "pt", format: "letter", orientation: "landscape" });
  const pageW = doc.internal.pageSize.getWidth();
  const marginX = 36;
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  // Header band
  const drawHeader = () => {
    doc.setFillColor(27, 42, 74);
    doc.rect(0, 0, pageW, 56, "F");
    doc.setTextColor(201, 168, 76);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("MUD 584 — Bond Reimbursement Analysis", marginX, 24);
    doc.setTextColor(240, 235, 220);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("International Trade Park Houston  ·  12000 Bissonnet Street  ·  Houston, TX 77099", marginX, 40);
    doc.setFontSize(8);
    doc.text(today, pageW - marginX, 40, { align: "right" });
  };

  const drawFooter = (pageNum, pageTotal) => {
    const h = doc.internal.pageSize.getHeight();
    doc.setDrawColor(224, 228, 232);
    doc.line(marginX, h - 32, pageW - marginX, h - 32);
    doc.setFontSize(8);
    doc.setTextColor(122, 139, 154);
    doc.setFont("helvetica", "normal");
    doc.text("PLUSAdvantage™ 2026 — CONFIDENTIAL  |  MUD 584 Bond Reimbursement Analysis", marginX, h - 18);
    doc.text(`Page ${pageNum} of ${pageTotal}`, pageW - marginX, h - 18, { align: "right" });
  };

  // ===== Page 1 =====
  drawHeader();
  let y = 78;

  // KPI grid
  const kpis = [
    { label: "Total MUD Principal", value: fmtCompactM(mudReimbursement), sub: `@ ${bondRate.toFixed(1)}% bond rate` },
    { label: "MUD Bond Rate", value: `${bondRate.toFixed(1)}%`, sub: "adjustable 8.0–10.0%" },
    { label: "First Payout", value: `Month ${project.mudFirstPayoutMonth}`, sub: "50% of MUD share" },
    { label: "Final Payout", value: `Month ${project.mudFinalPayoutMonth}`, sub: "remaining 50%" },
    { label: "Payout Window", value: `${project.mudFinalPayoutMonth - project.mudFirstPayoutMonth} months`, sub: `Month ${project.mudFirstPayoutMonth}–${project.mudFinalPayoutMonth}` },
  ];
  const kpiW = (pageW - marginX * 2 - 12) / kpis.length;
  kpis.forEach((k, i) => {
    const x = marginX + i * (kpiW + 3);
    doc.setFillColor(247, 247, 247);
    doc.setDrawColor(230, 230, 230);
    doc.roundedRect(x, y, kpiW, 60, 4, 4, "FD");
    doc.setFontSize(7.5);
    doc.setTextColor(122, 139, 154);
    doc.setFont("helvetica", "bold");
    doc.text(k.label.toUpperCase(), x + 10, y + 15);
    doc.setFontSize(15);
    doc.setTextColor(27, 42, 74);
    doc.setFont("times", "bold");
    doc.text(k.value, x + 10, y + 36);
    doc.setFontSize(7.5);
    doc.setTextColor(122, 139, 154);
    doc.setFont("helvetica", "normal");
    doc.text(k.sub, x + 10, y + 50);
  });
  y += 72;

  // Allocation table
  autoTable(doc, {
    startY: y,
    head: [[
      "Lot #", "Use Type", "Acres", "Eligible Acres", "MUD Share %",
      "Total MUD Allocation", "First Payout (Mo 24)", "Final Payout (Mo 36)", "Sale Month", "MUD Status",
    ]],
    body: rows.map((r) => [
      r.id, r.type, r.acres.toFixed(2), r.eligibleAcres.toFixed(2),
      r.mudSharePct.toFixed(2) + "%",
      fmtMoney(r.mudTotal), fmtMoney(r.mudFirst), fmtMoney(r.mudFinal),
      r.saleMonth, r.status,
    ]),
    foot: [[
      "TOTAL", "30 Lots", totals.acres.toFixed(2), totals.eligibleAcres.toFixed(2), "100.00%",
      fmtMoney(totals.mudTotal), fmtMoney(totals.mudFirst), fmtMoney(totals.mudFinal), "", "",
    ]],
    styles: { fontSize: 8, cellPadding: 4, textColor: [27, 42, 74], lineColor: [230, 230, 230] },
    headStyles: { fillColor: [27, 42, 74], textColor: [201, 168, 76], fontStyle: "bold", fontSize: 7.5, halign: "center" },
    footStyles: { fillColor: [245, 240, 232], textColor: [27, 42, 74], fontStyle: "bold" },
    columnStyles: {
      0: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" }, 4: { halign: "right" },
      5: { halign: "right" }, 6: { halign: "right" }, 7: { halign: "right" }, 8: { halign: "right" },
    },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    margin: { left: marginX, right: marginX },
    theme: "grid",
  });

  // ===== Page 2 =====
  doc.addPage();
  drawHeader();
  y = 78;

  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.setTextColor(27, 42, 74);
  doc.text("Site Composition — Acreage vs. Market Value", marginX, y);
  y += 12;

  const { rows: compRows, totalAcres, totalValue } = buildCompositionRows(lots);
  autoTable(doc, {
    startY: y + 6,
    head: [["Use Type", "Acres", "% of Acres", "Est. Product Value", "% of Market Value"]],
    body: compRows.map((r) => [
      r.label,
      r.acres.toFixed(2),
      r.acresPct.toFixed(1) + "%",
      r.productValue === null ? "—" : fmtMoney(r.productValue),
      r.marketPct === null ? "—" : r.marketPct.toFixed(1) + "%",
    ]),
    foot: [[
      "TOTAL", totalAcres.toFixed(2), "100.0%", fmtMoney(totalValue), "100.0%",
    ]],
    styles: { fontSize: 9, cellPadding: 5, textColor: [27, 42, 74], lineColor: [230, 230, 230] },
    headStyles: { fillColor: [27, 42, 74], textColor: [201, 168, 76], fontStyle: "bold", fontSize: 8.5 },
    footStyles: { fillColor: [245, 240, 232], textColor: [27, 42, 74], fontStyle: "bold" },
    columnStyles: {
      1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" }, 4: { halign: "right" },
    },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    margin: { left: marginX, right: marginX },
    theme: "grid",
  });

  y = doc.lastAutoTable.finalY + 20;

  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.setTextColor(27, 42, 74);
  doc.text("How MUD Reimbursement Works", marginX, y);
  y += 14;

  const pageH = doc.internal.pageSize.getHeight();
  const usableW = pageW - marginX * 2;
  NOTES.forEach((note) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    const titleLines = doc.splitTextToSize(note.title, usableW - 16);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    const bodyLines = doc.splitTextToSize(note.body, usableW - 16);
    const blockH = 10 + titleLines.length * 11 + bodyLines.length * 10 + 8;

    if (y + blockH > pageH - 50) {
      doc.addPage();
      drawHeader();
      y = 78;
    }

    doc.setFillColor(245, 240, 232);
    doc.rect(marginX, y, usableW, blockH, "F");
    doc.setFillColor(201, 168, 76);
    doc.rect(marginX, y, 3, blockH, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(27, 42, 74);
    doc.text(titleLines, marginX + 12, y + 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(58, 74, 90);
    doc.text(bodyLines, marginX + 12, y + 14 + titleLines.length * 11);

    y += blockH + 8;
  });

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(i, totalPages);
  }

  doc.save("MUD-584-Bond-Reimbursement-Analysis.pdf");
}

// ---------- DOCX ----------
const NAVY_HEX = "1B2A4A";
const GOLD_HEX = "C9A84C";
const CREAM_HEX = "F5F0E8";
const GRAY_HEX = "E6E6E6";

const border1 = { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" };
const cellBorders = { top: border1, bottom: border1, left: border1, right: border1 };

function tc(text, opts = {}) {
  const {
    bold = false, color = NAVY_HEX, fill, align = AlignmentType.LEFT,
    width, size = 18, italics = false,
  } = opts;
  return new TableCell({
    borders: cellBorders,
    width: width ? { size: width, type: WidthType.DXA } : undefined,
    shading: fill ? { fill, type: ShadingType.CLEAR, color: "auto" } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({
      alignment: align,
      children: [new TextRun({ text: String(text), bold, color, size, italics, font: "Calibri" })],
    })],
  });
}

function headerCell(text, width, align = AlignmentType.LEFT) {
  return tc(text, { bold: true, color: GOLD_HEX, fill: NAVY_HEX, width, align, size: 16 });
}

function paragraph(text, opts = {}) {
  const { bold = false, size = 22, color = NAVY_HEX, spacing = { after: 120 }, align = AlignmentType.LEFT } = opts;
  return new Paragraph({
    alignment: align,
    spacing,
    children: [new TextRun({ text, bold, size, color, font: "Calibri" })],
  });
}

function heading(text, level = 1) {
  return new Paragraph({
    heading: level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 160 },
    children: [new TextRun({ text, bold: true, color: NAVY_HEX, size: level === 1 ? 32 : 26, font: "Georgia" })],
  });
}

function noteBlock(title, body) {
  return new Table({
    width: { size: 14400, type: WidthType.DXA },
    columnWidths: [180, 14220],
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    },
    rows: [new TableRow({
      children: [
        new TableCell({
          width: { size: 180, type: WidthType.DXA },
          shading: { fill: GOLD_HEX, type: ShadingType.CLEAR, color: "auto" },
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
          children: [new Paragraph({ children: [new TextRun({ text: "" })] })],
        }),
        new TableCell({
          width: { size: 14220, type: WidthType.DXA },
          shading: { fill: CREAM_HEX, type: ShadingType.CLEAR, color: "auto" },
          margins: { top: 140, bottom: 140, left: 200, right: 200 },
          children: [
            new Paragraph({
              spacing: { after: 80 },
              children: [new TextRun({ text: title, bold: true, color: NAVY_HEX, size: 20, font: "Calibri" })],
            }),
            new Paragraph({
              children: [new TextRun({ text: body, color: "3A4A5A", size: 20, font: "Calibri" })],
            }),
          ],
        }),
      ],
    })],
  });
}

export async function downloadMUDDocx({ rows, totals, bondRate, mudReimbursement, lots, project }) {
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  // Allocation table (landscape content width ~14400 DXA)
  const totalW = 14400;
  const cols = [700, 1300, 800, 1100, 1100, 1500, 1500, 1500, 900, 4000];
  // sum = 14400
  const allocHeader = new TableRow({
    tableHeader: true,
    children: [
      headerCell("Lot #", cols[0], AlignmentType.RIGHT),
      headerCell("Use Type", cols[1]),
      headerCell("Acres", cols[2], AlignmentType.RIGHT),
      headerCell("Eligible Acres", cols[3], AlignmentType.RIGHT),
      headerCell("MUD Share %", cols[4], AlignmentType.RIGHT),
      headerCell("Total MUD Allocation", cols[5], AlignmentType.RIGHT),
      headerCell("First Payout (Mo 24)", cols[6], AlignmentType.RIGHT),
      headerCell("Final Payout (Mo 36)", cols[7], AlignmentType.RIGHT),
      headerCell("Sale Month", cols[8], AlignmentType.RIGHT),
      headerCell("MUD Status", cols[9]),
    ],
  });

  const allocRows = rows.map((r, i) => new TableRow({
    children: [
      tc(r.id, { width: cols[0], align: AlignmentType.RIGHT, fill: i % 2 ? "FAFAFA" : "FFFFFF" }),
      tc(r.type, { width: cols[1], fill: i % 2 ? "FAFAFA" : "FFFFFF" }),
      tc(r.acres.toFixed(2), { width: cols[2], align: AlignmentType.RIGHT, fill: i % 2 ? "FAFAFA" : "FFFFFF" }),
      tc(r.eligibleAcres.toFixed(2), { width: cols[3], align: AlignmentType.RIGHT, fill: i % 2 ? "FAFAFA" : "FFFFFF" }),
      tc(r.mudSharePct.toFixed(2) + "%", { width: cols[4], align: AlignmentType.RIGHT, fill: i % 2 ? "FAFAFA" : "FFFFFF" }),
      tc(fmtMoney(r.mudTotal), { width: cols[5], align: AlignmentType.RIGHT, fill: i % 2 ? "FAFAFA" : "FFFFFF" }),
      tc(fmtMoney(r.mudFirst), { width: cols[6], align: AlignmentType.RIGHT, fill: i % 2 ? "FAFAFA" : "FFFFFF" }),
      tc(fmtMoney(r.mudFinal), { width: cols[7], align: AlignmentType.RIGHT, fill: i % 2 ? "FAFAFA" : "FFFFFF" }),
      tc(r.saleMonth, { width: cols[8], align: AlignmentType.RIGHT, fill: i % 2 ? "FAFAFA" : "FFFFFF" }),
      tc(r.status, { width: cols[9], fill: i % 2 ? "FAFAFA" : "FFFFFF" }),
    ],
  }));

  const allocFooter = new TableRow({
    children: [
      tc("TOTAL", { width: cols[0], bold: true, fill: CREAM_HEX, align: AlignmentType.RIGHT }),
      tc("30 Lots", { width: cols[1], bold: true, fill: CREAM_HEX }),
      tc(totals.acres.toFixed(2), { width: cols[2], bold: true, fill: CREAM_HEX, align: AlignmentType.RIGHT }),
      tc(totals.eligibleAcres.toFixed(2), { width: cols[3], bold: true, fill: CREAM_HEX, align: AlignmentType.RIGHT }),
      tc("100.00%", { width: cols[4], bold: true, fill: CREAM_HEX, align: AlignmentType.RIGHT }),
      tc(fmtMoney(totals.mudTotal), { width: cols[5], bold: true, fill: CREAM_HEX, align: AlignmentType.RIGHT }),
      tc(fmtMoney(totals.mudFirst), { width: cols[6], bold: true, fill: CREAM_HEX, align: AlignmentType.RIGHT }),
      tc(fmtMoney(totals.mudFinal), { width: cols[7], bold: true, fill: CREAM_HEX, align: AlignmentType.RIGHT }),
      tc("", { width: cols[8], fill: CREAM_HEX }),
      tc("", { width: cols[9], fill: CREAM_HEX }),
    ],
  });

  const allocTable = new Table({
    width: { size: totalW, type: WidthType.DXA },
    columnWidths: cols,
    rows: [allocHeader, ...allocRows, allocFooter],
  });

  // KPI table (5 columns)
  const kpis = [
    ["Total MUD Principal", fmtCompactM(mudReimbursement), `@ ${bondRate.toFixed(1)}% bond rate`],
    ["MUD Bond Rate", `${bondRate.toFixed(1)}%`, "adjustable 8.0–10.0%"],
    ["First Payout", `Month ${project.mudFirstPayoutMonth}`, "50% of MUD share"],
    ["Final Payout", `Month ${project.mudFinalPayoutMonth}`, "remaining 50%"],
    ["Payout Window", `${project.mudFinalPayoutMonth - project.mudFirstPayoutMonth} months`, `Month ${project.mudFirstPayoutMonth}–${project.mudFinalPayoutMonth}`],
  ];
  const kpiColW = Math.floor(totalW / 5);
  const kpiCols = [kpiColW, kpiColW, kpiColW, kpiColW, totalW - kpiColW * 4];
  const kpiTable = new Table({
    width: { size: totalW, type: WidthType.DXA },
    columnWidths: kpiCols,
    rows: [
      new TableRow({
        children: kpis.map((k, i) => tc(k[0].toUpperCase(), {
          width: kpiCols[i], bold: true, color: "7A8B9A", fill: "F7F7F7", size: 14,
        })),
      }),
      new TableRow({
        children: kpis.map((k, i) => tc(k[1], {
          width: kpiCols[i], bold: true, color: NAVY_HEX, fill: "F7F7F7", size: 28,
        })),
      }),
      new TableRow({
        children: kpis.map((k, i) => tc(k[2], {
          width: kpiCols[i], color: "7A8B9A", fill: "F7F7F7", size: 14,
        })),
      }),
    ],
  });

  // Composition table
  const { rows: compRows, totalAcres, totalValue } = buildCompositionRows(lots);
  const compCols = [4400, 2000, 2000, 3000, 3000];
  const compHeader = new TableRow({
    tableHeader: true,
    children: [
      headerCell("Use Type", compCols[0]),
      headerCell("Acres", compCols[1], AlignmentType.RIGHT),
      headerCell("% of Acres", compCols[2], AlignmentType.RIGHT),
      headerCell("Est. Product Value", compCols[3], AlignmentType.RIGHT),
      headerCell("% of Market Value", compCols[4], AlignmentType.RIGHT),
    ],
  });
  const compBody = compRows.map((r, i) => new TableRow({
    children: [
      tc(r.label, { width: compCols[0], fill: i % 2 ? "FAFAFA" : "FFFFFF" }),
      tc(r.acres.toFixed(2), { width: compCols[1], align: AlignmentType.RIGHT, fill: i % 2 ? "FAFAFA" : "FFFFFF" }),
      tc(r.acresPct.toFixed(1) + "%", { width: compCols[2], align: AlignmentType.RIGHT, fill: i % 2 ? "FAFAFA" : "FFFFFF" }),
      tc(r.productValue === null ? "—" : fmtMoney(r.productValue), { width: compCols[3], align: AlignmentType.RIGHT, fill: i % 2 ? "FAFAFA" : "FFFFFF" }),
      tc(r.marketPct === null ? "—" : r.marketPct.toFixed(1) + "%", { width: compCols[4], align: AlignmentType.RIGHT, fill: i % 2 ? "FAFAFA" : "FFFFFF" }),
    ],
  }));
  const compFooter = new TableRow({
    children: [
      tc("TOTAL", { width: compCols[0], bold: true, fill: CREAM_HEX }),
      tc(totalAcres.toFixed(2), { width: compCols[1], bold: true, fill: CREAM_HEX, align: AlignmentType.RIGHT }),
      tc("100.0%", { width: compCols[2], bold: true, fill: CREAM_HEX, align: AlignmentType.RIGHT }),
      tc(fmtMoney(totalValue), { width: compCols[3], bold: true, fill: CREAM_HEX, align: AlignmentType.RIGHT }),
      tc("100.0%", { width: compCols[4], bold: true, fill: CREAM_HEX, align: AlignmentType.RIGHT }),
    ],
  });
  const compTable = new Table({
    width: { size: totalW, type: WidthType.DXA },
    columnWidths: compCols,
    rows: [compHeader, ...compBody, compFooter],
  });

  const doc = new Document({
    creator: "ITP Houston",
    title: "MUD 584 Bond Reimbursement Analysis",
    styles: {
      default: { document: { run: { font: "Calibri", size: 22 } } },
    },
    sections: [{
      properties: {
        page: {
          size: {
            width: 15840, height: 12240,
            orientation: "landscape",
          },
          margin: { top: 720, right: 720, bottom: 720, left: 720 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: "MUD 584 — Bond Reimbursement Analysis", bold: true, color: NAVY_HEX, size: 22, font: "Georgia" }),
              new TextRun({ text: "   |   International Trade Park Houston", color: "7A8B9A", size: 18, font: "Calibri" }),
            ],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "PLUSAdvantage™ 2026 — CONFIDENTIAL   |   Page ", color: "7A8B9A", size: 16, font: "Calibri" }),
              new TextRun({ children: [PageNumber.CURRENT], color: "7A8B9A", size: 16, font: "Calibri" }),
              new TextRun({ text: " of ", color: "7A8B9A", size: 16, font: "Calibri" }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], color: "7A8B9A", size: 16, font: "Calibri" }),
            ],
          })],
        }),
      },
      children: [
        heading("MUD 584 — Bond Reimbursement Analysis", 1),
        paragraph(`International Trade Park Houston  ·  12000 Bissonnet Street  ·  Houston, TX 77099  ·  ${today}`, { color: "5A6B7A", size: 20 }),
        paragraph(" "),
        kpiTable ? kpiTable : paragraph(""),
        paragraph(" "),
        heading("Per-Lot MUD Allocation Schedule", 2),
        allocTable,

        // Page break to page 2
        new Paragraph({ children: [new PageBreak()] }),

        heading("Site Composition — Acreage vs. Market Value", 2),
        compTable,
        paragraph(" "),

        heading("How MUD Reimbursement Works", 2),
        ...NOTES.flatMap((n) => [noteBlock(n.title, n.body), paragraph(" ")]),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, "MUD-584-Bond-Reimbursement-Analysis.docx");
}
