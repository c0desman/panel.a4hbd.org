// FILE: src/app/(auth)/login/page.jsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    // Placeholder for backend API call
    setTimeout(() => {
      setLoading(false);
      alert("Logged in (dummy)");
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
            <div className="text-sm">
              Don’t have an account? <Link href="/register" className="text-blue-600">Register</Link>
            </div>
            <div className="text-sm">
              <Link href="/reset-password-request" className="text-blue-600">Forgot password?</Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
