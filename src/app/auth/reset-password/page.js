// FILE: src/app/(auth)/reset-password-request/page.jsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export default function ResetPasswordRequestPage() {
  const [emailSent, setEmailSent] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    setEmailSent(true);
    // Backend call goes here
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className="w-full">
              Send Reset Link
            </Button>
            {emailSent && (
              <p className="text-sm text-green-600">Reset link sent! Check your email.</p>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}