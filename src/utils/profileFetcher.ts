
import { fetchUserProfile } from '@/services/profileService';
import { getCachedProfile, setCachedProfile } from '@/utils/profileCache';
import { User } from '@/types/auth';
import { toast } from 'sonner';

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
  maxRetries = 2
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
      console.log(`Retrying profile fetch in 1 second...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return handleProfileFetchWithRetry(sessionUser, retryCount + 1, maxRetries);
    }
    
    // After max retries, show error and throw
    console.error('Max retries reached, throwing error');
    toast.error(`Failed to load user profile. Please try logging in again.`);
    throw error;
  }
};
