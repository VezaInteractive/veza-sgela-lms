"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CircleHelp,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import { cn } from "@sgela/ui";
import { ColourBar } from "@/components/dashboard/parts";
import { track } from "@/lib/analytics/client";
import {
  ICT_BASICS,
  isCorrect,
  totalQuestions,
  type Question,
  type Topic,
} from "@/lib/learn/ict-basics";
import { Illus } from "@/components/learn/ict-illustrations";

type AnswerValue = number | boolean | string | Record<string, string>;
type Saved = Record<string, { value: AnswerValue; correct: boolean }>;

const STORAGE_KEY = "sgela.learn.cr-ict";
const TOPIC_COLOURS = ["#4FA3FF", "#FFB547", "#FF6B5A", "#ABCF37", "#3FD1B5", "#B98CFF"];

/** Flat list of every session across all units, with the unit it belongs to. */
const FLAT: { topic: Topic; unitName: string; unitIndex: number }[] = ICT_BASICS.units.flatMap(
  (u, unitIndex) => u.topics.map((topic) => ({ topic, unitName: u.name, unitIndex })),
);

function load(): Saved {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Saved;
  } catch {
    return {};
  }
}

function makeLabels(t: (k: string) => string) {
  return {
    overview: t("overview"),
    start: t("start"),
    continue: t("continue"),
    check: t("check"),
    save: t("save"),
    next: t("next"),
    back: t("back"),
    correct: t("correct"),
    saved: t("savedNote"),
    tryAgain: t("tryAgain"),
    yes: t("true"),
    no: t("false"),
    yourAnswer: t("yourAnswer"),
    finishTopic: t("finishTopic"),
    done: t("done"),
    doneBody: t("doneBody"),
    reset: t("reset"),
    progress: t("progress"),
    answered: t("answered"),
    minutes: t("minutes"),
    standard: t("standard"),
    topicDone: t("topicDone"),
    pickOne: t("pickOne"),
    unitStandard: t("unitStandard"),
    purpose: t("purpose"),
    outcomes: t("outcomes"),
    sessions: t("sessions"),
    assessmentNote: t("assessmentNote"),
    nqf: t("nqf"),
    credits: t("credits"),
    provider: t("provider"),
  };
}

export type IctLabels = ReturnType<typeof makeLabels>;

/**
 * Interactive ICT Basics course (D-040). Overview of two learning units → per-session reading +
 * question blocks (choice, true/false, blank, match, number costing, short-answer fields) with
 * instant feedback → a done screen. Answers and progress persist per device in localStorage
 * (D-021 storage rule); nothing is sent to the server yet.
 */
export function IctCourse({ labels: L }: { labels: IctLabels }) {
  const total = totalQuestions();
  const [saved, setSaved] = useState<Saved>({});
  const [ready, setReady] = useState(false);
  // view: -1 overview, 0..FLAT.length-1 a session, FLAT.length done
  const [view, setView] = useState<number>(-1);

  useEffect(() => {
    // Read per-device progress after hydration (localStorage is client-only; server renders empty).
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setSaved(load());
    setReady(true);
  }, []);

  const answeredCount = useMemo(
    () => Object.values(saved).filter((a) => a.correct).length,
    [saved],
  );

  function save(next: Saved) {
    setSaved(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // storage unavailable: progress simply not remembered
    }
  }

  function record(q: Question, value: AnswerValue) {
    const correct = isCorrect(q, value);
    save({ ...saved, [q.id]: { value, correct } });
    track("ict_question_answered", { question: q.id, kind: q.kind, correct });
    return correct;
  }

  function reset() {
    save({});
    track("ict_course_reset", {});
    setView(-1);
  }

  if (!ready) {
    return <div className="glass h-64 animate-pulse rounded-3xl" aria-hidden="true" />;
  }

  if (view === -1) {
    return (
      <Overview
        L={L}
        saved={saved}
        answeredCount={answeredCount}
        total={total}
        onOpen={(i) => {
          setView(i);
          track("ict_topic_opened", { topic: FLAT[i]!.topic.slug });
        }}
        onReset={reset}
      />
    );
  }

  if (view >= FLAT.length) {
    return (
      <Done
        L={L}
        answeredCount={answeredCount}
        total={total}
        onReview={() => setView(-1)}
        onReset={reset}
      />
    );
  }

  const entry = FLAT[view]!;
  return (
    <TopicView
      key={entry.topic.slug}
      L={L}
      topic={entry.topic}
      unitName={entry.unitName}
      colour={TOPIC_COLOURS[view % TOPIC_COLOURS.length]!}
      index={view}
      count={FLAT.length}
      saved={saved}
      onAnswer={record}
      onBack={() => setView(-1)}
      onDone={() => {
        const last = view + 1 >= FLAT.length;
        track("ict_topic_completed", { topic: entry.topic.slug });
        if (last) track("ict_course_completed", { answered: answeredCount });
        setView(view + 1);
        window.scrollTo({ top: 0 });
      }}
    />
  );
}

function topicDone(topic: Topic, saved: Saved) {
  const qs = topic.blocks.filter((b) => b.question).map((b) => b.question!);
  return qs.length > 0 && qs.every((q) => saved[q.id]?.correct);
}

function Overview({
  L,
  saved,
  answeredCount,
  total,
  onOpen,
  onReset,
}: {
  L: IctLabels;
  saved: Saved;
  answeredCount: number;
  total: number;
  onOpen: (i: number) => void;
  onReset: () => void;
}) {
  const pct = total > 0 ? Math.round((answeredCount / total) * 100) : 0;
  return (
    <div className="flex flex-col gap-8">
      <div className="hero-band fade-up rounded-3xl p-6 md:p-8">
        <span aria-hidden="true" className="hero-orb hero-orb-a" />
        <span aria-hidden="true" className="hero-orb hero-orb-b" />
        <div className="flex flex-col gap-3">
          <span className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase opacity-80">
            <Sparkles aria-hidden="true" className="size-4" />
            {ICT_BASICS.code} · {ICT_BASICS.units.length} learning units
          </span>
          <h1 className="font-heading text-2xl leading-tight font-bold md:text-4xl">
            {ICT_BASICS.title}
          </h1>
          <p className="max-w-2xl opacity-90">{ICT_BASICS.intro}</p>
          <div className="mt-2 flex flex-col gap-2">
            <ColourBar
              value={pct}
              colour="#ABCF37"
              label={L.progress + ": " + pct + "%"}
              delay={100}
            />
            <span className="text-sm opacity-90">
              {L.answered
                .replace("{done}", String(answeredCount))
                .replace("{total}", String(total))}
            </span>
          </div>
        </div>
      </div>

      {ICT_BASICS.units.map((u, unitIndex) => {
        // global flat offset of this unit's first session
        const offset = ICT_BASICS.units
          .slice(0, unitIndex)
          .reduce((n, prev) => n + prev.topics.length, 0);
        return (
          <section key={u.unit.id} className="flex flex-col gap-4">
            <section className="glass panel-accent flex flex-col gap-4 rounded-2xl p-5 md:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  {L.unitStandard} {u.unit.id}
                </span>
                <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted">
                  {L.nqf} {u.unit.nqfLevel}
                </span>
                <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted">
                  {u.unit.credits} {L.credits}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold tracking-wide text-muted uppercase">
                  {u.name}
                </span>
                <h2 className="font-heading text-lg font-semibold">{u.unit.title}</h2>
              </div>
              <p className="text-sm text-muted">
                <span className="font-semibold text-foreground">{L.purpose} </span>
                {u.unit.purpose}
              </p>
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold">{L.outcomes}</h3>
                <ul className="flex flex-col gap-2">
                  {u.unit.outcomes.map((o) => (
                    <li key={o} className="flex gap-2 text-sm">
                      <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-link" />
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="flex items-start gap-2 rounded-xl bg-surface p-3 text-xs text-muted">
                <CircleHelp aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-link" />
                {L.assessmentNote}
              </p>
              <p className="text-xs text-muted">
                {L.provider} {u.unit.provider} · {u.unit.qualification}
              </p>
            </section>

            <h3 className="-mb-1 px-1 font-heading text-base font-semibold">{L.sessions}</h3>
            <ol className="flex flex-col gap-4">
              {u.topics.map((topic, i) => {
                const flatIndex = offset + i;
                const done = topicDone(topic, saved);
                const colour = TOPIC_COLOURS[flatIndex % TOPIC_COLOURS.length]!;
                const started = topic.blocks.some((b) => b.question && saved[b.question.id]);
                return (
                  <li key={topic.slug}>
                    <button
                      type="button"
                      onClick={() => onOpen(flatIndex)}
                      style={{ ["--w" as string]: colour }}
                      className="course-card lift group flex w-full items-center gap-4 rounded-2xl p-4 text-left"
                    >
                      <span aria-hidden="true" className="hidden h-20 w-32 shrink-0 sm:block">
                        <Illus id={topic.illus} colour={colour} />
                      </span>
                      <span
                        aria-hidden="true"
                        className={cn(
                          "flex size-11 shrink-0 items-center justify-center rounded-2xl font-heading text-lg font-bold sm:hidden",
                          done ? "bg-primary text-primary-foreground" : "course-card-icon",
                        )}
                      >
                        {done ? <Check className="size-6" /> : i + 1}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="text-xs font-semibold tracking-wide text-muted uppercase">
                          {topic.session}
                        </span>
                        <span className="font-heading text-lg leading-snug font-semibold">
                          {topic.title}
                        </span>
                        <span className="text-sm text-muted">{topic.summary}</span>
                        <span className="mt-1 flex items-center gap-3 text-xs font-semibold text-muted">
                          <span className="flex items-center gap-1">
                            <BookOpen aria-hidden="true" className="size-3.5" />
                            {L.minutes.replace("{n}", String(topic.minutes))}
                          </span>
                          {done ? (
                            <span className="rounded-full bg-primary px-2 py-0.5 text-primary-foreground">
                              {L.topicDone}
                            </span>
                          ) : null}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-semibold text-link">
                        {started && !done ? L.continue : done ? L.overview : L.start}
                        <ArrowRight
                          aria-hidden="true"
                          className="ml-1 inline size-4 transition-transform group-hover:translate-x-1"
                        />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-xs text-muted">
          <CircleHelp aria-hidden="true" className="size-4" />
          {L.standard}
        </p>
        {answeredCount > 0 ? (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-foreground"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            {L.reset}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function TopicView({
  L,
  topic,
  unitName,
  colour,
  index,
  count,
  saved,
  onAnswer,
  onBack,
  onDone,
}: {
  L: IctLabels;
  topic: Topic;
  unitName: string;
  colour: string;
  index: number;
  count: number;
  saved: Saved;
  onAnswer: (q: Question, v: AnswerValue) => boolean;
  onBack: () => void;
  onDone: () => void;
}) {
  const done = topicDone(topic, saved);
  return (
    <div className="flex flex-col gap-6" style={{ ["--w" as string]: colour }}>
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-semibold text-link hover:underline"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {L.overview}
        </button>
        <span className="text-xs font-semibold text-muted">
          {index + 1} / {count}
        </span>
      </div>

      <div className="course-card panel-accent overflow-hidden rounded-3xl">
        <Illus id={topic.illus} colour={colour} />
        <div className="p-6 md:p-8">
          <span className="text-xs font-semibold tracking-wide text-muted uppercase">
            {unitName} · {topic.session}
          </span>
          <h1 className="font-heading text-2xl font-bold md:text-3xl">{topic.title}</h1>
          <p className="mt-1 text-muted">{topic.summary}</p>
        </div>
      </div>

      <ol className="flex flex-col gap-4">
        {topic.blocks.map((block, i) => (
          <li key={i}>
            {block.text ? (
              <p className="px-1 text-[15px] leading-relaxed md:text-base">{block.text}</p>
            ) : null}
            {block.define ? (
              <div className="glass panel-accent flex gap-3 rounded-2xl p-4">
                <Lightbulb aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-link" />
                <p className="text-[15px] leading-relaxed">
                  <span className="font-heading font-semibold">{block.define.term}: </span>
                  {block.define.meaning}
                </p>
              </div>
            ) : null}
            {block.list ? (
              <dl className="glass flex flex-col gap-1 rounded-2xl p-4 text-sm">
                {block.list.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-3 border-b border-border/60 py-1.5 last:border-0"
                  >
                    <dt className="text-muted">{row.label}</dt>
                    <dd className="font-heading font-semibold tabular-nums">{row.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {block.question ? (
              <QuestionBlock
                L={L}
                q={block.question}
                saved={saved[block.question.id]}
                onAnswer={onAnswer}
              />
            ) : null}
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={onDone}
        className={cn(
          "inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-full px-6 font-semibold",
          done
            ? "bg-primary text-primary-foreground"
            : "border border-border bg-surface hover:border-primary",
        )}
      >
        {index + 1 >= count ? L.finishTopic : L.next}
        <ArrowRight aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}

function Feedback({ L, correct, explain }: { L: IctLabels; correct: boolean; explain: string }) {
  return (
    <div
      role="status"
      className={cn(
        "mt-3 flex items-start gap-2 rounded-xl p-3 text-sm",
        correct
          ? "bg-primary/15 text-foreground"
          : "border border-warning/40 bg-warning/10 text-foreground",
      )}
    >
      {correct ? (
        <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-link" />
      ) : (
        <X aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      )}
      <span>
        <span className="font-semibold">{correct ? L.correct : L.tryAgain} </span>
        {explain}
      </span>
    </div>
  );
}

function QuestionBlock({
  L,
  q,
  saved,
  onAnswer,
}: {
  L: IctLabels;
  q: Question;
  saved?: { value: AnswerValue; correct: boolean };
  onAnswer: (q: Question, v: AnswerValue) => boolean;
}) {
  const [picks, setPicks] = useState<Record<string, string>>(
    saved && q.kind === "match" ? (saved.value as Record<string, string>) : {},
  );
  const [text, setText] = useState(
    saved && (q.kind === "blank" || q.kind === "number" || q.kind === "text")
      ? String(saved.value)
      : "",
  );
  const [result, setResult] = useState<boolean | null>(saved ? saved.correct : null);

  const answer = (v: AnswerValue) => setResult(onAnswer(q, v));

  return (
    <div className="glass my-1 flex flex-col gap-3 rounded-2xl p-5">
      <p className="flex items-start gap-2 font-heading font-semibold">
        <CircleHelp aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-link" />
        {q.prompt}
      </p>

      {q.kind === "choice" ? (
        <div className="flex flex-col gap-2">
          {q.options.map((opt, i) => {
            const chosen = saved?.value === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => answer(i)}
                aria-pressed={chosen}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3 text-left text-sm transition-colors",
                  chosen && result
                    ? "border-primary bg-primary/10"
                    : chosen
                      ? "border-warning bg-warning/10"
                      : "border-border hover:border-primary",
                )}
              >
                <span
                  aria-hidden="true"
                  className="flex size-6 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold"
                >
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      ) : null}

      {q.kind === "boolean" ? (
        <div className="flex gap-2">
          {[true, false].map((v) => {
            const chosen = saved?.value === v;
            return (
              <button
                key={String(v)}
                type="button"
                onClick={() => answer(v)}
                aria-pressed={chosen}
                className={cn(
                  "min-h-11 flex-1 rounded-xl border p-3 text-sm font-semibold transition-colors",
                  chosen && result
                    ? "border-primary bg-primary/10"
                    : chosen
                      ? "border-warning bg-warning/10"
                      : "border-border hover:border-primary",
                )}
              >
                {v ? L.yes : L.no}
              </button>
            );
          })}
        </div>
      ) : null}

      {q.kind === "blank" || q.kind === "number" ? (
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            answer(text);
          }}
        >
          {q.kind === "number" && q.prefix ? (
            <span className="font-heading font-semibold text-muted">{q.prefix}</span>
          ) : null}
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={q.placeholder}
            inputMode={q.kind === "number" ? "numeric" : "text"}
            aria-label={L.yourAnswer}
            className="min-w-0 flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            className="min-h-11 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            {L.check}
          </button>
        </form>
      ) : null}

      {q.kind === "text" ? (
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            answer(text);
          }}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={q.placeholder}
            rows={3}
            aria-label={L.yourAnswer}
            className="w-full resize-y rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            className="min-h-11 self-start rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
          >
            {L.save}
          </button>
        </form>
      ) : null}

      {q.kind === "match" ? (
        <MatchQuestion
          q={q}
          picks={picks}
          setPicks={setPicks}
          onCheck={() => answer(picks)}
          L={L}
        />
      ) : null}

      {result !== null ? (
        q.kind === "text" ? (
          result ? (
            <p role="status" className="mt-1 flex items-center gap-2 text-sm text-link">
              <Check aria-hidden="true" className="size-4 shrink-0" />
              <span>
                <span className="font-semibold">{L.saved} </span>
                {q.explain}
              </span>
            </p>
          ) : null
        ) : (
          <Feedback L={L} correct={result} explain={q.explain} />
        )
      ) : null}
    </div>
  );
}

function MatchQuestion({
  q,
  picks,
  setPicks,
  onCheck,
  L,
}: {
  q: Extract<Question, { kind: "match" }>;
  picks: Record<string, string>;
  setPicks: (p: Record<string, string>) => void;
  onCheck: () => void;
  L: IctLabels;
}) {
  const defs = useMemo(() => q.pairs.map((p) => p.def), [q]);
  const all = q.pairs.every((p) => picks[p.term]);
  return (
    <div className="flex flex-col gap-2">
      {q.pairs.map((p) => (
        <label key={p.term} className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center">
          <span className="font-semibold sm:w-36 sm:shrink-0">{p.term}</span>
          <select
            value={picks[p.term] ?? ""}
            onChange={(e) => setPicks({ ...picks, [p.term]: e.target.value })}
            className="min-w-0 flex-1 rounded-xl border border-border bg-surface px-3 py-2 focus:border-primary focus:outline-none"
          >
            <option value="">{L.pickOne}</option>
            {defs.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
      ))}
      <button
        type="button"
        disabled={!all}
        onClick={onCheck}
        className="mt-1 min-h-11 self-start rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
      >
        {L.check}
      </button>
    </div>
  );
}

function Done({
  L,
  answeredCount,
  total,
  onReview,
  onReset,
}: {
  L: IctLabels;
  answeredCount: number;
  total: number;
  onReview: () => void;
  onReset: () => void;
}) {
  return (
    <div className="hero-band fade-up flex flex-col items-center gap-4 rounded-3xl p-8 text-center md:p-12">
      <span aria-hidden="true" className="hero-orb hero-orb-a" />
      <span
        aria-hidden="true"
        className="flex size-20 items-center justify-center rounded-full bg-lime-500 text-ink"
      >
        <Trophy className="size-10" />
      </span>
      <h1 className="font-heading text-2xl font-bold md:text-3xl">{L.done}</h1>
      <p className="max-w-md opacity-90">
        {L.doneBody.replace("{done}", String(answeredCount)).replace("{total}", String(total))}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onReview}
          className="inline-flex min-h-12 items-center gap-2 rounded-full bg-lime-500 px-6 font-semibold text-ink"
        >
          <BookOpen aria-hidden="true" className="size-4" />
          {L.overview}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/30 px-6 font-semibold"
        >
          <RotateCcw aria-hidden="true" className="size-4" />
          {L.reset}
        </button>
      </div>
    </div>
  );
}

export { makeLabels };
