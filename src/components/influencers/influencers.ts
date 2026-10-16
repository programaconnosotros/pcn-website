// The shape of /influencers' content creators, shared by the curated list, the ones members
// recommend (kind INFLUENCER) and the card.

export interface Platform {
  youtube?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  page?: string;
}

export interface Influencer {
  id: string;
  name: string;
  /** A file under /influencers, a site path or an https URL; empty shows their initial. */
  image: string;
  description: string;
  platforms: Platform;
  specialties: string[];
}

const PLATFORM_HOSTS: [RegExp, keyof Platform][] = [
  [/(^|\.)(youtube\.com|youtu\.be)$/, 'youtube'],
  [/(^|\.)instagram\.com$/, 'instagram'],
  [/(^|\.)(twitter\.com|x\.com)$/, 'twitter'],
  [/(^|\.)linkedin\.com$/, 'linkedin'],
  [/(^|\.)github\.com$/, 'github'],
];

/** The platform a recommended creator's link belongs to, by its host; any other site is `page`. */
export const platformsOf = (url: string | null): Platform => {
  if (!url) return {};
  let host = '';
  try {
    host = new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return {};
  }
  const platform = PLATFORM_HOSTS.find(([pattern]) => pattern.test(host))?.[1] ?? 'page';
  return { [platform]: url };
};
