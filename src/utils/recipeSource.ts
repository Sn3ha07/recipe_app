import { Recipe } from '../types';

// One short line saying who wrote the original recipe
export function creditLine(recipe: Recipe): string {
  const s = recipe.source;
  if (!s) return 'AI-written, no original source';
  if (s.creator && s.name) return `Recipe by ${s.creator} · ${s.name}`;
  if (s.creator) return `Recipe by ${s.creator}`;
  return `From ${s.name}`;
}

// Only ever link to normal web pages
export function safeUrl(url?: string): string | null {
  try {
    const u = new URL(url || '');
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : null;
  } catch {
    return null;
  }
}
