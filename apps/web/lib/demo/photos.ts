/**
 * Card photos (D-023). Free Unsplash License images, resized to 800 px WebP in
 * public/photos; credits in public/photos/CREDITS.md. Decorative: cards carry their own titles.
 */
const PHOTOS = {
  "world-avi": "/photos/world-avi.webp",
  "world-eng": "/photos/world-eng.webp",
  "world-cul": "/photos/world-cul.webp",
  "world-med": "/photos/world-med.webp",
  "world-agr": "/photos/world-agr.webp",
  "course-agr-101": "/photos/course-agr-101.webp",
  "course-eng-101": "/photos/course-eng-101.webp",
  "course-avi-starter": "/photos/course-avi-starter.webp",
  "course-med-starter": "/photos/course-med-starter.webp",
  "course-ict-basics": "/photos/course-ict-basics.webp",
} as const;

export function worldPhoto(code: string): string | undefined {
  return (PHOTOS as Record<string, string>)["world-" + code.toLowerCase()];
}

export function coursePhoto(slug: string): string | undefined {
  return (PHOTOS as Record<string, string>)["course-" + slug];
}
