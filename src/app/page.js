// app/page.js
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation"; // ✅ App Router version

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/auth/login"); // ✅ push inside useEffect
  }, [router]);

  return null; // no need to render anything
}