/**
 * Canonical analytics event names. Every new user action must add its name here
 * (CLAUDE.md / PRD §19.2). Funnel events mirror PRD §2.4.
 */
export const FUNNEL_EVENTS = [
  "expo_session",
  "claim_started",
  "account_created",
  "consent_complete",
  "first_topic_started",
  "first_topic_completed",
  "course_completed",
  "credential_issued",
  "match_created",
  "invite_sent",
  "invite_accepted",
  "application_submitted",
  "placed",
] as const;

export const UI_EVENTS = [
  "page_view",
  "nav_click",
  "language_changed",
  "theme_changed",
  "coach_opened",
  "data_saver_toggled",
  "support_opened",
  "notifications_opened",
] as const;

/** M1: auth, onboarding, consent and claim actions. */
export const ONBOARDING_EVENTS = [
  "otp_requested",
  "otp_verified",
  "otp_failed",
  "signed_out",
  "signed_out_everywhere",
  "profile_completed",
  "guardian_invited",
  "guardian_reminder_sent",
  "guardian_consent_responded",
  "consent_updated",
  "claim_viewed",
  "claim_linked",
  "claim_failed",
  "expo_code_entered",
  "profile_photo_updated",
  "profile_photo_removed",
  "profile_photo_rejected",
] as const;

/** M2: Career Compass, Explore, 3D viewer and the catalogue admin. */
export const EXPLORE_EVENTS = [
  "world_viewed",
  "career_viewed",
  "world_interest_toggled",
  "career_interest_toggled",
  "compass_world_opened",
  "compass_mode",
  "next_step_clicked",
  "coach_asked_about_career",
  "model_viewer_loaded",
  "model_viewer_reset",
  "model_viewer_failed",
  "admin_industry_updated",
  "admin_career_created",
  "admin_career_updated",
  "admin_career_deleted",
  "ict_topic_opened",
  "ict_question_answered",
  "ict_topic_completed",
  "ict_course_completed",
  "ict_course_reset",
] as const;

export const EVENT_NAMES = [
  ...FUNNEL_EVENTS,
  ...UI_EVENTS,
  ...ONBOARDING_EVENTS,
  ...EXPLORE_EVENTS,
] as const;

export type FunnelEventName = (typeof FUNNEL_EVENTS)[number];
export type EventName = (typeof EVENT_NAMES)[number];

export type EventProps = Record<string, string | number | boolean | null>;

export interface TrackedEvent {
  name: EventName;
  props: EventProps;
  occurredAt: string; // ISO 8601
  anonId?: string;
}

export function isEventName(value: string): value is EventName {
  return (EVENT_NAMES as readonly string[]).includes(value);
}
