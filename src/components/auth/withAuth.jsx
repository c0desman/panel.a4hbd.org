// src/components/auth/withAuth.jsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

export default function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const router = useRouter();
    const [status, setStatus] = useState('checking'); // 'checking' | 'authenticated' | 'unauthenticated'

    useEffect(() => {
      const verifyAuth = async () => {
        try {
          console.log('[Auth] Initiating auth check...');
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/isauth`,
            {
              withCredentials: true,
              timeout: 5000,
              headers: {
                'Cache-Control': 'no-store'
              }
            }
          );

          console.log('[Auth] Response:', response.data);
          
          if (response.data?.message === "user verified") {
            console.log('[Auth] User verified');
            setStatus('authenticated');
          } else {
            throw new Error('Invalid auth response');
          }
        } catch (error) {
          console.error('[Auth] Error:', error.message);
          if (error.response) {
            console.error('[Auth] Response error:', error.response.status, error.response.data);
          }
          setStatus('unauthenticated');
          router.replace(`/auth/login?from=${encodeURIComponent(window.location.pathname)}`);
        }
      };

      verifyAuth();
    }, [router]);

    console.log('[Auth] Current status:', status);

    if (status === 'checking') {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-background">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin" />
            <p className="mt-4 text-lg">Verifying your session...</p>
            <p className="text-sm text-muted-foreground">
              This may take a few moments
            </p>
          </div>
        </div>
      );
    }

    if (status === 'authenticated') {
      return <Component {...props} />;
    }

    return null;
  };
}