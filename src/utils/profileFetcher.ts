
import { fetchUserProfile } from '@/services/profileService';
import { getCachedProfile, setCachedProfile } from '@/utils/profileCache';
import { User } from '@/types/auth';

export const fetchUserProfileWithCache = async (sessionUser: any): Promise<User> => {
  // Check cache first
  const cachedProfile = getCachedProfile(sessionUser.id);
  if (cachedProfile) {
    console.log('Using cached profile for:', sessionUser.id);
    return cachedProfile;
  }

  // Fetch from service
  const userData = await fetchUserProfile(sessionUser);
  
  // Cache the result
  setCachedProfile(sessionUser.id, userData);
  
  return userData;
};

export const handleProfileFetchWithRetry = async (
  sessionUser: any, 
  retryCount = 0,
  maxRetries = 1 // Reduced retries for faster response
): Promise<User | null> => {
  try {
    console.log(`Fetching user profile (attempt ${retryCount + 1})...`);
    const userData = await fetchUserProfileWithCache(sessionUser);
    console.log('User profile fetched successfully:', userData);
    return userData;
  } catch (error: any) {
    console.error(`Error fetching user profile (attempt ${retryCount + 1}):`, error);
    
    // If we haven't retried too many times, try again
    if (retryCount < maxRetries) {
      console.log(`Retrying profile fetch in 500ms...`);
      await new Promise(resolve => setTimeout(resolve, 500)); // Reduced delay
      return handleProfileFetchWithRetry(sessionUser, retryCount + 1, maxRetries);
    }
    
    // After max retries, return null instead of throwing
    console.error('Max retries reached, returning null');
    return null;
  }
};
