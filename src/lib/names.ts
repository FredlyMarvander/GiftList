/** People are matched by name, ignoring case and stray spaces. */
export function personKey(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

/** `Sarah's`, `James'` */
export function possessive(name: string): string {
  return name.toLowerCase().endsWith('s') ? `${name}'` : `${name}'s`;
}

/** `Sarah` becomes `S`, `Mom and Dad` becomes `MD` */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? [words[0], words[words.length - 1]] : words;
  return letters.map((word) => word[0].toUpperCase()).join('') || '?';
}
