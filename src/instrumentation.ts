// Runs once when the server starts. In production, a missing two-factor key stops the boot: the
// health check fails and Kamal keeps the previous version up, instead of a release where nobody
// with two-factor on can sign in.
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs' || process.env.NODE_ENV !== 'production') return;
  // `next build` loads this too, without the deploy secrets.
  if (process.env.NEXT_PHASE === 'phase-production-build') return;
  const { TWO_FACTOR_KEY_ENV, configuredTwoFactorKey } = await import('@/lib/two-factor-crypto');
  if (!configuredTwoFactorKey()) {
    throw new Error(
      `${TWO_FACTOR_KEY_ENV} is missing or isn't 32 bytes in base64 (openssl rand -base64 32)`,
    );
  }
}
