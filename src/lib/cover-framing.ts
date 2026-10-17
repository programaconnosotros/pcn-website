import { z } from 'zod';

/** How a past event's cover photo is framed in its header: focal point and zoom, in percent. */
export interface CoverFraming {
  x: number;
  y: number;
  zoom: number;
}

export const DEFAULT_COVER_FRAMING: CoverFraming = { x: 50, y: 50, zoom: 100 };
export const MAX_COVER_ZOOM = 250;

export const coverFramingSchema = z.object({
  x: z.number().int().min(0).max(100),
  y: z.number().int().min(0).max(100),
  zoom: z.number().int().min(100).max(MAX_COVER_ZOOM),
});

/** CSS for an `object-cover` image framed this way: zoom grows around the focal point. */
export const coverFramingStyle = ({ x, y, zoom }: CoverFraming) => ({
  objectPosition: `${x}% ${y}%`,
  transformOrigin: `${x}% ${y}%`,
  transform: zoom === 100 ? undefined : `scale(${zoom / 100})`,
});
