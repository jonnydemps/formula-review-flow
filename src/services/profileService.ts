
import { User, UserRole } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";

// Fetch user profile and role from the database
export const fetchUserProfile = async (authUser: any): Promise<User> => {
  // console.log("Fetching profile for user:", authUser.id);

  try {
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
      return {
        id: authUser.id,
        email: authUser.email || "",
        role: profileData.role as UserRole,
        name: profileData.name || authUser.user_metadata?.name || authUser.email?.split("@")[0] || "User",
      };
    }

    // If no profile exists, create one with a default role (
    // console.log("No profile found, creating a default profile");
    const newUser = await createUserProfile(authUser);
    return newUser;

  } catch (error: any) {
    console.error("Profile service error:", error);
    // Propagate the error to be handled by the caller (e.g., AuthContext)
    throw new Error(`Profile service failed: ${error.message}`);
  }
};

// Create a user profile in the database
const createUserProfile = async (authUser: any): Promise<User> => {
  const defaultRole: UserRole = "customer"; // Default role for new users
  const name = authUser.user_metadata?.name || authUser.email?.split("@")[0] || "User";

  try {
    const { data: insertedProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: authUser.id,
        name: name,
        role: defaultRole,
      })
      .select("role, name") // Select the inserted data to confirm
      .single();

    if (insertError) {
      console.error("Error creating profile:", insertError);
      // If profile creation fails, throw an error
      throw new Error(`Failed to create profile: ${insertError.message}`);
    }

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

