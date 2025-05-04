// app/auth/logout/page.js
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Example: Clear frontend session, then redirect to login
    localStorage.removeItem("authToken");
    toast("Event has been created.");

    setTimeout(() => {
      router.push("/auth/login");
    }, 1000);
  }, [router]);

  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-lg text-muted-foreground">Logging out...</p>
    </div>
  );
}