"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

// Vercel Web Analytics, minus Tejas's own visits: browsers marked with ?notme (see visit-count.tsx)
// send nothing. The URL check covers the very first ?notme visit, before the mark is saved.
const isMe = () => {
  try {
    const q = new URLSearchParams(location.search);
    if (q.has("countme")) return false;
    return q.has("notme") || localStorage.getItem("visitor-notme") === "1";
  } catch {
    return false;
  }
};

const skipMe = (event: BeforeSendEvent) => (isMe() ? null : event);

export function SiteAnalytics() {
  return <Analytics beforeSend={skipMe} />;
}
