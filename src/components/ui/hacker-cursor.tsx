'use client';

import { useEffect, useRef } from 'react';
import { useDisplayMode } from '@/components/os/os-display-mode';
import { isEmbedded, isOsMessage, postToOsHost } from '@/components/os/os-env';

const INTERACTIVE =
  'a[href], button:not(:disabled), [role="button"], [role="tab"], [role="option"], [role="menuitem"], [role="checkbox"], [role="switch"], select, summary, label[for], [data-cursor]';
const TEXT_FIELD =
  'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="button"]):not([type="submit"]), textarea, [contenteditable=""], [contenteditable="true"]';
const HEX = '0123456789ABCDEF';
const PARTICLES = 10;
const RING_SIZE = 26;
const RING_HOVER_SIZE = 42;
// Share of the remaining distance the brackets cover per 60 Hz frame (scaled to the real frame
// time, so 120 Hz screens don't make them twice as snappy).
const RING_FOLLOW = 0.4;
const RING_RESIZE = 0.35;

const labelFor = (element: Element) => {
  const custom = element.closest('[data-cursor]')?.getAttribute('data-cursor');
  if (custom) return custom;
  if (element.closest('a[href]')) {
    const href = element.closest('a')!.getAttribute('href') ?? '';
    return /^https?:\/\//.test(href) && !href.startsWith(window.location.origin) ? 'open ↗' : 'cd';
  }
  return 'exec';
};

/**
 * A terminal-style pointer for mouse users: a square that tracks the mouse exactly, corner
 * brackets that trail it with some inertia and lock onto anything clickable (with a tiny label
 * of what a click does), and a burst of hex characters on every click. Text fields keep the
 * native I-beam. Off for touch, pens and reduced motion. In PCN OS only the desktop draws it:
 * each window hides its native cursor and reports the pointer to the desktop, so there is
 * never a second (or frozen) copy on screen. Off in PCN OS liviano and the classic layout, the
 * low-resource modes: it runs every frame and every window reports each pointer move.
 */
export function HackerCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const burstRef = useRef<HTMLDivElement>(null);
  const enabled = useDisplayMode() === 'full';

  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!enabled || !finePointer.matches || reducedMotion.matches) return;

    const root = document.documentElement;
    root.classList.add('pcn-cursor');

    const describe = (element: Element | null) => {
      const inText = !!element?.closest(TEXT_FIELD);
      const interactive = inText ? null : element?.closest(INTERACTIVE);
      return { inText, label: interactive ? labelFor(interactive) : null };
    };

    if (isEmbedded()) {
      // Inside a PCN OS window: draw nothing, just report the pointer to the desktop.
      const report = (phase: 'move' | 'down' | 'up' | 'leave', event?: PointerEvent) => {
        if (event && event.pointerType !== 'mouse') return;
        const element = event?.target instanceof Element ? event.target : null;
        postToOsHost({
          type: 'cursor',
          phase,
          x: event?.clientX ?? 0,
          y: event?.clientY ?? 0,
          ...describe(element),
        });
      };
      const onMove = (event: PointerEvent) => report('move', event);
      const onDown = (event: PointerEvent) => report('down', event);
      const onUp = (event: PointerEvent) => report('up', event);
      const onLeave = () => report('leave');

      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerdown', onDown, { passive: true });
      window.addEventListener('pointerup', onUp, { passive: true });
      root.addEventListener('pointerleave', onLeave);
      window.addEventListener('blur', onLeave);
      return () => {
        root.classList.remove('pcn-cursor');
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointerup', onUp);
        root.removeEventListener('pointerleave', onLeave);
        window.removeEventListener('blur', onLeave);
      };
    }

    const dot = dotRef.current!;
    const ring = ringRef.current!;
    const label = labelRef.current!;
    const burst = burstRef.current!;

    const target = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    let ringSize = RING_SIZE;
    let targetSize = RING_SIZE;
    let visible = false;
    let pressed = false;
    let frame = 0;
    let lastFrame = 0;

    const ease = (rate: number, frames: number) => 1 - Math.pow(1 - rate, frames);

    const render = (now: number) => {
      frame = 0;
      // Frames elapsed at 60 Hz since the last render; capped so a stalled tab doesn't teleport.
      const frames = lastFrame ? Math.min((now - lastFrame) / (1000 / 60), 4) : 1;
      lastFrame = now;
      // Ease the brackets towards the pointer; snap once they're close enough to stop the loop.
      const follow = ease(RING_FOLLOW, frames);
      ringPos.x += (target.x - ringPos.x) * follow;
      ringPos.y += (target.y - ringPos.y) * follow;
      ringSize += (targetSize - ringSize) * ease(RING_RESIZE, frames);
      const settled =
        Math.abs(target.x - ringPos.x) < 0.1 &&
        Math.abs(target.y - ringPos.y) < 0.1 &&
        Math.abs(targetSize - ringSize) < 0.1;
      if (settled) {
        ringPos.x = target.x;
        ringPos.y = target.y;
        ringSize = targetSize;
      }

      const scale = pressed ? 0.6 : 1;
      dot.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%) scale(${scale})`;
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%) scale(${pressed ? 0.8 : 1})`;
      ring.style.width = ring.style.height = `${ringSize}px`;
      label.style.transform = `translate3d(${ringPos.x + ringSize / 2 + 6}px, ${ringPos.y}px, 0) translateY(-50%)`;

      if (settled) lastFrame = 0;
      else frame = requestAnimationFrame(render);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };

    const setVisible = (value: boolean) => {
      if (visible === value) return;
      visible = value;
      root.classList.toggle('pcn-cursor-hidden', !value);
    };

    const moveTo = (x: number, y: number, state: { inText: boolean; label: string | null }) => {
      target.x = x;
      target.y = y;
      if (!visible) {
        // Appear where the mouse is instead of flying in from the last position.
        ringPos.x = target.x;
        ringPos.y = target.y;
      }
      setVisible(!state.inText);

      const hovering = state.label !== null;
      targetSize = hovering ? RING_HOVER_SIZE : RING_SIZE;
      ring.dataset.hover = label.dataset.hover = String(hovering);
      label.textContent = state.label ?? '';
      schedule();
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return setVisible(false);
      const element = event.target instanceof Element ? event.target : null;
      // Over a PCN OS window, the window reports the pointer itself (see onMessage).
      if (element?.tagName === 'IFRAME') return;
      lastSource = null;
      moveTo(event.clientX, event.clientY, describe(element));
    };

    const spawnBurst = (x: number, y: number) => {
      const pulse = document.createElement('span');
      pulse.className = 'pcn-cursor-pulse';
      pulse.style.left = `${x}px`;
      pulse.style.top = `${y}px`;
      burst.appendChild(pulse);
      pulse.addEventListener('animationend', () => pulse.remove());

      for (let i = 0; i < PARTICLES; i++) {
        const particle = document.createElement('span');
        const angle = (Math.PI * 2 * i) / PARTICLES + Math.random() * 0.5;
        const distance = 26 + Math.random() * 34;
        particle.className = 'pcn-cursor-particle';
        particle.textContent =
          Math.random() > 0.35
            ? HEX[Math.floor(Math.random() * 16)]
            : Math.random() > 0.5
              ? '1'
              : '0';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
        particle.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
        particle.style.setProperty('--spin', `${(Math.random() - 0.5) * 180}deg`);
        particle.style.animationDelay = `${Math.random() * 40}ms`;
        burst.appendChild(particle);
        particle.addEventListener('animationend', () => particle.remove());
      }
    };

    const press = () => {
      pressed = true;
      ring.dataset.pressed = 'true';
      schedule();
    };
    const release = (x: number, y: number) => {
      pressed = false;
      ring.dataset.pressed = 'false';
      if (visible) spawnBurst(x, y);
      schedule();
    };

    const onDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') press();
    };
    const onUp = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') release(event.clientX, event.clientY);
    };
    const onLeave = () => setVisible(false);

    let lastSource: MessageEventSource | null = null;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || !isOsMessage(event.data)) return;
      if (event.data.type !== 'cursor') return;
      if (event.data.phase === 'leave') {
        // Only the window the pointer was last in can hide it (a blur can arrive late).
        if (event.source === lastSource) setVisible(false);
        return;
      }
      lastSource = event.source;
      const frameElement = [...document.querySelectorAll('iframe')].find(
        (iframe) => iframe.contentWindow === event.source,
      );
      if (!frameElement) return;
      // Window coordinates are relative to its page; shift them onto the desktop.
      const rect = frameElement.getBoundingClientRect();
      const x = rect.left + event.data.x;
      const y = rect.top + event.data.y;
      moveTo(x, y, event.data);
      if (event.data.phase === 'down') press();
      if (event.data.phase === 'up') release(x, y);
    };

    setVisible(false);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    root.addEventListener('pointerleave', onLeave);
    window.addEventListener('blur', onLeave);
    window.addEventListener('message', onMessage);

    return () => {
      cancelAnimationFrame(frame);
      root.classList.remove('pcn-cursor', 'pcn-cursor-hidden');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      root.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', onLeave);
      window.removeEventListener('message', onMessage);
    };
  }, [enabled]);

  return (
    <div aria-hidden>
      {/* Blended with the page so the brackets and dot turn dark over accent-colored fills. */}
      <div className="pcn-cursor-layer pcn-cursor-blend">
        <div ref={ringRef} className="pcn-cursor-ring" data-hover="false" data-pressed="false">
          <span className="pcn-cursor-frame">
            <span className="pcn-cursor-corner top-0 left-0 border-t-2 border-l-2" />
            <span className="pcn-cursor-corner top-0 right-0 border-t-2 border-r-2" />
            <span className="pcn-cursor-corner bottom-0 left-0 border-b-2 border-l-2" />
            <span className="pcn-cursor-corner right-0 bottom-0 border-r-2 border-b-2" />
          </span>
        </div>
        <div ref={dotRef} className="pcn-cursor-dot" />
      </div>
      <div className="pcn-cursor-layer">
        <div ref={burstRef} />
        <span ref={labelRef} className="pcn-cursor-label" data-hover="false" />
      </div>
    </div>
  );
}
