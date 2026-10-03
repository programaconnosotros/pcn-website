// The heavy half of PCN OS: everything that only shows once the desktop is running (dock,
// windows, desktop widgets, launcher, background music) plus the animation library they use.
// pcn-os.tsx imports it on demand, so phones, tablets and the pages inside OS windows never
// download it. The menu bar and the wallpaper stay in pcn-os.tsx: they are the first paint.
export { AnimatePresence } from 'motion/react';
export { BackgroundMusicPlayer } from '@/components/music/music-player-dialog';
export { OsDock } from './os-dock';
export { OsLauncher } from './os-launcher';
export { OsPhotos } from './os-photos';
export { OsProcesses } from './os-processes';
export { OsWindow } from './os-window';
