
import { User, UserRole } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";

// Simplified cache - just store the profile data
const profileCache = new Map<string, {user: User, timestamp: number}>();
const CACHE_TTL = 30 * 1000; // Reduced to 30 seconds for debugging

// Main profile fetch function with timeout
export const fetchUserProfile = async (authUser: any): Promise<User> => {
  // Check cache first
  const cachedProfile = profileCache.get(authUser.id);
  const now = Date.now();
  
  if (cachedProfile && (now - cachedProfile.timestamp < CACHE_TTL)) {
    console.log("Using cached profile for:", authUser.id);
    return cachedProfile.user;
  }

  console.log("Fetching fresh profile for user:", authUser.id);

  // Add timeout wrapper
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Profile fetch timeout')), 10000); // 10 second timeout
  });

  try {
    return await Promise.race([fetchProfileWithRetry(authUser), timeoutPromise]);
  } catch (error: any) {
    console.error("Profile fetch failed:", error);
    // Clear cache on error
    profileCache.delete(authUser.id);
    // Return a basic user object to prevent infinite loading
    const fallbackUser = {
      id: authUser.id,
      email: authUser.email || "",
      role: 'customer' as UserRole,
      name: authUser.user_metadata?.name || authUser.email?.split("@")[0] || "User",
    };
    return fallbackUser;
  }
};

// Separate function for the actual profile fetch with retry logic
const fetchProfileWithRetry = async (authUser: any): Promise<User> => {
  const now = Date.now();

  // Special case for admin account
  if (authUser.email === 'john-dempsey@hotmail.co.uk') {
    console.log("Admin account detected, setting admin role");
    const adminUser = {
      id: authUser.id,
      email: authUser.email,
      role: 'admin' as UserRole,
      name: authUser.user_metadata?.name || 'Admin',
    };
    
    // Cache the admin profile
    profileCache.set(authUser.id, {user: adminUser, timestamp: now});
    
    // Asynchronously ensure admin profile exists in database
    setTimeout(() => ensureAdminProfileExists(authUser), 0);
    
    return adminUser;
  }

  // For regular users, fetch from database
  console.log("Querying profiles table for user:", authUser.id);
  
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("role, name")
    .eq("id", authUser.id)
    .maybeSingle();

  console.log("Profile query result:", { profileData, profileError });

  if (profileError) {
    console.error("Error fetching profile:", profileError);
    throw new Error(`Failed to fetch profile: ${profileError.message}`);
  }

  // If profile exists, return user data
  if (profileData) {
    console.log("Profile found:", profileData);
    const user = {
      id: authUser.id,
      email: authUser.email || "",
      role: profileData.role as UserRole,
      name: profileData.name || authUser.user_metadata?.name || authUser.email?.split("@")[0] || "User",
    };
    
    // Cache the profile
    profileCache.set(authUser.id, {user, timestamp: now});
    
    return user;
  }

  // If no profile exists, create one
  console.log("No profile found, creating default profile");
  const newUser = await createUserProfile(authUser);
  
  // Cache the new profile
  profileCache.set(authUser.id, {user: newUser, timestamp: now});
  
  return newUser;
};

// Background function to ensure admin profile exists
const ensureAdminProfileExists = async (authUser: any) => {
  try {
    console.log("Ensuring admin profile exists in database");
    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: authUser.id,
        name: authUser.user_metadata?.name || 'Admin',
        role: 'admin'
      });
      
    if (error) {
      console.error("Error upserting admin profile:", error);
    } else {
      console.log("Admin profile ensured in database");
    }
  } catch (err) {
    console.error("Failed to ensure admin profile:", err);
  }
};

// Create a new user profile
const createUserProfile = async (authUser: any): Promise<User> => {
  const defaultRole: UserRole = "customer";
  const name = authUser.user_metadata?.name || authUser.email?.split("@")[0] || "Customer";

  try {
    console.log(`Creating profile for user ${authUser.id} with role ${defaultRole}`);
    
    const { data: insertedProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: authUser.id,
        name: name,
        role: defaultRole,
      })
      .select("role, name")
      .single();

    if (insertError) {
      console.error("Error creating profile:", insertError);
      throw new Error(`Failed to create profile: ${insertError.message}`);
    }

    console.log("Profile created successfully:", insertedProfile);
    
    return {
      id: authUser.id,
      email: authUser.email || "",
      role: insertedProfile.role as UserRole,
      name: insertedProfile.name,
    };

  } catch (error: any) {
    console.error("Error during profile creation:", error);
    throw new Error(`Profile creation failed: ${error.message}`);
  }
};

// Clear profile cache (for sign out)
export const clearProfileCache = () => {
  profileCache.clear();
  console.log("Profile cache cleared");
};
