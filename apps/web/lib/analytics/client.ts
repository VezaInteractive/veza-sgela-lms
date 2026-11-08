"use client";

import type { EventName, EventProps } from "@sgela/analytics";

const ENDPOINT = "/api/v1/events";
const ANON_KEY = "sgela.anonId";
const FLUSH_MS = 5000;

type Queued = { name: EventName; props: EventProps; occurredAt: string; anonId?: string };

const queue: Queued[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let listening = false;

function anonId(): string | undefined {
  try {
    let id = localStorage.getItem(ANON_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(ANON_KEY, id);
    }
    return id;
  } catch {
    return undefined;
  }
}

function flush() {
  if (timer) clearTimeout(timer);
  timer = null;
  if (queue.length === 0) return;
  const body = JSON.stringify({ events: queue.splice(0, 50) });
  const blob = new Blob([body], { type: "application/json" });
  if (!(navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, blob))) {
    void fetch(ENDPOINT, {
      method: "POST",
      body,
      headers: { "content-type": "application/json" },
      keepalive: true,
    }).catch(() => {});
  }
  if (queue.length > 0) flush();
}

/** Client-side tracking helper (M0-5). Batched; flushed every 5 s and when the tab is hidden. */
export function track(name: EventName, props: EventProps = {}) {
  if (typeof window === "undefined") return;
  queue.push({ name, props, occurredAt: new Date().toISOString(), anonId: anonId() });
  if (!listening) {
    listening = true;
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flush();
    });
  }
  if (queue.length >= 20) flush();
  else timer ??= setTimeout(flush, FLUSH_MS);
}
