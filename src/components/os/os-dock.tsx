'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type MouseEvent } from 'react';
import {
  motion,
  useAnimationControls,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProgramIcon } from './program-icon';
import type { OsProgram } from './programs';

/** Widest a dock item gets at rest; items shrink below this so the whole dock fits the screen. */
const MAX_ITEM_WIDTH = 62;
const MIN_ITEM_WIDTH = 40;
/** Screen margin, dock padding and border around the items. */
const DOCK_CHROME_WIDTH = 16 + 16 + 2;
const DIVIDER_WIDTH = 16;
const ITEM_GAP = 2;
/** Most an item grows (as a fraction of its width) when the cursor is right over it. */
const MAX_MAGNIFICATION = 0.55;
/** Room the label, the gaps and the activity meter take under each icon. */
const ITEM_TEXT_HEIGHT = 22;

const SCRAMBLE_GLYPHS = '!<>-_\\/[]{}=+*^?#01ｱｲｳｴｵｶｷ';

const subscribeToResize = (onChange: () => void) => {
  window.addEventListener('resize', onChange);
  return () => window.removeEventListener('resize', onChange);
};

const useViewportWidth = () =>
  useSyncExternalStore(
    subscribeToResize,
    () => window.innerWidth,
    () => 0,
  );

/** Width for each dock item so every item fits on screen, however many programs are open. */
const dockItemWidth = (viewportWidth: number, items: number, dividers: number) => {
  if (!viewportWidth) return MAX_ITEM_WIDTH;
  const available =
    viewportWidth - DOCK_CHROME_WIDTH - dividers * DIVIDER_WIDTH - (items + dividers) * ITEM_GAP;
  return Math.max(MIN_ITEM_WIDTH, Math.min(MAX_ITEM_WIDTH, Math.floor(available / items)));
};

/** How much the hovered item may grow without the magnified dock running off the screen. */
const dockMagnification = (
  viewportWidth: number,
  itemWidth: number,
  items: number,
  dividers: number,
) => {
  if (!viewportWidth) return 0;
  const restingWidth =
    DOCK_CHROME_WIDTH +
    items * itemWidth +
    dividers * DIVIDER_WIDTH +
    (items + dividers) * ITEM_GAP;
  // The fisheye curve widens the hovered item and its neighbours by ~2.4 items' worth at most.
  const spare = viewportWidth - restingWidth;
  return Math.max(0, Math.min(MAX_MAGNIFICATION, spare / (2.4 * itemWidth)));
};

/** A short, stable hex "pid" per program, shown in its tooltip. */
const pidFor = (id: string) =>
  [...id]
    .reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) & 0xffff, 7)
    .toString(16)
    .padStart(4, '0');

/** Text that decodes from random glyphs into `text`, left to right. Starts on mount. */
const useScrambledText = (text: string) => {
  const [output, setOutput] = useState('');
  useEffect(() => {
    const frames = 14;
    let frame = 0;
    const timer = window.setInterval(() => {
      frame += 1;
      const revealed = Math.floor((frame / frames) * text.length);
      setOutput(
        [...text]
          .map((char, i) =>
            i < revealed || char === ' '
              ? char
              : SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)],
          )
          .join(''),
      );
      if (frame >= frames) window.clearInterval(timer);
    }, 26);
    return () => window.clearInterval(timer);
  }, [text]);
  return output;
};

/** Types `text` out one character at a time. Remount it (via `key`) to type a new command. */
function TypedCommand({ text }: { text: string }) {
  const [typed, setTyped] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => {
      setTyped((count) => {
        if (count >= text.length) window.clearInterval(timer);
        return Math.min(count + 1, text.length);
      });
    }, 22);
    return () => window.clearInterval(timer);
  }, [text]);
  return <span className="text-glow text-pcnGreen">{text.slice(0, typed)}</span>;
}

/** Floating terminal tag above the hovered icon. */
function DockTooltip({ name, pid }: { name: string; pid: string }) {
  const scrambled = useScrambledText(name.toLowerCase());
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-20 -translate-x-1/2 whitespace-nowrap"
    >
      <motion.span
        initial={{ opacity: 0, y: 6, scaleX: 0.6 }}
        animate={{ opacity: 1, y: 0, scaleX: 1 }}
        transition={{ duration: 0.18, ease: [0.2, 0.9, 0.2, 1] }}
        className="text-glow relative block border border-pcnGreen-600 bg-black/95 px-2 py-1 font-mono text-[11px] leading-none text-pcnGreen shadow-[0_0_20px_-4px_#04f4be]"
      >
        <span className="text-pcnGreen-500">[</span> {scrambled}{' '}
        <span className="text-pcnGreen-500">]</span>
        <span className="ml-2 text-[9px] text-pcnGreen-500">pid:{pid}</span>
        {/* Pointer down to the icon. */}
        <span className="absolute left-1/2 top-full block size-1.5 -translate-x-1/2 -translate-y-[3px] rotate-45 border-b border-r border-pcnGreen-600 bg-black" />
      </motion.span>
    </span>
  );
}

/** Ring, flash and a spray of bits that fly off an icon when its program launches. */
function LaunchBurst({ seed }: { seed: number }) {
  const bits = Array.from({ length: 10 }, (_, i) => {
    const angle = ((i * 36 + seed * 17) * Math.PI) / 180;
    const reach = 34 + ((i * 7 + seed * 5) % 4) * 9;
    return { x: Math.cos(angle) * reach, y: Math.sin(angle) * reach - 10, bit: (i + seed) % 2 };
  });
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 z-10">
      <motion.span
        className="absolute inset-0 rounded-md border-2 border-pcnGreen"
        initial={{ scale: 0.7, opacity: 1 }}
        animate={{ scale: 2.4, opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
      <motion.span
        className="absolute inset-0 rounded-md bg-pcnGreen mix-blend-screen"
        initial={{ opacity: 0.7 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
      />
      {bits.map(({ x, y, bit }, i) => (
        <motion.span
          key={i}
          className="text-glow absolute left-1/2 top-1/2 -ml-1 -mt-2 font-mono text-[10px] font-bold text-pcnGreen"
          initial={{ x: 0, y: 0, opacity: 1, scale: 1.2 }}
          animate={{ x, y, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.7, ease: [0.1, 0.8, 0.3, 1], delay: i * 0.012 }}
        >
          {bit}
        </motion.span>
      ))}
    </span>
  );
}

/** Running state under each icon: a bright bar for the focused program, a live meter otherwise. */
function ActivityMeter({ running, focused }: { running: boolean; focused: boolean }) {
  if (focused) {
    return (
      <span
        aria-hidden
        className="h-[3px] w-4 bg-pcnGreen shadow-[0_0_8px_#04f4be,0_0_2px_#04f4be]"
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        'flex h-1 items-end gap-px transition-opacity',
        running ? 'opacity-100' : 'opacity-0',
      )}
    >
      {[0, 1, 2].map((bar) => (
        <span
          key={bar}
          className="os-dock-meter h-full w-[2px] origin-bottom bg-pcnGreen-800"
          style={{ animationDelay: `${bar * -0.27}s` }}
        />
      ))}
    </span>
  );
}

interface DockItemProps {
  id: string;
  program: Pick<OsProgram, 'name' | 'icon'>;
  running: boolean;
  focused: boolean;
  hovered: boolean;
  index: number;
  mouseX: MotionValue<number>;
  baseWidth: number;
  magnification: number;
  onHover: (id: string | null) => void;
  onClick: () => void;
}

const DockItem = ({
  id,
  program,
  running,
  focused,
  hovered,
  index,
  mouseX,
  baseWidth,
  magnification,
  onHover,
  onClick,
}: DockItemProps) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [launches, setLaunches] = useState(0);
  const iconControls = useAnimationControls();
  const reduceMotion = useReducedMotion();

  const baseIcon = Math.min(36, baseWidth - 12);
  // Read through refs so the fisheye always uses the latest sizes without resubscribing.
  const sizing = useRef({ baseWidth, magnification });
  useEffect(() => {
    sizing.current = { baseWidth, magnification };
  }, [baseWidth, magnification]);

  const targetWidth = useTransform(mouseX, (x) => {
    const { baseWidth: base, magnification: boost } = sizing.current;
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds || !Number.isFinite(x)) return base;
    const distance = Math.abs(x - (bounds.left + bounds.width / 2));
    const range = base * 2.6;
    if (distance >= range) return base;
    // Cosine falloff: smooth like a lens rather than a triangle.
    const falloff = (Math.cos((distance / range) * Math.PI) + 1) / 2;
    return base * (1 + boost * falloff);
  });
  const width = useSpring(targetWidth, { mass: 0.1, stiffness: 190, damping: 14 });
  const iconSize = useTransform(width, (w) => (w / baseWidth) * baseIcon);

  const launch = () => {
    setLaunches((count) => count + 1);
    if (!reduceMotion) {
      void iconControls.start({
        y: [0, -18, 0, -6, 0],
        x: [0, -2, 3, -1, 0],
        filter: [
          'drop-shadow(-4px 0px 0px rgba(255,0,92,0.9)) drop-shadow(4px 0px 0px rgba(0,229,255,0.9))',
          'drop-shadow(3px 0px 0px rgba(255,0,92,0.7)) drop-shadow(-3px 0px 0px rgba(0,229,255,0.7))',
          'drop-shadow(-2px 0px 0px rgba(255,0,92,0.4)) drop-shadow(2px 0px 0px rgba(0,229,255,0.4))',
          'drop-shadow(0px 0px 0px rgba(255,0,92,0)) drop-shadow(0px 0px 0px rgba(0,229,255,0))',
          'drop-shadow(0px 0px 0px rgba(255,0,92,0)) drop-shadow(0px 0px 0px rgba(0,229,255,0))',
        ],
        transition: { duration: 0.65, ease: 'easeOut' },
      });
    }
    onClick();
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={launch}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(id)}
      onBlur={() => onHover(null)}
      aria-label={program.name}
      initial={reduceMotion ? false : { opacity: 0, y: 24, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ delay: 0.25 + index * 0.035, type: 'spring', stiffness: 260, damping: 20 }}
      style={{ width, height: baseIcon + ITEM_TEXT_HEIGHT }}
      className="group relative flex shrink-0 flex-col items-center justify-end gap-0.5 rounded-md outline-none focus-visible:ring-1 focus-visible:ring-pcnGreen"
    >
      {/* Anchored above the label so the icon grows upwards out of the dock when magnified. */}
      <span
        className="absolute inset-x-0 flex justify-center"
        style={{ bottom: ITEM_TEXT_HEIGHT - 3 }}
      >
        <motion.span
          animate={iconControls}
          style={{ width: iconSize, height: iconSize }}
          className="relative block shrink-0"
        >
          {hovered && <DockTooltip name={program.name} pid={pidFor(id)} />}
          <ProgramIcon
            program={program}
            running={running}
            className="size-full [&>svg]:size-[62%] [&>svg]:transition-transform [&>svg]:duration-300 group-hover:[&>svg]:scale-110"
          />
          {launches > 0 && <LaunchBurst key={launches} seed={launches} />}
        </motion.span>
      </span>
      <span
        className={cn(
          'w-full truncate text-center font-mono text-[10px] lowercase leading-3 transition-colors',
          hovered || focused ? 'text-glow text-pcnGreen' : 'text-pcnGreen-600',
        )}
      >
        {program.name}
      </span>
      <ActivityMeter running={running} focused={focused} />
    </motion.button>
  );
};

const Divider = () => (
  <span
    aria-hidden
    className="relative mx-[7px] mb-5 h-7 w-px shrink-0 self-end overflow-hidden bg-gradient-to-t from-transparent via-pcnGreen-400 to-transparent"
  >
    <span className="os-dock-divider absolute inset-x-0 h-2 bg-pcnGreen shadow-[0_0_6px_#04f4be]" />
  </span>
);

/** Corner brackets drawn just outside the dock frame, like a HUD target. */
const HudCorners = () => (
  <span aria-hidden className="pointer-events-none absolute -inset-[5px]">
    <span className="absolute left-0 top-0 size-2.5 border-l border-t border-pcnGreen-700" />
    <span className="absolute right-0 top-0 size-2.5 border-r border-t border-pcnGreen-700" />
    <span className="absolute bottom-0 left-0 size-2.5 border-b border-l border-pcnGreen-700" />
    <span className="absolute bottom-0 right-0 size-2.5 border-b border-r border-pcnGreen-700" />
  </span>
);

const LAUNCHER_ID = 'programas';

interface OsDockProps {
  programs: OsProgram[];
  runningPrograms: OsProgram[];
  runningProgramIds: Set<string>;
  focusedProgramId: string | null;
  onOpenProgram: (program: OsProgram) => void;
  onOpenLauncher: () => void;
}

/**
 * Dock pinned to the bottom of the desktop: a terminal command bar where icons magnify under the
 * cursor like a lens, the prompt types the command for whatever is hovered, a light beam runs
 * around the frame and launching a program bursts it with a glitch. Items shrink as programs open
 * so the dock always fits the screen without scrolling.
 */
export function OsDock({
  programs,
  runningPrograms,
  runningProgramIds,
  focusedProgramId,
  onOpenProgram,
  onOpenLauncher,
}: OsDockProps) {
  const reduceMotion = useReducedMotion();
  const pinned = programs.filter((program) => program.pinned);
  const unpinnedRunning = runningPrograms.filter((program) => !program.pinned);
  const viewportWidth = useViewportWidth();
  const items = pinned.length + unpinnedRunning.length + 1;
  const dividers = unpinnedRunning.length > 0 ? 2 : 1;
  const itemWidth = dockItemWidth(viewportWidth, items, dividers);
  const magnification = reduceMotion
    ? 0
    : dockMagnification(viewportWidth, itemWidth, items, dividers);

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const mouseX = useMotionValue(Infinity);
  const spotX = useMotionValue(0);
  const spotOpacity = useSpring(0, { stiffness: 200, damping: 30 });
  const spotlight = useMotionTemplate`radial-gradient(160px circle at ${spotX}px 100%, rgba(4,244,190,0.16), transparent 70%)`;

  const onMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    mouseX.set(event.clientX);
    spotX.set(event.clientX - event.currentTarget.getBoundingClientRect().left);
    spotOpacity.set(1);
  };
  const onMouseLeave = () => {
    mouseX.set(Infinity);
    spotOpacity.set(0);
  };

  const hoveredProgram = programs.find((program) => program.id === hoveredId);
  const command =
    hoveredId === LAUNCHER_ID
      ? 'ls ~/programas'
      : hoveredProgram
        ? `open ${hoveredProgram.url}`
        : '';

  const itemProps = (id: string, index: number) => ({
    id,
    index,
    mouseX,
    baseWidth: itemWidth,
    magnification,
    hovered: hoveredId === id,
    focused: focusedProgramId === id,
    onHover: setHoveredId,
  });

  return (
    <motion.nav
      aria-label="Dock"
      initial={reduceMotion ? false : { y: 140, opacity: 0, scaleX: 0.4 }}
      animate={{ y: 0, opacity: 1, scaleX: 1 }}
      transition={{ type: 'spring', stiffness: 140, damping: 18, mass: 0.9 }}
      className="fixed bottom-2 left-1/2 z-[5000] max-w-[calc(100vw-16px)]"
      style={{ x: '-50%' }}
    >
      <HudCorners />

      {/* Live prompt: types out the command for the hovered program. */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-3 top-0 z-30 flex -translate-y-1/2 items-center gap-1 bg-black px-1.5 font-mono text-[9px] tracking-widest text-pcnGreen-600"
      >
        ~/pcn ${command && <TypedCommand key={command} text={command} />}
        <span className="os-dock-caret inline-block h-2 w-1.5 bg-pcnGreen" />
      </span>

      {/* Process counter. */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-3 top-0 z-30 flex -translate-y-1/2 items-center gap-1.5 bg-black px-1.5 font-mono text-[9px] tracking-widest text-pcnGreen-600"
      >
        <span
          className={cn(
            'size-1.5 rounded-full',
            runningPrograms.length > 0
              ? 'animate-pulse bg-pcnGreen shadow-[0_0_6px_#04f4be]'
              : 'bg-pcnGreen-400',
          )}
        />
        {String(runningPrograms.length).padStart(2, '0')} proc
      </span>

      <div className="relative rounded-md shadow-[0_0_40px_-10px_#04f4be88,0_24px_70px_-12px_rgba(0,0,0,0.95)]">
        {/* Frame: a faint border with a light beam running around it. */}
        <span
          aria-hidden
          className="os-dock-frame pointer-events-none absolute inset-0 z-10 rounded-md"
        />

        <div
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          className="relative flex items-end gap-0.5 rounded-md bg-black/85 px-2 pb-1 pt-2 backdrop-blur-xl"
        >
          {/* Surface effects, clipped to the dock. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-md"
          >
            <motion.span
              className="absolute inset-0"
              style={{ backgroundImage: spotlight, opacity: spotOpacity }}
            />
            <span className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0,transparent_2px,rgba(4,244,190,0.035)_2px,rgba(4,244,190,0.035)_3px)]" />
            <span className="absolute inset-0 bg-[linear-gradient(rgba(4,244,190,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(4,244,190,0.05)_1px,transparent_1px)] bg-[size:12px_12px] [mask-image:linear-gradient(to_top,black,transparent_80%)]" />
            <span className="os-dock-sweep absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-pcnGreen-200 to-transparent" />
          </span>

          {pinned.map((program, index) => (
            <DockItem
              key={program.id}
              {...itemProps(program.id, index)}
              program={program}
              running={runningProgramIds.has(program.id)}
              onClick={() => onOpenProgram(program)}
            />
          ))}
          {unpinnedRunning.length > 0 && <Divider />}
          {unpinnedRunning.map((program, index) => (
            <DockItem
              key={program.id}
              {...itemProps(program.id, pinned.length + index)}
              program={program}
              running
              onClick={() => onOpenProgram(program)}
            />
          ))}
          <Divider />
          <DockItem
            {...itemProps(LAUNCHER_ID, items - 1)}
            program={{ name: 'Programas', icon: LayoutGrid }}
            running={false}
            onClick={onOpenLauncher}
          />
        </div>
      </div>
    </motion.nav>
  );
}
