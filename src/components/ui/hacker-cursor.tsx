'use client';

import { useEffect, useRef } from 'react';

const INTERACTIVE =
  'a[href], button:not(:disabled), [role="button"], [role="tab"], [role="option"], [role="menuitem"], [role="checkbox"], [role="switch"], select, summary, label[for], [data-cursor]';
const TEXT_FIELD =
  'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="button"]):not([type="submit"]), textarea, [contenteditable=""], [contenteditable="true"]';
const HEX = '0123456789ABCDEF';
const PARTICLES = 10;
const RING_SIZE = 26;
const RING_HOVER_SIZE = 42;

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
 * native I-beam. Off for touch, pens and reduced motion. Inside PCN OS each window draws its own
 * cursor, and the desktop hides its cursor while the pointer is over a window.
 */
export function HackerCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const burstRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!finePointer.matches || reducedMotion.matches) return;

    const dot = dotRef.current!;
    const ring = ringRef.current!;
    const label = labelRef.current!;
    const burst = burstRef.current!;
    const root = document.documentElement;
    root.classList.add('pcn-cursor');

    const target = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    let ringSize = RING_SIZE;
    let targetSize = RING_SIZE;
    let visible = false;
    let pressed = false;
    let frame = 0;

    const render = () => {
      frame = 0;
      // Ease the brackets towards the pointer; snap once they're close enough to stop the loop.
      ringPos.x += (target.x - ringPos.x) * 0.22;
      ringPos.y += (target.y - ringPos.y) * 0.22;
      ringSize += (targetSize - ringSize) * 0.25;
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

      if (!settled) frame = requestAnimationFrame(render);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };

    const setVisible = (value: boolean) => {
      if (visible === value) return;
      visible = value;
      root.classList.toggle('pcn-cursor-hidden', !value);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return setVisible(false);
      target.x = event.clientX;
      target.y = event.clientY;
      if (!visible) {
        // Appear where the mouse is instead of flying in from the last position.
        ringPos.x = target.x;
        ringPos.y = target.y;
      }
      const element = event.target instanceof Element ? event.target : null;
      // Over a PCN OS window the page inside draws its own cursor.
      const overFrame = element?.tagName === 'IFRAME';
      const inText = !!element?.closest(TEXT_FIELD);
      setVisible(!overFrame && !inText);

      const interactive = element?.closest(INTERACTIVE);
      const hovering = !!interactive && !inText;
      targetSize = hovering ? RING_HOVER_SIZE : RING_SIZE;
      ring.dataset.hover = String(hovering);
      label.textContent = hovering && interactive ? labelFor(interactive) : '';
      schedule();
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

    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      pressed = true;
      ring.dataset.pressed = 'true';
      schedule();
    };
    const onUp = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      pressed = false;
      ring.dataset.pressed = 'false';
      if (visible) spawnBurst(event.clientX, event.clientY);
      schedule();
    };
    const onLeave = () => setVisible(false);

    setVisible(false);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('blur', onLeave);

    return () => {
      cancelAnimationFrame(frame);
      root.classList.remove('pcn-cursor', 'pcn-cursor-hidden');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', onLeave);
    };
  }, []);

  return (
    <div aria-hidden className="pcn-cursor-layer">
      <div ref={burstRef} />
      <div ref={ringRef} className="pcn-cursor-ring" data-hover="false" data-pressed="false">
        <span className="pcn-cursor-frame">
          <span className="pcn-cursor-corner left-0 top-0 border-l-2 border-t-2" />
          <span className="pcn-cursor-corner right-0 top-0 border-r-2 border-t-2" />
          <span className="pcn-cursor-corner bottom-0 left-0 border-b-2 border-l-2" />
          <span className="pcn-cursor-corner bottom-0 right-0 border-b-2 border-r-2" />
        </span>
        <span ref={labelRef} className="pcn-cursor-label" />
      </div>
      <div ref={dotRef} className="pcn-cursor-dot" />
    </div>
  );
}
