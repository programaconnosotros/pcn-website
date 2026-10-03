'use client';

import { useEffect } from 'react';

import { HAS_PSEUDO_RE, forceSelector, splitSelectorList } from './forced-state';

const forceRules = (rules: CSSRuleList): string => {
  let css = '';
  for (const rule of Array.from(rules)) {
    if (rule instanceof CSSStyleRule) {
      if (!HAS_PSEUDO_RE.test(rule.selectorText)) continue;
      const selectors = splitSelectorList(rule.selectorText)
        .map(forceSelector)
        .filter((selector): selector is string => selector !== null);
      if (selectors.length) css += `${selectors.join(',')}{${rule.style.cssText}}\n`;
    } else if (rule instanceof CSSMediaRule) {
      const inner = forceRules(rule.cssRules);
      if (inner) css += `@media ${rule.conditionText}{${inner}}\n`;
    } else if (rule instanceof CSSSupportsRule) {
      const inner = forceRules(rule.cssRules);
      if (inner) css += `@supports ${rule.conditionText}{${inner}}\n`;
    }
  }
  return css;
};

const STYLE_ID = 'design-system-forced-states';

/**
 * Lets the design system page show hover, focus and active states without anyone touching the
 * component: it copies every interaction rule in the page's stylesheets into a version keyed on
 * a `data-force-state` wrapper (the same trick as Storybook's pseudo-states addon). The examples
 * render the real components, so what you see is exactly what the site ships.
 */
export const ForcedStateStyles = () => {
  useEffect(() => {
    let frame = 0;
    const build = () => {
      let css = '';
      for (const sheet of Array.from(document.styleSheets)) {
        if (sheet.ownerNode instanceof HTMLElement && sheet.ownerNode.id === STYLE_ID) continue;
        try {
          css += forceRules(sheet.cssRules);
        } catch {
          // Cross-origin stylesheets (e.g. fonts) can't be read; they have no states to force.
        }
      }
      let style = document.getElementById(STYLE_ID);
      if (!style) {
        style = document.createElement('style');
        style.id = STYLE_ID;
        document.head.appendChild(style);
      }
      // Appended last, so on equal specificity the forced copy wins like the real state would.
      document.head.appendChild(style);
      style.textContent = css;
    };
    build();

    // Stylesheets that arrive later (route chunks, dev reloads) get their states forced too.
    const observer = new MutationObserver((mutations) => {
      const external = mutations.some((mutation) =>
        Array.from(mutation.addedNodes).some(
          (node) => node instanceof HTMLElement && node.id !== STYLE_ID,
        ),
      );
      if (!external) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(build);
    });
    observer.observe(document.head, { childList: true });

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      document.getElementById(STYLE_ID)?.remove();
    };
  }, []);

  return null;
};
