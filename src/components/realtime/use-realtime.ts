'use client';

import { useEffect, useRef } from 'react';

export type RealtimeMessage = { topic: string; data?: Record<string, unknown> };

type Listener = (_message: RealtimeMessage) => void;

/**
 * One EventSource per set of topics, shared by every component of the page that listens to it.
 * Each one is a connection that stays open: the news crawl, the live toasts and the notification
 * center all follow `feed`, and over HTTP/1.1 the browser allows only 6 connections per host, so
 * with a connection each, two open tabs used them all and the next page never loaded.
 */
const streams = new Map<string, { source: EventSource; listeners: Set<Listener> }>();

const subscribe = (key: string, listener: Listener) => {
  let stream = streams.get(key);
  if (!stream) {
    const source = new EventSource(`/api/realtime?topics=${encodeURIComponent(key)}`);
    const listeners = new Set<Listener>();
    source.onmessage = (event) => {
      let message: RealtimeMessage;
      try {
        message = JSON.parse(event.data) as RealtimeMessage;
      } catch {
        return; // A malformed message: skip it.
      }
      listeners.forEach((notify) => {
        try {
          notify(message);
        } catch {
          // One listener failing doesn't keep the message from the others.
        }
      });
    };
    stream = { source, listeners };
    streams.set(key, stream);
  }
  stream.listeners.add(listener);

  return () => {
    const current = streams.get(key);
    if (!current) return;
    current.listeners.delete(listener);
    if (current.listeners.size > 0) return;
    current.source.close();
    streams.delete(key);
  };
};

/**
 * Calls `onMessage` for every live message on these topics (see src/lib/realtime.ts). The
 * browser's EventSource reconnects by itself; nothing happens where it isn't supported.
 */
export function useRealtime(
  topics: string[],
  onMessage: (_message: RealtimeMessage) => void,
  enabled = true,
) {
  const handler = useRef(onMessage);
  useEffect(() => {
    handler.current = onMessage;
  });

  const key = topics.join(',');
  useEffect(() => {
    if (!enabled || !key || typeof EventSource === 'undefined') return;
    return subscribe(key, (message) => handler.current(message));
  }, [key, enabled]);
}
