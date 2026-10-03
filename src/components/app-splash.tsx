// Launch screen for the installed app. It is part of the first HTML, so it covers the black
// screen from the very first paint without waiting for any JavaScript. It only shows in
// standalone mode (never in a browser tab or a PCN OS window), fades out as soon as the app
// hydrates (`data-app-ready`, set by PwaProvider) and, whatever happens, fades out by itself
// after a few seconds so it can never trap the user.
const SPLASH_CSS = `
#pcn-splash{display:none}
@media (display-mode:standalone){
  #pcn-splash{position:fixed;inset:0;z-index:2147483647;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;background:#000;pointer-events:none;animation:pcn-splash-out .35s ease 4s forwards}
  html[data-app-ready] #pcn-splash{animation:pcn-splash-out .25s ease forwards}
}
html[data-embedded] #pcn-splash{display:none}
#pcn-splash img{width:96px;height:96px;animation:pcn-splash-pulse 1.6s ease-in-out infinite}
#pcn-splash p{margin:0;font:13px/1 var(--font-geist-mono),ui-monospace,monospace;color:rgba(255,255,255,.55)}
#pcn-splash .g{color:#04f4be}
#pcn-splash .c{color:#04f4be;animation:pcn-splash-blink 1s steps(1) infinite}
@keyframes pcn-splash-out{to{opacity:0;visibility:hidden}}
@keyframes pcn-splash-pulse{50%{opacity:.7;transform:scale(.96)}}
@keyframes pcn-splash-blink{50%{opacity:0}}
@media (prefers-reduced-motion:reduce){#pcn-splash img,#pcn-splash .c{animation:none}}
`;

export function AppSplash() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SPLASH_CSS }} />
      <div id="pcn-splash" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- must load before any JS */}
        <img src="/pwa-icon-192.png" alt="" width={96} height={96} decoding="async" />
        <p>
          <span className="g">~/pcn $ </span>iniciando<span className="c">_</span>
        </p>
      </div>
    </>
  );
}
