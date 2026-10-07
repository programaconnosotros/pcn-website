import type { CSSProperties, ReactNode } from 'react';

// Terminal palette from globals.css (.dark), as hex: email clients don't know CSS variables.
export const emailColors = {
  background: '#040807',
  surface: '#060c0a',
  chrome: '#081210',
  code: '#0b1a16',
  border: '#10372e',
  foreground: '#d9e8e0',
  muted: '#87a198',
  faint: '#4f6b62',
  green: '#04f4be',
  greenDim: '#03a07d',
  amber: '#f5c451',
  red: '#ff5f57',
} as const;

export const emailMono = "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
export const emailSans =
  "Geist, 'Geist Sans', -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

// Close, maximize and minimize, in the order PCN OS draws them.
const WINDOW_BUTTONS = ['×', '□', '−'];

const windowButtonStyle = {
  display: 'inline-block',
  width: '12px',
  height: '12px',
  marginRight: '4px',
  border: `1px solid ${emailColors.greenDim}`,
  backgroundColor: '#062b23',
  color: emailColors.green,
  fontFamily: emailMono,
  fontSize: '9px',
  fontWeight: 700,
  lineHeight: '12px',
  textAlign: 'center' as const,
};

// Clients that support it (Apple Mail, iOS) get the phosphor glow; the rest ignore it.
const glow = `0 0 12px ${emailColors.green}66`;

// "PCN" in figlet's Calvin S font. Box-drawing glyphs exist in every monospace fallback.
const BANNER = ['╔═╗╔═╗╔╗╔', '╠═╝║  ║║║', '╩  ╚═╝╝╚╝'].join('\n');

const paragraphStyle: CSSProperties = {
  fontFamily: emailSans,
  fontSize: '15px',
  lineHeight: '1.65',
  color: emailColors.foreground,
  margin: '0 0 16px 0',
};

export const EmailText = ({ children }: { children: ReactNode }) => (
  <p style={paragraphStyle}>{children}</p>
);

export const EmailHighlight = ({ children }: { children: ReactNode }) => (
  <strong style={{ color: emailColors.green, fontWeight: 600 }}>{children}</strong>
);

// Hairline-framed block with a `$ command` prompt line, like a terminal output panel.
export const EmailPanel = ({ command, children }: { command: string; children: ReactNode }) => (
  <table
    role="presentation"
    width="100%"
    cellPadding={0}
    cellSpacing={0}
    style={{
      borderCollapse: 'collapse',
      border: `1px solid ${emailColors.border}`,
      borderLeft: `2px solid ${emailColors.green}`,
      backgroundColor: emailColors.code,
      margin: '24px 0',
    }}
  >
    <tbody>
      <tr>
        <td
          style={{
            fontFamily: emailMono,
            fontSize: '12px',
            color: emailColors.muted,
            padding: '9px 16px',
            borderBottom: `1px dashed ${emailColors.border}`,
          }}
        >
          <span style={{ color: emailColors.green }}>pcn</span>
          <span style={{ color: emailColors.faint }}>:</span>
          <span style={{ color: emailColors.greenDim }}>~</span>
          <span style={{ color: emailColors.faint }}>$</span> {command}
        </td>
      </tr>
      <tr>
        <td style={{ padding: '22px 16px' }}>{children}</td>
      </tr>
    </tbody>
  </table>
);

// The code stays one text node so it copies and pastes as plain digits.
export const EmailCode = ({ code }: { code: string }) => (
  <table
    role="presentation"
    cellPadding={0}
    cellSpacing={0}
    align="center"
    style={{ borderCollapse: 'collapse', margin: '0 auto' }}
  >
    <tbody>
      <tr>
        <td
          style={{
            border: `1px solid ${emailColors.greenDim}`,
            backgroundColor: emailColors.background,
            padding: '14px 10px 14px 20px',
            boxShadow: glow,
          }}
        >
          <p
            style={{
              fontFamily: emailMono,
              fontSize: '34px',
              fontWeight: 700,
              letterSpacing: '12px',
              lineHeight: '1',
              color: emailColors.green,
              textShadow: glow,
              textAlign: 'center',
              margin: 0,
            }}
          >
            {code}
          </p>
        </td>
      </tr>
    </tbody>
  </table>
);

/** Aligned `key  value` rows, like the output of a CLI `status` command. */
export const EmailMeta = ({
  rows,
}: {
  rows: { label: string; value: ReactNode; tone?: 'green' | 'amber' | 'muted' }[];
}) => (
  <table
    role="presentation"
    width="100%"
    cellPadding={0}
    cellSpacing={0}
    style={{ borderCollapse: 'collapse', marginTop: '18px' }}
  >
    <tbody>
      {rows.map(({ label, value, tone }) => (
        <tr key={label}>
          <td
            width="72"
            style={{
              width: '72px',
              fontFamily: emailMono,
              fontSize: '12px',
              color: emailColors.faint,
              padding: '3px 12px 3px 0',
              verticalAlign: 'top',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </td>
          <td
            style={{
              fontFamily: emailMono,
              fontSize: '12px',
              color:
                tone === 'green'
                  ? emailColors.green
                  : tone === 'amber'
                    ? emailColors.amber
                    : tone === 'muted'
                      ? emailColors.muted
                      : emailColors.foreground,
              padding: '3px 0',
              verticalAlign: 'top',
            }}
          >
            {value}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

// Primary CTA: a flat green slab labelled as a function call, like the site's buttons.
export const EmailButton = ({ href, label }: { href: string; label: string }) => (
  <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: '28px 0' }}>
    <tbody>
      <tr>
        <td
          style={{
            backgroundColor: emailColors.green,
            border: `1px solid ${emailColors.green}`,
            boxShadow: glow,
          }}
        >
          <a
            href={href}
            style={{
              display: 'inline-block',
              padding: '12px 22px',
              fontFamily: emailMono,
              fontSize: '14px',
              fontWeight: 700,
              color: '#000000',
              textDecoration: 'none',
            }}
          >
            <span aria-hidden="true">&gt;_ </span>
            {label}
          </a>
        </td>
      </tr>
    </tbody>
  </table>
);

const LogLine = ({ line }: { line: string }) => (
  <tr>
    <td
      style={{
        fontFamily: emailMono,
        fontSize: '11px',
        lineHeight: '1.7',
        color: emailColors.faint,
        whiteSpace: 'nowrap',
        paddingRight: '10px',
        verticalAlign: 'top',
      }}
    >
      [<span style={{ color: emailColors.green }}>&nbsp;&nbsp;OK&nbsp;&nbsp;</span>]
    </td>
    <td
      style={{
        fontFamily: emailMono,
        fontSize: '11px',
        lineHeight: '1.7',
        color: emailColors.muted,
        width: '100%',
      }}
    >
      {line}
    </td>
  </tr>
);

/**
 * Shared shell for every transactional email: a terminal window (title bar with the `~/path`
 * the site uses as page title), the PCN ASCII banner, a short boot log of what just happened,
 * the content, and an `exit 0` footer. Tables and inline styles only, so it holds up in Gmail
 * and Outlook; glows are progressive enhancement.
 */
export const EmailLayout = ({
  path,
  title,
  preview,
  log,
  children,
}: {
  /** Shown as `~/<path>` in the title bar, matching the site's PageTitle. */
  path: string;
  title: string;
  /** Inbox preview text (hidden in the body). */
  preview?: string;
  /** Lines of the `[ OK ]` boot log above the title: what the system just did. */
  log?: string[];
  children: ReactNode;
}) => (
  <div style={{ backgroundColor: emailColors.background, margin: 0, padding: '32px 12px' }}>
    {preview && (
      <>
        <div
          style={{
            display: 'none',
            maxHeight: 0,
            overflow: 'hidden',
            opacity: 0,
            fontSize: '1px',
            lineHeight: '1px',
            color: emailColors.background,
          }}
        >
          {preview}
        </div>
        {/* Relleno invisible: evita que el inbox muestre el cuerpo después del preview */}
        <div style={{ display: 'none', maxHeight: 0, overflow: 'hidden' }}>{'‌ '.repeat(90)}</div>
      </>
    )}
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      style={{
        maxWidth: '560px',
        margin: '0 auto',
        borderCollapse: 'collapse',
        backgroundColor: emailColors.surface,
        border: `1px solid ${emailColors.border}`,
        borderTop: `2px solid ${emailColors.green}`,
      }}
    >
      <tbody>
        {/* Barra de título de la ventana */}
        <tr>
          <td
            style={{
              padding: '10px 16px',
              backgroundColor: emailColors.chrome,
              borderBottom: `1px solid ${emailColors.border}`,
              fontFamily: emailMono,
              fontSize: '12px',
            }}
          >
            <table role="presentation" width="100%" cellPadding={0} cellSpacing={0}>
              <tbody>
                <tr>
                  <td width="56" aria-hidden="true" style={{ whiteSpace: 'nowrap' }}>
                    {/* PCN OS window controls: square LEDs with their glyph, not macOS dots. */}
                    {WINDOW_BUTTONS.map((glyph) => (
                      <span key={glyph} style={windowButtonStyle}>
                        {glyph}
                      </span>
                    ))}
                  </td>
                  <td style={{ textAlign: 'center', color: emailColors.muted }}>
                    <a href={SITE_URL} style={{ color: emailColors.green, textDecoration: 'none' }}>
                      ~
                    </a>
                    <span style={{ color: emailColors.greenDim }}>/</span>
                    <span style={{ color: emailColors.foreground }}>{path}</span>
                  </td>
                  <td
                    width="52"
                    style={{
                      textAlign: 'right',
                      fontSize: '10px',
                      color: emailColors.faint,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    tty/pcn
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>

        {/* Banner ASCII y boot log */}
        <tr>
          <td style={{ padding: '24px 24px 0 24px' }}>
            <table role="presentation" cellPadding={0} cellSpacing={0}>
              <tbody>
                <tr>
                  <td style={{ verticalAlign: 'middle', paddingRight: '16px' }}>
                    <pre
                      aria-hidden="true"
                      style={{
                        fontFamily: emailMono,
                        fontSize: '14px',
                        lineHeight: '1',
                        color: emailColors.green,
                        textShadow: glow,
                        margin: 0,
                      }}
                    >
                      {BANNER}
                    </pre>
                  </td>
                  <td
                    style={{
                      verticalAlign: 'middle',
                      fontFamily: emailMono,
                      borderLeft: `1px solid ${emailColors.border}`,
                      paddingLeft: '16px',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: emailColors.foreground,
                        margin: 0,
                      }}
                    >
                      programaConNosotros
                    </p>
                    <p style={{ fontSize: '11px', color: emailColors.faint, margin: '4px 0 0 0' }}>
                      {'// comunidad tech sin fronteras'}
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>

            {log && log.length > 0 && (
              <table
                role="presentation"
                width="100%"
                cellPadding={0}
                cellSpacing={0}
                style={{
                  marginTop: '20px',
                  paddingTop: '12px',
                  borderTop: `1px dashed ${emailColors.border}`,
                }}
              >
                <tbody>
                  {log.map((line) => (
                    <LogLine key={line} line={line} />
                  ))}
                </tbody>
              </table>
            )}
          </td>
        </tr>

        {/* Contenido principal */}
        <tr>
          <td style={{ padding: '24px 24px 12px 24px' }}>
            <h1
              style={{
                fontFamily: emailMono,
                fontSize: '22px',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: '1.3',
                color: emailColors.foreground,
                margin: '0 0 20px 0',
              }}
            >
              <span aria-hidden="true" style={{ color: emailColors.green }}>
                &gt;{' '}
              </span>
              {title}
              <span aria-hidden="true" style={{ color: emailColors.green, textShadow: glow }}>
                &#9608;
              </span>
            </h1>
            {children}
          </td>
        </tr>

        {/* Pie de página */}
        <tr>
          <td
            style={{
              padding: '14px 24px 18px 24px',
              borderTop: `1px solid ${emailColors.border}`,
              backgroundColor: emailColors.chrome,
              fontFamily: emailMono,
              fontSize: '11px',
              lineHeight: '1.7',
              color: emailColors.muted,
            }}
          >
            <p style={{ margin: 0, color: emailColors.faint }}>
              <span style={{ color: emailColors.green }}>✓</span> proceso terminado ·{' '}
              <span style={{ color: emailColors.greenDim }}>exit 0</span>
            </p>
            <p style={{ margin: '2px 0 0 0' }}>
              {'// mensaje automático, no respondas a este correo.'}
            </p>
            <p style={{ margin: '2px 0 0 0' }}>
              &copy; {new Date().getFullYear()}{' '}
              <a href={SITE_URL} style={{ color: emailColors.green, textDecoration: 'none' }}>
                programaConNosotros
              </a>
            </p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);
