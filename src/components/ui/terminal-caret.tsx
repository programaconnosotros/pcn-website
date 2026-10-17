'use client';

import { useEffect, useRef } from 'react';

const FIELD = '.field-surface';
const TEXT_TYPES = new Set(['text', 'email', 'password', 'search', 'url', 'tel', 'number', '']);

// Styles that decide where text lands inside a field; the mirror copies them to measure the caret.
const MIRRORED = [
  'boxSizing',
  'width',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderStyle',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'fontStyle',
  'fontVariant',
  'fontWeight',
  'fontStretch',
  'fontSize',
  'lineHeight',
  'fontFamily',
  'textAlign',
  'textTransform',
  'textIndent',
  'letterSpacing',
  'wordSpacing',
  'tabSize',
] as const;

type Field = HTMLInputElement | HTMLTextAreaElement;

// Touch keyboards (iOS especially) shift fixed elements around while they're open, so the
// drawn block lands off the field or not at all. Phones and tablets keep the native caret.
const hasFinePointer = () => window.matchMedia('(pointer: fine)').matches;

const isField = (target: EventTarget | null): target is Field =>
  hasFinePointer() &&
  (target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLInputElement && TEXT_TYPES.has(target.type))) &&
  target.matches(FIELD) &&
  !target.readOnly &&
  !target.disabled &&
  // Some input types (number, email) don't expose the caret position; they keep the native one.
  target.selectionStart !== null;

/**
 * The block caret for form fields. A native block caret paints over the character under it
 * without inverting it, so the letter becomes unreadable. Instead the native caret is hidden
 * on the focused field and this draws a green block at the caret position with that character
 * in black on top, measured with an off-screen mirror of the field. While it blinks off, the
 * field's own text shows through. Only on mouse/trackpad devices; see hasFinePointer.
 */
export function TerminalCaret() {
  const caretRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const caret = caretRef.current;
    if (!caret) return;

    const mirror = document.createElement('div');
    Object.assign(mirror.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      visibility: 'hidden',
      overflow: 'hidden',
      pointerEvents: 'none',
    });
    const marker = document.createElement('span');

    let field: Field | null = null;
    let frame = 0;

    const hide = () => {
      caret.style.display = 'none';
    };

    const draw = () => {
      frame = 0;
      if (!field || field.selectionStart === null) return hide();
      const { selectionStart: start, selectionEnd: end, value } = field;
      if (start !== end) return hide();

      const style = getComputedStyle(field);
      const isInput = field instanceof HTMLInputElement;
      for (const key of MIRRORED) mirror.style[key] = style[key];
      mirror.style.whiteSpace = isInput ? 'pre' : 'pre-wrap';
      mirror.style.overflowWrap = isInput ? 'normal' : 'break-word';
      mirror.style.height = 'auto';

      const masked = isInput && field.type === 'password';
      const before = value.slice(0, start);
      const char = value[start];
      mirror.textContent = masked ? '•'.repeat(before.length) : before;
      marker.textContent = !char || char === '\n' ? ' ' : masked ? '•' : char;
      mirror.appendChild(marker);
      if (!mirror.isConnected) document.body.appendChild(mirror);

      const rect = field.getBoundingClientRect();
      const borderLeft = parseFloat(style.borderLeftWidth);
      const borderTop = parseFloat(style.borderTopWidth);
      const width = marker.offsetWidth;
      const height = marker.offsetHeight;
      const left = rect.left + borderLeft + marker.offsetLeft - field.scrollLeft;
      // Browsers center a single-line input's text vertically, whatever its height.
      const top = isInput
        ? rect.top + (rect.height - height) / 2
        : rect.top + borderTop + marker.offsetTop - field.scrollTop;

      const outside =
        left < rect.left + borderLeft - 1 ||
        left + width > rect.right - parseFloat(style.borderRightWidth) + 1 ||
        top < rect.top ||
        top + height > rect.bottom;
      if (outside) return hide();

      caret.textContent = marker.textContent;
      Object.assign(caret.style, {
        display: 'block',
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
        font: style.font,
        // The block is as tall as the glyph box, not the field's line box; a taller line-height
        // would push the character below the block.
        lineHeight: `${height}px`,
        letterSpacing: style.letterSpacing,
      });
      caret.dataset.invalid = String(field.getAttribute('aria-invalid') === 'true');
      // Restart the blink so the caret stays solid while typing or moving.
      caret.classList.remove('terminal-caret-blink');
      void caret.offsetWidth;
      caret.classList.add('terminal-caret-blink');
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    const release = () => {
      if (field) field.style.caretColor = '';
      field = null;
      hide();
    };

    const onFocusIn = (event: FocusEvent) => {
      release();
      if (!isField(event.target)) return;
      field = event.target;
      field.style.caretColor = 'transparent';
      schedule();
    };
    const onFocusOut = (event: FocusEvent) => {
      if (event.target === field) release();
    };

    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    document.addEventListener('selectionchange', schedule);
    document.addEventListener('input', schedule, true);
    document.addEventListener('keydown', schedule, true);
    document.addEventListener('pointerup', schedule, true);
    window.addEventListener('scroll', schedule, true);
    window.addEventListener('resize', schedule);
    if (isField(document.activeElement)) {
      field = document.activeElement;
      field.style.caretColor = 'transparent';
      schedule();
    }

    return () => {
      cancelAnimationFrame(frame);
      release();
      mirror.remove();
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
      document.removeEventListener('selectionchange', schedule);
      document.removeEventListener('input', schedule, true);
      document.removeEventListener('keydown', schedule, true);
      document.removeEventListener('pointerup', schedule, true);
      window.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  return <div ref={caretRef} aria-hidden className="terminal-caret" style={{ display: 'none' }} />;
}
