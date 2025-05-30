import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase, fetchUserProfile } from "../config/supabase";

// Create the authentication context
const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Authentication provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  // Function to check and set current user
  useEffect(() => {
    // Get session data
    const getSession = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();
        const session = data?.session;

        if (error) {
          throw error;
        }

        if (session) {
          setSession(session);
          setUser(session.user);

          // Fetch user profile data including role
          const profile = await fetchUserProfile(session.user.id);
          setUserProfile(profile);
        }
      } catch (error) {
        console.error("Error getting session:", error.message);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user || null);

        if (newSession?.user) {
          const profile = await fetchUserProfile(newSession.user.id);
          setUserProfile(profile);
        } else {
          setUserProfile(null);
        }

        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error("Error signing in:", error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (email, password, name, role = "user") => {
    try {
      setLoading(true);

      // Register the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Create a user profile in the 'users' table
      if (authData.user) {
        const { error: profileError } = await supabase.from("users").insert([
          {
            id: authData.user.id,
            name,
            email,
            role,
            created_at: new Date(),
          },
        ]);

        if (profileError) throw profileError;
      }

      return { success: true, data: authData };
    } catch (error) {
      console.error("Error signing up:", error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setSession(null);
      setUserProfile(null);

      return { success: true };
    } catch (error) {
      console.error("Error signing out:", error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Error resetting password:", error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Auth context value
  const value = {
    user,
    session,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isAdmin: userProfile?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// import React, { createContext, useState, useEffect, useContext } from "react";
// import { supabase, fetchUserProfile } from "../config/supabase";

// // Create the authentication context
// const AuthContext = createContext(null);

// // Custom hook to use the auth context
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === null) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

// // Authentication provider component
// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [session, setSession] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [userProfile, setUserProfile] = useState(null);

//   // Function to check and set current user
//   useEffect(() => {
//     // Get session data
//     const getSession = async () => {
//       try {
//         setLoading(true);

//         // Get session data
//         const { data, error } = await supabase.auth.getSession();
//         if (error) {
//           throw new Error(`Error getting session: ${error.message}`);
//         }

//         const session = data?.session;

//         // If a session exists
//         if (session) {
//           setSession(session);
//           setUser(session.user);

//           // Fetch user profile data including role
//           const profile = await fetchUserProfile(session.user.id);

//           if (profile) {
//             setUserProfile(profile);
//           } else {
//             console.log("No profile found for the user.");
//           }
//         } else {
//           console.log("No session found.");
//         }
//       } catch (error) {
//         console.error("Error getting session:", error.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     getSession();

//     // Subscribe to auth changes
//     const { data: authListener } = supabase.auth.onAuthStateChange(
//       async (event, newSession) => {
//         setSession(newSession);
//         setUser(newSession?.user || null);

//         if (newSession?.user) {
//           const profile = await fetchUserProfile(newSession.user.id);
//           setUserProfile(profile);
//         } else {
//           setUserProfile(null);
//         }

//         setLoading(false);
//       }
//     );

//     // Cleanup subscription on unmount
//     return () => {
//       if (authListener && authListener.subscription) {
//         authListener.subscription.unsubscribe();
//       }
//     };
//   }, []);

//   // Sign in with email and password
//   const signIn = async (email, password) => {
//     try {
//       setLoading(true);
//       const { data, error } = await supabase.auth.signInWithPassword({
//         email,
//         password,
//       });

//       if (error) throw error;

//       return { success: true, data };
//     } catch (error) {
//       console.error("Error signing in:", error.message);
//       return { success: false, error: error.message };
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Sign up with email and password
//   const signUp = async (email, password, name, role) => {
//     try {
//       setLoading(true);
//       const { data: authData, error: authError } = await supabase.auth.signUp({
//         email,
//         password,
//         options: {
//           data: {
//             name,
//             role, // this will be available as raw_user_meta_data.role
//           },
//         },
//       });

//       if (authError) {
//         console.error("Supabase Auth Error:", authError);
//         return { success: false, error: authError.message };
//       }

//       if (!authData?.session) {
//         return {
//           success: true,
//           message:
//             "Signup successful. Please check your email to confirm your account.",
//         };
//       }

//       return { success: true, message: "Signup successful.", data: authData };
//     } catch (error) {
//       console.error("Unexpected Signup Error:", error);
//       return {
//         success: false,
//         error: error?.message || "Unexpected error during signup.",
//       };
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Sign out
//   const signOut = async () => {
//     try {
//       setLoading(true);
//       const { error } = await supabase.auth.signOut();
//       if (error) throw error;

//       setUser(null);
//       setSession(null);
//       setUserProfile(null);

//       return { success: true };
//     } catch (error) {
//       console.error("Error signing out:", error.message);
//       return { success: false, error: error.message };
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Reset password
//   const resetPassword = async (email) => {
//     try {
//       setLoading(true);
//       const { error } = await supabase.auth.resetPasswordForEmail(email);

//       if (error) throw error;
//       return { success: true };
//     } catch (error) {
//       console.error("Error resetting password:", error.message);
//       return { success: false, error: error.message };
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Auth context value
//   const value = {
//     user,
//     session,
//     userProfile,
//     loading,
//     signIn,
//     signUp,
//     signOut,
//     resetPassword,
//     isAdmin: userProfile?.role === "admin",
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };
