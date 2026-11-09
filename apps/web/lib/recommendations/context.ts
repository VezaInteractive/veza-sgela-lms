import { getDb, type PrismaClient } from "@sgela/db";
import type { NextStepContext } from "./next-step";

/**
 * Loads the inputs for the next-best-step rules (PRD 7.11) for one learner. Only the learner's
 * own rows are read. Courses, invites and matches arrive with M3 to M5, so those parts return
 * nothing until their tables hold data; the rules already handle them.
 */
export async function loadNextStepContext(
  input: {
    learner: {
      id: string;
      restricted: boolean;
      guardian: { requestedAt: Date; respondedAt: Date | null } | null;
    };
    worlds: { code: string; interest: number }[];
    explored: Set<string>;
    now: Date;
  },
  db: PrismaClient = getDb(),
): Promise<NextStepContext> {
  const { learner, now } = input;
  const restricted = learner.restricted;

  const [invites, section, doneTopics, courses, enrolments, match] = await Promise.all([
    restricted
      ? Promise.resolve([])
      : db.invitation.findMany({
          where: { match: { learnerId: learner.id }, response: null, expiresAt: { gt: now } },
          select: {
            expiresAt: true,
            match: { select: { opportunity: { select: { partnerOrgId: true } } } },
          },
          orderBy: { expiresAt: "asc" },
          take: 5,
        }),
    db.sectionProgress.findFirst({
      where: { learnerId: learner.id, status: "IN_PROGRESS" },
      orderBy: { updatedAt: "desc" },
      select: {
        section: {
          select: { title: true, topic: { select: { course: { select: { slug: true } } } } },
        },
      },
    }),
    db.topicProgress.findMany({
      where: { learnerId: learner.id, completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      take: 10,
      select: {
        topic: {
          select: {
            title: true,
            course: { select: { slug: true } },
            sections: {
              select: { blocks: { where: { type: "QUIZ" }, select: { data: true } } },
            },
          },
        },
      },
    }),
    db.course.findMany({
      where: { status: "PUBLISHED", industryCode: { not: null } },
      orderBy: { code: "asc" },
      select: { slug: true, title: true, industryCode: true },
    }),
    db.enrolment.findMany({
      where: { learnerId: learner.id },
      select: { course: { select: { industryCode: true } } },
    }),
    restricted
      ? Promise.resolve(null)
      : db.match.findFirst({
          where: {
            learnerId: learner.id,
            status: { in: ["NEAR_MISS", "SUGGESTED"] },
            opportunity: { status: "OPEN", closesAt: { gt: now } },
          },
          orderBy: { score: "desc" },
          select: { gaps: true, opportunity: { select: { title: true } } },
        }),
  ]);

  const partnerIds = [...new Set(invites.map((i) => i.match.opportunity.partnerOrgId))];
  const partners = partnerIds.length
    ? await db.organisation.findMany({
        where: { id: { in: partnerIds } },
        select: { id: true, name: true },
      })
    : [];
  const partnerName = new Map(partners.map((p) => [p.id, p.name]));

  // Topic complete but its check (a QUIZ block's quizId) never attempted.
  let topicAwaitingCheck: NextStepContext["topicAwaitingCheck"] = null;
  const quizzesByTopic = doneTopics.map((tp) => ({
    tp,
    quizIds: tp.topic.sections.flatMap((s) =>
      s.blocks.flatMap((b) => {
        const id = (b.data as { quizId?: unknown } | null)?.quizId;
        return typeof id === "string" ? [id] : [];
      }),
    ),
  }));
  const allQuizIds = quizzesByTopic.flatMap((x) => x.quizIds);
  if (allQuizIds.length) {
    const tried = await db.attempt.findMany({
      where: { learnerId: learner.id, quizId: { in: allQuizIds } },
      select: { quizId: true },
    });
    const attempted = new Set(tried.map((a) => a.quizId));
    const waiting = quizzesByTopic.find(
      (x) => x.quizIds.length > 0 && !x.quizIds.some((q) => attempted.has(q)),
    );
    if (waiting) {
      topicAwaitingCheck = {
        title: waiting.tp.topic.title,
        href: "/learn/" + waiting.tp.topic.course.slug,
      };
    }
  }

  const startedWorlds = new Set(enrolments.map((e) => e.course.industryCode).filter(Boolean));
  const worldCourses: NextStepContext["worldCourses"] = {};
  for (const c of courses) {
    const code = c.industryCode!;
    worldCourses[code] ??= {
      title: c.title,
      href: "/learn/" + c.slug,
      started: startedWorlds.has(code),
    };
  }

  const gap = firstGap(match?.gaps);

  return {
    now,
    restricted,
    guardian: learner.guardian
      ? { requestedAt: learner.guardian.requestedAt, responded: !!learner.guardian.respondedAt }
      : null,
    invites: invites.map((i) => ({
      partner: partnerName.get(i.match.opportunity.partnerOrgId) ?? "",
      expiresAt: i.expiresAt,
    })),
    inProgressSection: section
      ? { title: section.section.title, href: "/learn/" + section.section.topic.course.slug }
      : null,
    topicAwaitingCheck,
    worlds: input.worlds,
    worldCourses,
    readinessGap:
      match && gap
        ? { item: gap, opportunity: match.opportunity.title, href: "/opportunities" }
        : null,
    explored: input.explored,
  };
}

/** Match gaps are a list of strings or of { label } objects (M5); take the first label. */
export function firstGap(gaps: unknown): string | null {
  if (!Array.isArray(gaps)) return null;
  for (const g of gaps) {
    if (typeof g === "string" && g.trim()) return g;
    if (g && typeof g === "object" && typeof (g as { label?: unknown }).label === "string") {
      return (g as { label: string }).label;
    }
  }
  return null;
}
