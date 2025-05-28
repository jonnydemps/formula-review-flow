
import { User } from '@/types/auth';

// Simple in-memory cache for user profiles
const profileCache = new Map<string, { user: User; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getCachedProfile = (userId: string): User | null => {
  const cached = profileCache.get(userId);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    profileCache.delete(userId);
    return null;
  }
  
  return cached.user;
};

export const setCachedProfile = (userId: string, user: User): void => {
  profileCache.set(userId, {
    user,
    timestamp: Date.now()
  });
};

export const clearProfileCache = (): void => {
  profileCache.clear();
};
