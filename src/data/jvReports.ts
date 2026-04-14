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
    id: "supp-7-apr-2026",
    title: "ITP Houston JV Report",
    supplement: 7,
    month: "April",
    year: 2026,
    badge: "NEW",
    driveId: "1aOPaPpN-4sjWtWcndmWs0ZLtTwTCwFI9",
    htmlFile: "/assets/jv-report-apr-2026.html",
    subtitle: "Supplement 7 · $25.8M Pipeline · Kirkwood Crossings",
  },
];
