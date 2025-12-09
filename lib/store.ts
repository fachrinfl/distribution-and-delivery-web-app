import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "./supabase/client";

interface AuthState {
  user: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "sales";
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      initialize: async () => {
        set({ isLoading: true });

        // Check for existing session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Error getting session:", sessionError);
          set({ user: null, isAuthenticated: false, isLoading: false });
          return;
        }

        if (session?.user) {
          // Get employee data
          const { data: employee, error } = await supabase
            .from("employees")
            .select("*")
            .eq("auth_user_id", session.user.id)
            .single();

          if (employee && !error) {
            set({
              user: {
                id: employee.id,
                name: employee.name,
                email: employee.email,
                role: employee.role as "admin" | "sales",
              },
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            console.error(
              "Employee not found for user:",
              session.user.id,
              error
            );
            // If employee not found, sign out the auth user
            await supabase.auth.signOut();
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        } else {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }

        // Listen for auth changes (token refresh, sign in/out, etc.)
        // Note: This subscription persists for the lifetime of the app
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === "SIGNED_IN" && session?.user) {
            const { data: employee } = await supabase
              .from("employees")
              .select("*")
              .eq("auth_user_id", session.user.id)
              .single();

            if (employee) {
              set({
                user: {
                  id: employee.id,
                  name: employee.name,
                  email: employee.email,
                  role: employee.role as "admin" | "sales",
                },
                isAuthenticated: true,
                isLoading: false,
              });
            }
          } else if (event === "SIGNED_OUT") {
            set({ user: null, isAuthenticated: false, isLoading: false });
          } else if (event === "TOKEN_REFRESHED" && session?.user) {
            // Refresh user data when token is refreshed
            const { data: employee } = await supabase
              .from("employees")
              .select("*")
              .eq("auth_user_id", session.user.id)
              .single();

            if (employee) {
              set({
                user: {
                  id: employee.id,
                  name: employee.name,
                  email: employee.email,
                  role: employee.role as "admin" | "sales",
                },
                isAuthenticated: true,
              });
            }
          }
        });
      },

      login: async (email: string, password: string) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            console.error("Login error:", error);
            return false;
          }

          if (data.user) {
            // Get employee data
            const { data: employee, error: employeeError } = await supabase
              .from("employees")
              .select("*")
              .eq("auth_user_id", data.user.id)
              .single();

            if (employeeError || !employee) {
              console.error("Employee not found:", employeeError);
              await supabase.auth.signOut();
              return false;
            }

            set({
              user: {
                id: employee.id,
                name: employee.name,
                email: employee.email,
                role: employee.role as "admin" | "sales",
              },
              isAuthenticated: true,
            });

            return true;
          }

          return false;
        } catch (err) {
          console.error("Login exception:", err);
          return false;
        }
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        // Only persist user data, not loading state
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
