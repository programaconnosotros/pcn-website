import type { CSSProperties, ReactNode } from 'react';

// Terminal palette from globals.css (.dark), as hex: email clients don't know CSS variables.
export const emailColors = {
  background: '#040807',
  surface: '#060c0a',
  code: '#0e201c',
  border: '#10372e',
  foreground: '#d9e8e0',
  muted: '#87a198',
  green: '#04f4be',
  greenDim: '#03a07d',
} as const;

export const emailMono = "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
export const emailSans =
  "Geist, 'Geist Sans', -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

const paragraphStyle: CSSProperties = {
  fontFamily: emailSans,
  fontSize: '15px',
  lineHeight: '1.6',
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
            padding: '8px 16px',
            borderBottom: `1px solid ${emailColors.border}`,
          }}
        >
          <span style={{ color: emailColors.green }}>$</span> {command}
        </td>
      </tr>
      <tr>
        <td style={{ padding: '20px 16px' }}>{children}</td>
      </tr>
    </tbody>
  </table>
);

export const EmailCode = ({ code }: { code: string }) => (
  <p
    style={{
      fontFamily: emailMono,
      fontSize: '32px',
      fontWeight: 700,
      letterSpacing: '10px',
      color: emailColors.green,
      textAlign: 'center',
      margin: 0,
    }}
  >
    {code}
  </p>
);

// Primary CTA: a flat green slab labelled as a function call, like the site's buttons.
export const EmailButton = ({ href, label }: { href: string; label: string }) => (
  <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: '24px 0' }}>
    <tbody>
      <tr>
        <td
          style={{ backgroundColor: emailColors.green, border: `1px solid ${emailColors.green}` }}
        >
          <a
            href={href}
            style={{
              display: 'inline-block',
              padding: '11px 20px',
              fontFamily: emailMono,
              fontSize: '14px',
              fontWeight: 600,
              color: '#000000',
              textDecoration: 'none',
            }}
          >
            {label}
          </a>
        </td>
      </tr>
    </tbody>
  </table>
);

/**
 * Shared shell for every transactional email: near-black terminal screen, the `~/path` prompt
 * the site uses as page title, hairline separators instead of rounded cards, mono footer.
 */
export const EmailLayout = ({
  path,
  title,
  preview,
  children,
}: {
  /** Shown as `~/<path>` in the header, matching the site's PageTitle. */
  path: string;
  title: string;
  /** Inbox preview text (hidden in the body). */
  preview?: string;
  children: ReactNode;
}) => (
  <div style={{ backgroundColor: emailColors.background, margin: 0, padding: '32px 12px' }}>
    {preview && (
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
      }}
    >
      <tbody>
        {/* Encabezado: prompt de terminal */}
        <tr>
          <td
            style={{
              padding: '14px 24px',
              borderBottom: `1px solid ${emailColors.border}`,
              fontFamily: emailMono,
              fontSize: '13px',
            }}
          >
            <a href={SITE_URL} style={{ color: emailColors.green, textDecoration: 'none' }}>
              ~
            </a>
            <span style={{ color: emailColors.greenDim }}>/</span>
            <span style={{ color: emailColors.foreground }}>{path}</span>
            <span style={{ color: emailColors.green }}>&#9612;</span>
          </td>
        </tr>

        {/* Contenido principal */}
        <tr>
          <td style={{ padding: '28px 24px 12px 24px' }}>
            <h1
              style={{
                fontFamily: emailMono,
                fontSize: '22px',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                lineHeight: '1.3',
                color: emailColors.green,
                margin: '0 0 20px 0',
              }}
            >
              {title}
            </h1>
            {children}
          </td>
        </tr>

        {/* Pie de página */}
        <tr>
          <td
            style={{
              padding: '16px 24px',
              borderTop: `1px solid ${emailColors.border}`,
              fontFamily: emailMono,
              fontSize: '11px',
              lineHeight: '1.6',
              color: emailColors.muted,
            }}
          >
            <p style={{ margin: 0 }}>{'// mensaje automático, no respondas a este correo.'}</p>
            <p style={{ margin: '4px 0 0 0' }}>
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
