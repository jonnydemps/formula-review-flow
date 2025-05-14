
import { User, UserRole } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";

// Cache to store recently fetched profiles to avoid redundant DB calls
const profileCache = new Map<string, {user: User, timestamp: number}>();
const CACHE_TTL = 60 * 1000; // 1 minute cache

// Fetch user profile and role from the database
export const fetchUserProfile = async (authUser: any): Promise<User> => {
  // Check cache first
  const cachedProfile = profileCache.get(authUser.id);
  const now = Date.now();
  
  if (cachedProfile && (now - cachedProfile.timestamp < CACHE_TTL)) {
    console.log("Using cached profile for:", authUser.id);
    return cachedProfile.user;
  }

  console.log("Fetching profile for user:", authUser.id);

  // Special case for the admin account
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
    
    // Ensure admin profile is saved in the database as well
    try {
      const { data, error } = await supabase
        .from("profiles")
        .upsert({
          id: authUser.id,
          name: adminUser.name,
          role: adminUser.role
        })
        .select();
        
      if (error) {
        console.error("Error updating admin profile:", error);
      } else {
        console.log("Admin profile saved or updated in database");
      }
    } catch (err) {
      console.error("Failed to update admin profile in database:", err);
    }
    
    return adminUser;
  }

  try {
    // For non-admin users, continue with the regular flow
    // Fetch profile using maybeSingle() to handle non-existent profiles gracefully
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("role, name")
      .eq("id", authUser.id)
      .maybeSingle();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      // Rethrow the error if fetching fails, AuthContext can handle fallback/signout
      throw new Error(`Failed to fetch profile: ${profileError.message}`);
    }

    // If profile exists, return user data with role from DB
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
      console.log("User profile cached and returning:", user);
      
      return user;
    }

    // If no profile exists, create one with a default role
    console.log("No profile found, creating a default profile");
    const newUser = await createUserProfile(authUser);
    
    // Cache the new profile
    profileCache.set(authUser.id, {user: newUser, timestamp: now});
    console.log("New user profile created, cached and returning:", newUser);
    
    return newUser;

  } catch (error: any) {
    console.error("Profile service error:", error);
    // Clear cache on error
    profileCache.delete(authUser.id);
    // Propagate the error to be handled by the caller (e.g., AuthContext)
    throw new Error(`Profile service failed: ${error.message}`);
  }
};

// Create a user profile in the database
const createUserProfile = async (authUser: any): Promise<User> => {
  // Special case for admin account
  if (authUser.email === 'john-dempsey@hotmail.co.uk') {
    const adminRole: UserRole = "admin";
    const name = authUser.user_metadata?.name || "Admin";

    try {
      console.log(`Creating admin profile for ${authUser.id} with name "${name}" and role "${adminRole}"`);
      
      const { data: insertedProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: authUser.id,
          name: name,
          role: adminRole,
        })
        .select("role, name")
        .single();

      if (insertError) {
        console.error("Error creating admin profile:", insertError);
        throw new Error(`Failed to create admin profile: ${insertError.message}`);
      }

      console.log("Admin profile created successfully:", insertedProfile);
      
      return {
        id: authUser.id,
        email: authUser.email || "",
        role: adminRole,
        name: name,
      };
    } catch (error: any) {
      console.error("Error during admin profile creation:", error);
      throw new Error(`Admin profile creation failed: ${error.message}`);
    }
  }

  // Default role for regular users
  const defaultRole: UserRole = "customer";
  const name = authUser.user_metadata?.name || authUser.email?.split("@")[0] || "Customer " + authUser.id.substring(0, 8);

  try {
    console.log(`Creating new profile for user ${authUser.id} with name "${name}" and role "${defaultRole}"`);
    
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
      // If profile creation fails, throw an error
      throw new Error(`Failed to create profile: ${insertError.message}`);
    }

    console.log("Profile created successfully:", insertedProfile);
    
    // Return the newly created user data
    return {
      id: authUser.id,
      email: authUser.email || "",
      role: insertedProfile.role as UserRole,
      name: insertedProfile.name,
    };

  } catch (error: any) {
    console.error("Error during profile creation:", error);
    // Propagate the error
    throw new Error(`Profile creation failed: ${error.message}`);
  }
};
