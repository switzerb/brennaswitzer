interface Role {
  title: string;
  dates: string;
}

interface Employer {
  company: string;
  formerly?: string;
  location?: string;
  roles: Role[];
}

const EXPERIENCE: Employer[] = [
  {
    company: "Lyntris",
    formerly: "Hypergiant, then Accelint",
    location: "Portland, OR · Remote",
    roles: [
      { title: "Staff Software Engineer", dates: "Jun 2026 – Present" },
      { title: "Lead Frontend Developer", dates: "May 2025 – Jun 2026" },
      { title: "Senior Frontend Developer", dates: "Mar 2024 – May 2025" },
    ],
  },
  {
    company: "EMERGE — A Digital Product Agency",
    location: "Portland, OR · Hybrid",
    roles: [{ title: "Staff Software Engineer", dates: "May 2023 – Mar 2024" }],
  },
  {
    company: "Brex",
    roles: [{ title: "Senior Software Engineer", dates: "Mar 2021 – May 2023" }],
  },
  {
    company: "New Relic",
    location: "Portland, OR Metro",
    roles: [{ title: "Senior Software Engineer", dates: "Apr 2019 – Feb 2021" }],
  },
];

const EDUCATION = {
  school: "Carleton College",
  degree: "Bachelor's degree",
  dates: "1991 – 1995",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen py-16">
      <main className="max-w-3xl mx-auto px-8">
        <h1 className="text-5xl font-light mb-12">About</h1>

        <div className="space-y-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed mb-16">
          <p>
            I got into software by accident...the original plan was to be a professional artist. While I was figuring out exactly how <i>that</i> was going to work, I got a job as a receptionist to pay the bills.</p>
          <p>
            I was very quickly bored out of my mind and started tinkering with
            the company website just to have something to do. One thing led to another
            — night classes, tutorials, a lot of self-guided stumbling — and I fell
            in love with engineering as a discipline. I still paint but the craft of building software became a parallel passion -- although the two aren&apos;t as separate as they look: both are about exploration, discovery,
            and the specific satisfaction of bringing something into being
            that didn&apos;t exist before. They&apos;re also both just
            really hard, which I&apos;ve come to understand is the point.
          </p>
          <p>
            Every move in my career since has followed the same pattern: I
            get good enough at a scope of problem that it stops being hard
            enough, and I go looking for something bigger. That&apos;s
            taken me from New Relic to Brex to EMERGE to what&apos;s now
            Lyntris (by way of Hypergiant and Accelint — same company, two
            rebrands, one very confusing LinkedIn), with the scope and the
            responsibility growing each time.
          </p>
          <p>
            What I care most about, though, isn&apos;t the technical scope —
            it&apos;s the team. Software is a team sport, and I think the
            whole team gets better together or fails together. I spend a
            lot of my time pairing, learning, mentoring, collaborating and making sure the people
            around me have what they need, and I treat communication as an
            engineering skill, not a soft one. A team that talks to each
            other well will outbuild a team of geniuses who don&apos;t,
            every time.
          </p>
          <p>
            I also don&apos;t think I ever fully know what I&apos;m doing —
            and I&apos;ve stopped treating that as a problem. It&apos;s just
            what learning feels like from the inside, and it hasn&apos;t
            gone away no matter how senior I&apos;ve gotten. If anything,
            that&apos;s the whole engine: the same restlessness that got me
            out of a receptionist job is still what makes me chase the next
            hard problem.
          </p>
          <p>
            Which is what I&apos;m looking for next: something genuinely
            hard, technically and organizationally, on a team that takes
            communication as seriously as it takes code. Title matters less
            to me than whether the work stretches me and the people are
            worth building alongside.
          </p>
        </div>

        <section className="mb-16">
          <h2 className="text-2xl mb-6">Experience</h2>
          <div className="space-y-8">
            {EXPERIENCE.map((employer) => (
              <div key={employer.company}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="text-lg">{employer.company}</h3>
                  {employer.location && (
                    <span className="text-sm text-zinc-500 dark:text-zinc-500">
                      {employer.location}
                    </span>
                  )}
                </div>
                {employer.formerly && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-500 italic mt-0.5">
                    formerly {employer.formerly}
                  </p>
                )}
                <ul className="mt-2 space-y-1">
                  {employer.roles.map((role) => (
                    <li
                      key={role.title}
                      className="flex flex-wrap justify-between gap-x-4 text-sm text-zinc-600 dark:text-zinc-400"
                    >
                      <span>{role.title}</span>
                      <span className="text-zinc-500 dark:text-zinc-500">
                        {role.dates}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl mb-6">Education</h2>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
            <h3 className="text-lg">{EDUCATION.school}</h3>
            <span className="text-sm text-zinc-500 dark:text-zinc-500">
              {EDUCATION.dates}
            </span>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
            {EDUCATION.degree}
          </p>
        </section>
      </main>
    </div>
  );
}
