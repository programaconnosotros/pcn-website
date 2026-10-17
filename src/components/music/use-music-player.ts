'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MusicSet } from './music-sets';

const YOUTUBE_ORIGIN = 'https://www.youtube-nocookie.com';

/** YouTube player states, as reported by the embed's postMessage API. */
const PLAYING_STATES = new Set([1, 3]);
const STOPPED_STATES = new Set([0, 2, 5]);

const parseMessage = (data: unknown) => {
  if (typeof data !== 'string') return null;
  try {
    return JSON.parse(data) as { event?: string; info?: unknown };
  } catch {
    return null;
  }
};

const playerStateOf = (message: { event?: string; info?: unknown }) => {
  if (message.event === 'onStateChange' && typeof message.info === 'number') return message.info;
  if (message.event === 'infoDelivery' && typeof message.info === 'object' && message.info) {
    const state = (message.info as { playerState?: unknown }).playerState;
    if (typeof state === 'number') return state;
  }
  return null;
};

/**
 * State for a music set that keeps playing in the background: which set is loaded, whether it
 * is playing and whether its dialog is showing. Playback is driven through the YouTube embed's
 * postMessage API, and the embed reports back when it is paused from inside the video.
 */
export function useMusicPlayer() {
  const [current, setCurrent] = useState<MusicSet | null>(null);
  const [playing, setPlaying] = useState(false);
  const [open, setOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const currentIdRef = useRef<string | null>(null);

  const command = useCallback((func: 'playVideo' | 'pauseVideo') => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args: [] }),
      YOUTUBE_ORIGIN,
    );
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== YOUTUBE_ORIGIN) return;
      if (event.source !== iframeRef.current?.contentWindow) return;
      const message = parseMessage(event.data);
      const state = message && playerStateOf(message);
      if (state === null || state === undefined) return;
      if (PLAYING_STATES.has(state)) setPlaying(true);
      if (STOPPED_STATES.has(state)) setPlaying(false);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  /** Subscribes to the embed's state changes once it has loaded. */
  const onIframeLoad = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'listening', id: 'pcn-music', channel: 'widget' }),
      YOUTUBE_ORIGIN,
    );
  }, []);

  /** Plays a set (or resumes the loaded one) and shows its dialog. */
  const play = useCallback(
    (set?: MusicSet) => {
      if (set && set.id !== currentIdRef.current) {
        currentIdRef.current = set.id;
        setCurrent(set);
      } else {
        command('playVideo');
      }
      setPlaying(true);
      setOpen(true);
    },
    [command],
  );

  const pause = useCallback(() => {
    command('pauseVideo');
    setPlaying(false);
  }, [command]);

  const show = useCallback(() => setOpen(true), []);
  const hide = useCallback(() => setOpen(false), []);

  const stop = useCallback(() => {
    currentIdRef.current = null;
    setCurrent(null);
    setPlaying(false);
    setOpen(false);
  }, []);

  return { current, playing, open, show, hide, play, pause, stop, iframeRef, onIframeLoad };
}

export type MusicPlayer = ReturnType<typeof useMusicPlayer>;
