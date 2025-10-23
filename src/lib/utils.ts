import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(date);
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function calculateLevel(points: number): { level: number; tier: string } {
  const levels = [
    { min: 0, max: 100, level: 1, tier: 'Member' },
    { min: 101, max: 300, level: 2, tier: 'Acquaintance' },
    { min: 301, max: 600, level: 3, tier: 'Associate' },
    { min: 601, max: 1000, level: 4, tier: 'Friend' },
    { min: 1001, max: 1500, level: 5, tier: 'Supporter' },
    { min: 1501, max: 2500, level: 6, tier: 'Activist' },
    { min: 2501, max: 4000, level: 7, tier: 'Altruist' },
    { min: 4001, max: 6000, level: 8, tier: 'Humanitarian' },
    { min: 6001, max: 10000, level: 9, tier: 'Philanthropist' },
    { min: 10001, max: Infinity, level: 10, tier: 'Angel' }
  ];

  const currentLevel = levels.find(l => points >= l.min && points <= l.max);
  return currentLevel ? { level: currentLevel.level, tier: currentLevel.tier } : { level: 1, tier: 'Member' };
}

export function getNextLevelRequirement(points: number): { nextLevel: string; pointsNeeded: number } {
  const levels = [
    { min: 0, max: 100, tier: 'Member', next: 'Acquaintance', nextMin: 101 },
    { min: 101, max: 300, tier: 'Acquaintance', next: 'Associate', nextMin: 301 },
    { min: 301, max: 600, tier: 'Associate', next: 'Friend', nextMin: 601 },
    { min: 601, max: 1000, tier: 'Friend', next: 'Supporter', nextMin: 1001 },
    { min: 1001, max: 1500, tier: 'Supporter', next: 'Activist', nextMin: 1501 },
    { min: 1501, max: 2500, tier: 'Activist', next: 'Altruist', nextMin: 2501 },
    { min: 2501, max: 4000, tier: 'Altruist', next: 'Humanitarian', nextMin: 4001 },
    { min: 4001, max: 6000, tier: 'Humanitarian', next: 'Philanthropist', nextMin: 6001 },
    { min: 6001, max: 10000, tier: 'Philanthropist', next: 'Angel', nextMin: 10001 },
    { min: 10001, max: Infinity, tier: 'Angel', next: 'Angel', nextMin: Infinity }
  ];

  const currentLevel = levels.find(l => points >= l.min && points <= l.max);
  if (!currentLevel) return { nextLevel: 'Acquaintance', pointsNeeded: 101 };
  
  return {
    nextLevel: currentLevel.next,
    pointsNeeded: currentLevel.nextMin === Infinity ? 0 : currentLevel.nextMin - points
  };
}