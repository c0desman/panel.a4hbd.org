// FILE: src/app/logout/page.jsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/auth"; // Adjust the import path as necessary

export default function LogoutPage() {
  const router = useRouter();
  const { handleLogout, isAuthenticated } = useAuth();

  useEffect(() => {
    const logoutUser  = async () => {
      if (isAuthenticated) {
        try {
          await handleLogout(); // Call the logout function from context
          toast.success("Logged out successfully.");
          setTimeout(() => router.push("/auth/login"), 1000);
        } catch (error) {
          console.error("Logout error:", error); // Log the error for debugging
          toast.error("Logout failed. Please try again.");
          setTimeout(() => router.push("/auth/login"), 1000);
        }
      } else {
        toast.warning("You're not logged in");
        setTimeout(() => router.push("/auth/login"), 1000);
      }
    };

    logoutUser ();
  }, [handleLogout, isAuthenticated, router]);

  // Render loading state while processing logout
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-lg text-muted-foreground">Processing logout...</p>
    </div>
  );
}
