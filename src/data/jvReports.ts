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
    id: "supp-8-may-2026",
    title: "ITP Houston JV Report",
    supplement: 8,
    month: "May",
    year: 2026,
    badge: "DRAFT",
    driveId: "1aOPaPpN-4sjWtWcndmWs0ZLtTwTCwFI9",
    htmlFile: "/assets/jv-report-apr-2026.html",
    subtitle: "Sequential Monthly Supplements · May 2026 active",
  },
];
