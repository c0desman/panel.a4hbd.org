/*
  📁 Project: Dashboard Layout (Frontend Only)
  📚 Libraries: Tailwind CSS, ShadCN UI, Axios
  🧩 Features:
    - Authentication check before rendering
    - Axios for API calls
    - Environment variable for backend URL
    - Loading state handling
*/

"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { USER_ROLES } from '@/constants';

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/isauth`,
          { withCredentials: true }
        );

        if (!data?.data?.id) {
          throw new Error('Invalid session data');
        }

        setUser(data.data);
      } catch (error) {
        console.error('Session verification failed:', error);
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
      <div className="p-6">
        {/* Admin-specific content */}
        {user?.usertype === USER_ROLES.ADMIN && (
          <div className="mb-6 p-4 border rounded-lg bg-destructive/10">
            <h2 className="text-xl font-semibold">Administration Panel</h2>
            <p className="text-sm text-muted-foreground">
              You have elevated privileges
            </p>
          </div>
        )}

        {/* Editor or Admin content */}
        {[USER_ROLES.ADMIN, USER_ROLES.EDITOR].includes(user?.usertype) && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded mr-2">
            Create New Content
          </button>
        )}

        {/* All logged-in users */}
        <div className={`mt-4 p-4 border rounded-lg ${
          user?.usertype === USER_ROLES.ADMIN 
            ? 'border-destructive' 
            : 'border-border'
        }`}>
          <p>Welcome, {user?.usertype || USER_ROLES.GUEST} user!</p>
        </div>
      </div>
    );
  }