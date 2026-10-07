// Submit/cancel row that stays pinned to the bottom while a long form scrolls, so saving never
// means scrolling back down. On phones it rides above the fixed tab bar (h-16 plus the safe area),
// which is hidden on md+ and inside PCN OS windows.
export const formActionBarClassName =
  'sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 bg-background/90 py-3 backdrop-blur-sm embedded:bottom-0 md:bottom-0';

// Same idea inside a scrolling dialog: the panel is the scroll container and has p-6, so the bar
// bleeds over that padding to sit flush with the panel's edges. The tab bar is hidden while a
// dialog is open (see globals.css).
export const dialogFormActionBarClassName =
  'sticky -bottom-6 z-20 -mx-6 border-t border-pcnGreen-200 bg-background/90 px-6 py-3 backdrop-blur-sm';
