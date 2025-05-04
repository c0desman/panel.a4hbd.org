// FILE: src/app/(auth)/register/page.jsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();
    setLoading(true);
    // Placeholder for backend registration call
    setTimeout(() => {
      setLoading(false);
      alert("Registered (dummy)");
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Register</CardTitle>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" type="text" placeholder="John Doe" required />
            </div>
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
              {loading ? "Registering..." : "Register"}
            </Button>
            <div className="text-sm">
              Already have an account? <Link href="/login" className="text-blue-600">Login</Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
