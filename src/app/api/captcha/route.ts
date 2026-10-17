import { createCaptchaChallenge } from '@/lib/captcha';

// A fresh signed challenge for the captcha widget of the sign-in forms (src/lib/captcha.ts).
// Public: whoever is about to sign in or create an account has no session yet.

export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json(await createCaptchaChallenge(), {
    headers: { 'Cache-Control': 'no-store' },
  });
}
