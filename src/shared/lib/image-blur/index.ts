import { BLUR_DATA_URL } from "./blur-map.generated";

/**
 * Returns the base64 blur placeholder for a public image path
 * (e.g. "/images/home/hero/poster-1.webp"), or `undefined` if not generated.
 *
 * Regenerate the map with: `node scripts/optimize-images.mjs`.
 */
export function getBlur(publicPath: string): string | undefined {
  return BLUR_DATA_URL[publicPath];
}
