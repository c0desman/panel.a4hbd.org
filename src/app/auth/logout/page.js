// FILE: src/app/logout/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";

export default function LogoutPage() {
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState(null); // null=checking, true=logged in, false=not logged in
  const [logoutStatus, setLogoutStatus] = useState(null); // null=initial, true=success, false=failed

  useEffect(() => {
    const checkAuthAndLogout = async () => {
      try {
        // First check if user is actually logged in
        const authResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/isauth`,
          { withCredentials: true }
        );

        if (authResponse.status === 200 && authResponse.data.message === "user verified") {
          setAuthStatus(true);
          
          // User is authenticated, proceed with logout
          const logoutResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/logout`,
            { withCredentials: true }
          );

          if (logoutResponse.status === 200) {
            setLogoutStatus(true);
            toast.success("Logged out successfully.");
            setTimeout(() => router.push("/auth/login"), 1000);
          } else {
            throw new Error("Logout failed");
          }
        } else {
          // User not logged in but somehow reached logout page
          setAuthStatus(false);
          toast.warning("You're not logged in");
          setTimeout(() => router.push("/auth/login"), 1000);
        }
      } catch (error) {
        setLogoutStatus(false);
        if (error.response?.status === 401) {
          // User not authenticated
          setAuthStatus(false);
          toast.warning("You're not logged in");
          setTimeout(() => router.push("/auth/login"), 1000);
        } else {
          // Other errors
          toast.error("Logout failed. Please try again.");
          setTimeout(() => router.push("/"), 1500);
        }
      }
    };

    checkAuthAndLogout();
  }, [router]);

  // Render appropriate UI based on status
  if (authStatus === null) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg text-muted-foreground">Checking authentication status...</p>
      </div>
    );
  }

  if (authStatus === false) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg text-muted-foreground">Redirecting to login page...</p>
      </div>
    );
  }

  if (logoutStatus === true) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg text-muted-foreground">Logout successful. Redirecting...</p>
      </div>
    );
  }

  if (logoutStatus === false) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg text-muted-foreground">Logout failed. Redirecting...</p>
      </div>
    );
  }

  // Default loading state
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-lg text-muted-foreground">Processing logout...</p>
    </div>
  );
}