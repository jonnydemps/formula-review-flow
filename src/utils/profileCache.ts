
// Simple profile cache utility
const profileCache = new Map<string, any>();

export const getCachedProfile = (userId: string) => {
  return profileCache.get(userId);
};

export const setCachedProfile = (userId: string, profile: any) => {
  profileCache.set(userId, profile);
};

export const clearProfileCache = () => {
  profileCache.clear();
};
