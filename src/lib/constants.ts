// Shared color/label maps used across ProjectCard, [slug], leaderboard, and comparison pages

export const languageLabel: Record<string, string> = {
  typescript: 'TypeScript',
  rust: 'Rust',
  python: 'Python',
  go: 'Go',
  c: 'C',
  bash: 'Bash',
  zig: 'Zig',
  multi: 'Multi-language',
};

export const languageColors: Record<string, { bg: string; text: string; border: string }> = {
  typescript: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  rust: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  python: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  go: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  c: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' },
  bash: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
  zig: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  multi: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
};

// Flat variant used in leaderboard table rows
export const langColorsFlat: Record<string, string> = {
  typescript: 'bg-blue-500/20 text-blue-300',
  rust: 'bg-orange-500/20 text-orange-300',
  python: 'bg-yellow-500/20 text-yellow-300',
  go: 'bg-cyan-500/20 text-cyan-300',
  c: 'bg-gray-500/20 text-gray-300',
  bash: 'bg-green-500/20 text-green-300',
  zig: 'bg-amber-500/20 text-amber-300',
  multi: 'bg-purple-500/20 text-purple-300',
};

export const statusColors: Record<string, string> = {
  active: 'text-green-400 border-green-500/20 bg-green-500/10',
  experimental: 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10',
  archived: 'text-gray-500 border-gray-500/20 bg-gray-500/10',
};

// Simpler status color variant used in ProjectCard (no border/bg in class)
export const statusColorsSimple: Record<string, string> = {
  active: 'text-green-400',
  experimental: 'text-yellow-400',
  archived: 'text-gray-500',
};
