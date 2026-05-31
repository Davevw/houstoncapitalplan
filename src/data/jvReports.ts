export interface JVReport {
  id: string;
  title: string;
  supplement: number;
  month: string;
  year: number;
  badge?: string;
  driveId: string;
  htmlFile: string;
  subtitle?: string;
}

export const jvReports: JVReport[] = [
  {
    id: "apr-2026",
    title: "ITPH, Houston TX — Monthly Report",
    supplement: 0,
    month: "April",
    year: 2026,
    driveId: "",
    htmlFile: "/assets/jv-report-apr-2026.html",
    subtitle: "April 2026 Monthly Project Report",
  },
  {
    id: "may-2026",
    title: "ITPH, Houston TX — Monthly Report",
    supplement: 8,
    month: "May",
    year: 2026,
    badge: "Final v3",
    driveId: "1ANBHkESoQZZe9NFOJVnY92N9BnBYmTuP",
    htmlFile: "/assets/jv-report-may-2026.html",
    subtitle: "May 2026 — JV Development Status",
  },
  {
    id: "jun-2026",
    title: "ITPH, Houston TX — Monthly Report",
    supplement: 9,
    month: "June",
    year: 2026,
    badge: "Current",
    driveId: "",
    htmlFile: "/assets/jv-report-jun-2026.html",
    subtitle: "June 2026 Monthly Project Report",
  },
];
