/**
 * The working life, shared by the CV page and the index.
 *
 * Dates are months so tenure can be computed rather than restated — the
 * open-ended role stays correct without anyone remembering to edit it.
 */
export interface Role {
  title: string;
  dates: string;
}

export interface Employer {
  company: string;
  formerly?: string;
  location?: string;
  /** YYYY-MM. */
  start: string;
  /** YYYY-MM. Omitted while the role is current. */
  end?: string;
  roles: Role[];
}

export const EXPERIENCE: readonly Employer[] = [
  {
    company: "Lyntris",
    formerly: "Hypergiant, then Accelint",
    location: "Portland, OR · Remote",
    start: "2024-03",
    roles: [
      { title: "Staff Software Engineer", dates: "Jun 2026 —" },
      { title: "Lead Frontend Developer", dates: "May 2025 – Jun 2026" },
      { title: "Senior Frontend Developer", dates: "Mar 2024 – May 2025" },
    ],
  },
  {
    company: "EMERGE",
    formerly: "a digital product agency",
    location: "Portland, OR · Hybrid",
    start: "2023-05",
    end: "2024-03",
    roles: [{ title: "Staff Software Engineer", dates: "May 2023 – Mar 2024" }],
  },
  {
    company: "Brex",
    start: "2021-03",
    end: "2023-05",
    roles: [{ title: "Senior Software Engineer", dates: "Mar 2021 – May 2023" }],
  },
  {
    company: "New Relic",
    location: "Portland, OR Metro",
    start: "2019-04",
    end: "2021-02",
    roles: [{ title: "Senior Software Engineer", dates: "Apr 2019 – Feb 2021" }],
  },
] as const;

export const EDUCATION = {
  school: "Carleton College",
  degree: "Bachelor's degree",
  location: "Northfield, MN",
  dates: "1991 – 1995",
} as const;

export function months({ start, end }: Employer): number {
  const from = new Date(`${start}-01`);
  const to = end ? new Date(`${end}-01`) : new Date();
  return (
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth())
  );
}

/** "2 yr 5 mo" — the dates give the range, this gives the weight. */
export function duration(employer: Employer): string {
  const total = months(employer);
  const years = Math.floor(total / 12);
  const rest = total % 12;
  return [years && `${years} yr`, rest && `${rest} mo`]
    .filter(Boolean)
    .join(" ");
}

/** Span across every role at one employer, for a one-line index entry. */
export function span(employer: Employer): string {
  const year = (value: string) => value.slice(0, 4);
  return employer.end
    ? `${year(employer.start)} – ${year(employer.end)}`
    : `${year(employer.start)} —`;
}
