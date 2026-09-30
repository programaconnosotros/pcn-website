import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

const GREEN = '#04f4be';
const FONT_DIR = join(process.cwd(), 'node_modules/geist/dist/fonts/geist-mono');

interface TerminalCardProps {
  /** Path shown after `~/`, e.g. `cursos/git-and-github`. */
  path: string;
  /** Command on the first line, e.g. `cat curso.md`. */
  command: string;
  title: string;
  description?: string;
  /** Short facts rendered as chips in the footer, e.g. `4 horas`. */
  meta?: string[];
}

// Satori has no reliable multi-line clamp, so trim long strings up front.
const truncate = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;

const collapseWhitespace = (text: string) => text.replace(/\s+/g, ' ').trim();

let fontsPromise: Promise<{ regular: Buffer; bold: Buffer }> | null = null;
const loadFonts = () =>
  (fontsPromise ??= Promise.all([
    readFile(join(FONT_DIR, 'GeistMono-Regular.ttf')),
    readFile(join(FONT_DIR, 'GeistMono-Bold.ttf')),
  ]).then(([regular, bold]) => ({ regular, bold })));

const Corner = ({ top, left }: { top: boolean; left: boolean }) => (
  <div
    style={{
      position: 'absolute',
      width: 36,
      height: 36,
      [top ? 'top' : 'bottom']: 28,
      [left ? 'left' : 'right']: 28,
      [top ? 'borderTop' : 'borderBottom']: `4px solid ${GREEN}`,
      [left ? 'borderLeft' : 'borderRight']: `4px solid ${GREEN}`,
    }}
  />
);

// Link-preview card in the PCN terminal style: a panel with lit corner brackets, the page's
// path as a prompt, the title in large mono type and a footer with the site's address.
export async function renderTerminalCard({
  path,
  command,
  title,
  description,
  meta = [],
}: TerminalCardProps) {
  const { regular, bold } = await loadFonts();
  const cleanTitle = truncate(collapseWhitespace(title), 90);
  const titleSize = cleanTitle.length > 60 ? 50 : cleanTitle.length > 32 ? 60 : 72;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          backgroundColor: '#000',
          backgroundImage: `radial-gradient(circle at 80% 0%, rgba(4,244,190,0.18), transparent 55%), linear-gradient(rgba(4,244,190,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(4,244,190,0.05) 1px, transparent 1px)`,
          backgroundSize: '100% 100%, 40px 40px, 40px 40px',
          fontFamily: 'Geist Mono',
          color: '#e5e5e5',
        }}
      >
        <Corner top left />
        <Corner top left={false} />
        <Corner top={false} left />
        <Corner top={false} left={false} />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            margin: 48,
            border: '1px solid rgba(4,244,190,0.35)',
            backgroundColor: 'rgba(0,0,0,0.6)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '18px 28px',
              borderBottom: '1px dashed rgba(4,244,190,0.3)',
              fontSize: 22,
            }}
          >
            <div style={{ display: 'flex', color: GREEN, fontWeight: 700 }}>{'<> PCN_OS'}</div>
            <div style={{ display: 'flex', color: 'rgba(4,244,190,0.7)' }}>
              {truncate(`~/${path}`, 48)}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              padding: '32px 40px 0',
              gap: 20,
            }}
          >
            <div style={{ display: 'flex', fontSize: 24, color: 'rgba(229,229,229,0.6)' }}>
              <span style={{ color: 'rgba(4,244,190,0.7)', marginRight: 14 }}>$</span>
              {command}
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: titleSize,
                fontWeight: 700,
                lineHeight: 1.15,
                color: '#fff',
                textShadow: '0 0 24px rgba(4,244,190,0.45)',
              }}
            >
              {cleanTitle}
            </div>
            {description && (
              <div
                style={{
                  display: 'flex',
                  fontSize: 26,
                  lineHeight: 1.45,
                  color: 'rgba(229,229,229,0.72)',
                }}
              >
                {truncate(collapseWhitespace(description), 150)}
              </div>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '20px 28px',
              borderTop: '1px dashed rgba(4,244,190,0.3)',
              fontSize: 22,
            }}
          >
            {meta.slice(0, 3).map((item) => (
              <div
                key={item}
                style={{
                  display: 'flex',
                  flexShrink: 0,
                  padding: '4px 12px',
                  border: '1px solid rgba(4,244,190,0.5)',
                  color: GREEN,
                  whiteSpace: 'nowrap',
                }}
              >
                {truncate(item, 22)}
              </div>
            ))}
            {/* Three chips fill the footer; the brand is already in the title bar. */}
            {meta.length < 3 && (
              <div style={{ display: 'flex', marginLeft: 'auto', color: 'rgba(229,229,229,0.55)' }}>
                programaconnosotros.com
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: 'Geist Mono', data: regular, weight: 400, style: 'normal' },
        { name: 'Geist Mono', data: bold, weight: 700, style: 'normal' },
      ],
    },
  );
}
