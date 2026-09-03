import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getInitialUser,
  subscribeAuthChange,
  login as apiLogin,
  logout as apiLogout,
  fetchProfile as apiFetchProfile,
} from '../lib/data';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    try {
      const data = await apiFetchProfile(userId);

      // Fallback profile if the record does not exist yet (or RLS hides it)
      if (!data) {
        setProfile({ id: userId, role: 'cashier', name: 'Cashier Staff' });
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Profile fetch exception:', err);
    }
  };

  useEffect(() => {
    let active = true;

    // Check initial session
    getInitialUser().then((initialUser) => {
      if (!active) return;
      setUser(initialUser ?? null);
      if (initialUser) {
        fetchProfile(initialUser.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    // Listen for auth changes where the backend supports them (Supabase).
    // For the local MySQL backend the session is client-side, so this is a no-op.
    const { unsubscribe } = subscribeAuthChange(async (nextUser) => {
      if (!active) return;
      setUser(nextUser ?? null);
      if (nextUser) {
        await fetchProfile(nextUser.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const authUser = await apiLogin(email, password);
    setUser(authUser);
    await fetchProfile(authUser.id);
    return authUser;
  };

  const logout = async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
      setProfile(null);
    }
  };

  const isAdmin = profile?.role === 'admin';

  const value = {
    user,
    profile,
    loading,
    isAdmin,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
