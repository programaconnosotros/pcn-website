// Kept apart from os-display-mode.ts (a client module with hooks) because the root layout, a
// server component, inlines OS_MODE_SCRIPT: constants from a 'use client' file reach server
// components as client references, not as strings.

/** The mode the visitor picked; it always wins over detection. */
export const STORAGE_KEY = 'pcn-os-mode';
/** Set when the desktop measured itself running slow, so the next visit starts in `lite`. */
export const AUTO_KEY = 'pcn-os-auto-mode';
export const MODE_ATTR = 'data-os-mode';
/** Present while the mode came from detection rather than from the visitor's choice. */
export const AUTO_ATTR = 'data-os-mode-auto';

/**
 * Inline script for the root layout `<head>`, next to the embed detection. It picks the mode
 * before paint so the right layout shows from the first frame: the stored choice, else a
 * previous slow measurement, else the hardware (4 or fewer cores, 4 GB of memory or less, or
 * data saver on) decides between `full` and `lite`. Windows run it too and agree with the host.
 */
export const OS_MODE_SCRIPT = `(function(){var d=document.documentElement,m=null,a=null;try{m=localStorage.getItem('${STORAGE_KEY}');a=localStorage.getItem('${AUTO_KEY}')}catch(e){}if(m!=='full'&&m!=='lite'&&m!=='classic'){var n=navigator,c=n.connection;m=a==='lite'||(n.hardwareConcurrency&&n.hardwareConcurrency<=4)||(n.deviceMemory&&n.deviceMemory<=4)||(c&&c.saveData)?'lite':'full';if(m==='lite')d.setAttribute('${AUTO_ATTR}','')}if(m!=='full')d.setAttribute('${MODE_ATTR}',m)})();`;
