import { supabase } from "./supabase";

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  isGuest: boolean;
}

const GUEST_KEY = "nutriplan_guest_session";
const USER_KEY = "nutriplan_user_session";

export function getStoredUser(): UserProfile | null {
  if (typeof window === "undefined") return null;

  try {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      return JSON.parse(userStr);
    }

    const guestStr = localStorage.getItem(GUEST_KEY);
    if (guestStr) {
      return JSON.parse(guestStr);
    }
  } catch (e) {
    console.error("Error reading auth state:", e);
  }

  return null;
}

export function saveGuestSession(): UserProfile {
  const guestUser: UserProfile = {
    id: `guest-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    email: "guest@nutriplan.ai",
    name: "Guest Evaluator",
    isGuest: true,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(GUEST_KEY, JSON.stringify(guestUser));
  }

  return guestUser;
}

export function saveUserSession(email: string, name?: string): UserProfile {
  const user: UserProfile = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    email,
    name: name || email.split("@")[0],
    isGuest: false,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.removeItem(GUEST_KEY);
  }

  return user;
}

export function clearUserSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(GUEST_KEY);
  }
}
