// Shared color/label maps used across ProjectCard, [slug], leaderboard, and comparison pages

export const languageLabel: Record<string, string> = {
  typescript: 'TypeScript',
  rust: 'Rust',
  python: 'Python',
  go: 'Go',
  c: 'C',
  bash: 'Bash',
  zig: 'Zig',
  kotlin: 'Kotlin',
  multi: 'Multi-language',
};

export const languageColors: Record<string, { bg: string; text: string; border: string }> = {
  typescript: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  rust: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  python: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  go: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  c: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
  bash: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  zig: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  kotlin: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  multi: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
};

// Flat variant used in leaderboard table rows
export const langColorsFlat: Record<string, string> = {
  typescript: 'bg-blue-100 text-blue-700',
  rust: 'bg-orange-100 text-orange-700',
  python: 'bg-amber-100 text-amber-700',
  go: 'bg-cyan-100 text-cyan-700',
  c: 'bg-gray-100 text-gray-600',
  bash: 'bg-emerald-100 text-emerald-700',
  zig: 'bg-amber-100 text-amber-700',
  kotlin: 'bg-violet-100 text-violet-700',
  multi: 'bg-purple-100 text-purple-700',
};

export const statusColors: Record<string, string> = {
  active: 'text-emerald-700 border-emerald-200 bg-emerald-50',
  experimental: 'text-amber-700 border-amber-200 bg-amber-50',
  archived: 'text-gray-500 border-gray-200 bg-gray-50',
};

// Simpler status color variant used in ProjectCard (no border/bg in class)
export const statusColorsSimple: Record<string, string> = {
  active: 'text-emerald-700',
  experimental: 'text-amber-700',
  archived: 'text-gray-500',
};
