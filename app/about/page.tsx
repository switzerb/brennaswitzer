import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CV",
  description:
    "Brenna Switzer — staff software engineer in Portland, Oregon. Lyntris, EMERGE, Brex, New Relic.",
};

interface Role {
  title: string;
  dates: string;
}

interface Employer {
  company: string;
  formerly?: string;
  location?: string;
  /** Months, used to draw the tenure rule. Open-ended roles pass no end. */
  start: string;
  end?: string;
  roles: Role[];
}

const EXPERIENCE: Employer[] = [
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
];

const EDUCATION = {
  school: "Carleton College",
  degree: "Bachelor's degree",
  dates: "1991 – 1995",
};

function months({ start, end }: Employer): number {
  const from = new Date(`${start}-01`);
  const to = end ? new Date(`${end}-01`) : new Date();
  return (
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth())
  );
}

/** "2 yr 5 mo" — the dates give the range, this gives the weight. */
function duration(employer: Employer): string {
  const total = months(employer);
  const years = Math.floor(total / 12);
  const rest = total % 12;
  return [years && `${years} yr`, rest && `${rest} mo`]
    .filter(Boolean)
    .join(" ");
}

export default function AboutPage() {
  return (
    <div className="sheet-pad">
      <div className="measure">
        <header className="sheet-head">
          <h1>Curriculum Vitae</h1>
          <p className="blurb mono solo-meta">
            <span>Portland, Oregon</span>
            <span>hello@brennaswitzer.com</span>
          </p>
        </header>

        <div className="cv">
          <div className="cv-prose">
            <p>
              I got into software by accident. The original plan was to be a
              professional artist &mdash; while I was figuring out exactly how{" "}
              <em>that</em> was going to work, I got a job as a receptionist to
              pay the bills.
            </p>
            <p>
              I was very quickly bored out of my mind and started tinkering with
              the company website just to have something to do. One thing led to
              another &mdash; night classes, tutorials, a lot of self-guided
              stumbling &mdash; and I fell in love with engineering as a
              discipline. I still paint, but the craft of building software
              became a parallel passion. The two aren&apos;t as separate as they
              look: both are about exploration, discovery, and the specific
              satisfaction of bringing something into being that didn&apos;t
              exist before. They&apos;re also both just really hard, which
              I&apos;ve come to understand is the point.
            </p>
            <p>
              Every move in my career since has followed the same pattern: I get
              good enough at a scope of problem that it stops being hard enough,
              and I go looking for something bigger. That&apos;s taken me from
              New Relic to Brex to EMERGE to what&apos;s now Lyntris (by way of
              Hypergiant and Accelint &mdash; same company, two rebrands, one
              very confusing LinkedIn), with the scope and the responsibility
              growing each time.
            </p>
            <p>
              What I care most about, though, isn&apos;t the technical scope
              &mdash; it&apos;s the team. Software is a team sport, and I think
              the whole team gets better together or fails together. I spend a
              lot of my time pairing, learning, mentoring, collaborating and
              making sure the people around me have what they need, and I treat
              communication as an engineering skill, not a soft one. A team that
              talks to each other well will outbuild a team of geniuses who
              don&apos;t, every time.
            </p>
            <p>
              I also don&apos;t think I ever fully know what I&apos;m doing
              &mdash; and I&apos;ve stopped treating that as a problem. It&apos;s
              just what learning feels like from the inside, and it hasn&apos;t
              gone away no matter how senior I&apos;ve gotten. If anything,
              that&apos;s the whole engine: the same restlessness that got me out
              of a receptionist job is still what makes me chase the next hard
              problem.
            </p>
            <p>
              Which is what I&apos;m looking for next: something genuinely hard,
              technically and organizationally, on a team that takes
              communication as seriously as it takes code. Title matters less to
              me than whether the work stretches me and the people are worth
              building alongside.
            </p>
          </div>

          <div className="ledger mono">
            {EXPERIENCE.map((employer) => (
              <section className="job" key={employer.company}>
                <h3>{employer.company}</h3>
                {employer.location && (
                  <span className="where">{employer.location}</span>
                )}
                {employer.formerly && (
                  <p className="formerly">formerly {employer.formerly}</p>
                )}
                <ul>
                  {employer.roles.map((role) => (
                    <li key={role.title}>
                      <span>{role.title}</span>
                      <span>{role.dates}</span>
                    </li>
                  ))}
                  <li className="total">
                    <span />
                    <span>{duration(employer)}</span>
                  </li>
                </ul>
              </section>
            ))}

            <section className="job">
              <h3>{EDUCATION.school}</h3>
              <span className="where">Northfield, MN</span>
              <ul>
                <li>
                  <span>{EDUCATION.degree}</span>
                  <span>{EDUCATION.dates}</span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
