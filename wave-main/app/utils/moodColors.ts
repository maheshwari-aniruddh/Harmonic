// Mood-based color themes
export const moodColors = {
  happy: {
    bg: 'bg-linear-to-br from-yellow-50 via-orange-50 to-yellow-100',
    primary: 'bg-yellow-400',
    text: 'text-gray-800',
    accent: 'from-yellow-400 to-orange-400',
    border: 'border-yellow-300',
    overlay: 'from-yellow-100/50 via-orange-100/50 to-yellow-100/50',
    cardBg: 'bg-white/80',
  },
  sad: {
    bg: 'bg-linear-to-br from-blue-50 via-indigo-50 to-blue-100',
    primary: 'bg-blue-400',
    text: 'text-gray-800',
    accent: 'from-blue-400 to-indigo-400',
    border: 'border-blue-300',
    overlay: 'from-blue-100/50 via-indigo-100/50 to-blue-100/50',
    cardBg: 'bg-white/80',
  },
  angry: {
    bg: 'bg-linear-to-br from-red-50 via-orange-50 to-red-100',
    primary: 'bg-red-500',
    text: 'text-gray-800',
    accent: 'from-red-500 to-orange-500',
    border: 'border-red-300',
    overlay: 'from-red-100/50 via-orange-100/50 to-red-100/50',
    cardBg: 'bg-white/80',
  },
  motivated: {
    bg: 'bg-linear-to-br from-green-50 via-emerald-50 to-green-100',
    primary: 'bg-green-500',
    text: 'text-gray-800',
    accent: 'from-green-500 to-emerald-500',
    border: 'border-green-300',
    overlay: 'from-green-100/50 via-emerald-100/50 to-green-100/50',
    cardBg: 'bg-white/80',
  },
  calm: {
    bg: 'bg-linear-to-br from-purple-50 via-pink-50 to-purple-100',
    primary: 'bg-purple-400',
    text: 'text-gray-800',
    accent: 'from-purple-400 to-pink-400',
    border: 'border-purple-300',
    overlay: 'from-purple-100/50 via-pink-100/50 to-purple-100/50',
    cardBg: 'bg-white/80',
  },
  default: {
    bg: 'bg-linear-to-br from-gray-50 via-slate-50 to-gray-100',
    primary: 'bg-gray-400',
    text: 'text-gray-800',
    accent: 'from-gray-400 to-slate-400',
    border: 'border-gray-300',
    overlay: 'from-gray-100/50 via-slate-100/50 to-gray-100/50',
    cardBg: 'bg-white/80',
  },
};

export function getMoodColor(mood: string) {
  const normalizedMood = mood.toLowerCase();

  if (normalizedMood.includes('happy') || normalizedMood.includes('joy') || normalizedMood.includes('excited')) {
    return moodColors.happy;
  }
  if (normalizedMood.includes('sad') || normalizedMood.includes('down') || normalizedMood.includes('depressed')) {
    return moodColors.sad;
  }
  if (normalizedMood.includes('angry') || normalizedMood.includes('mad') || normalizedMood.includes('frustrated')) {
    return moodColors.angry;
  }
  if (normalizedMood.includes('motivated') || normalizedMood.includes('energetic') || normalizedMood.includes('pumped')) {
    return moodColors.motivated;
  }
  if (normalizedMood.includes('calm') || normalizedMood.includes('peaceful') || normalizedMood.includes('relaxed')) {
    return moodColors.calm;
  }

  return moodColors.default;
}
