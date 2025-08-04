"use client";
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { USER_ROLES, PERMISSION_LEVELS } from '@/constants';

const AuthContext = createContext();

// 🔒 Global lock to prevent multiple refreshes
let refreshInProgress = null;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const GlobalLoader = () => (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );

  const verifySession = useCallback(async (suppressRedirect = false) => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/isauth`,
        { withCredentials: true }
      );

      if (!data?.data?.id) {
        throw new Error('Invalid session');
      }

      setUser(data.data);
      return data.data;
    } catch (error) {
      if (error.response?.status === 401) {
        setUser(null);
        if (!suppressRedirect) {
          router.push('/auth/login');
        }
        return null;
      }

      console.error('Session verification failed:', error);
      setUser(null);
      if (!suppressRedirect) {
        router.push('/auth/login');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const refreshSession = useCallback(() => {
    // ✅ Use persistent global lock to avoid race conditions
    if (refreshInProgress) return refreshInProgress;

    refreshInProgress = axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/refresh`,
      { withCredentials: true }
    )
      .then(response => {
        if (response.status === 200) {
          return verifySession(true); // Suppress redirect on refresh
        } else {
          throw new Error('Unexpected response during refresh');
        }
      })
      .catch(error => {
        console.error('Session refresh failed:', error);
        setUser(null);
        router.push('/auth/login');
      })
      .finally(() => {
        refreshInProgress = null;
      });

    return refreshInProgress;
  }, [router, verifySession]);

  const checkSessionTimeout = useCallback(() => {
    const timeout = setTimeout(() => {
      refreshSession();
    }, 14 * 60 * 1000); // Refresh after 14 mins (1 min before expiry)

    return () => clearTimeout(timeout); // Clean up
  }, [refreshSession]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'auth-logout') {
        setUser(null);
        router.push('/auth/login');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [router]);

  useEffect(() => {
    const initializeAuth = async () => {
      await verifySession();
      setIsLoading(false);
    };
    initializeAuth();
  }, [verifySession]);

  useEffect(() => {
    if (user) {
      const clear = checkSessionTimeout();
      return clear;
    }
  }, [user, checkSessionTimeout]);

  const handleLogout = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/logout`,
        { withCredentials: true }
      );
      console.log("Logout response:", response);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.setItem('auth-logout', Date.now());
      router.push('/auth/login');
    }
  }, [router]);

  const hasRole = (role) => user?.usertype === role;
  const hasAnyRole = (roles) => roles.includes(user?.usertype);
  const hasHigherPermission = (role) =>
    PERMISSION_LEVELS[user?.usertype] <= PERMISSION_LEVELS[role];

  const value = {
    user,
    isLoading,
    verifySession,
    handleLogout,
    isAuthenticated: !!user,
    hasRole,
    hasAnyRole,
    hasHigherPermission,
    USER_ROLES,
    PERMISSION_LEVELS
  };

  return (
    <AuthContext.Provider value={value}>
      {isLoading ? <GlobalLoader /> : children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
