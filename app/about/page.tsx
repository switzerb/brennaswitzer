import type { Metadata } from "next";
import { EDUCATION, EXPERIENCE, duration } from "@/app/lib/cv";

export const metadata: Metadata = {
  title: "CV",
  description:
    "Brenna Switzer — staff software engineer in Portland, Oregon. Lyntris, EMERGE, Brex, New Relic.",
};

export default function AboutPage() {
  return (
    <div className="sheet-pad">
      <div className="measure">
        <header className="sheet-head">
          <h1>Curriculum Vitae</h1>
          <p className="blurb mono inline-facts">
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
              <span className="where">{EDUCATION.location}</span>
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
