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
    title: "ITPH, Houston TX JV Report",
    supplement: 8,
    month: "May",
    year: 2026,
    badge: "Final v3",
    driveId: "1ANBHkESoQZZe9NFOJVnY92N9BnBYmTuP",
    htmlFile: "/assets/jv-report-may-2026.html",
    subtitle: "Sequential Monthly Supplements · May 2026 — Final v3",
  },
];
