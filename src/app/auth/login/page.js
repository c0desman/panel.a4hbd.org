"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Check if the user is authenticated on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/isauth`, {
          withCredentials: true // Important for cookies
        });
        if (response.status === 200 && response.data.message === "user verified") {
          // User is authenticated, redirect to dashboard
          router.push("/dashboard");
        }
      } catch (error) {
        // Handle error if needed, but we want to show the login form if not authenticated
      }
    };

    checkAuth();
  }, [router]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/login`, {
        email: data.email,
        password: data.password,
      }, {
        withCredentials: true // Important for cookies
      });
      // Check if the login was successful
      if (response.status === 200) {
        toast.success('Login successful!');
        router.push("/dashboard");
      }
    } catch (error) {
      if (error.response) {
        if (error.response.data.errors) {
          error.response.data.errors.forEach(err => {
            toast.error(err.msg);
          });
        } else if (error.response.data.message) {
          const message = error.response.data.message;
          if (message === "user not found") {
            toast.error("Account not found. Please register first.");
          } else if (message === "password is incorrect") {
            toast.error("Incorrect password. Please try again.");
          } else {
            toast.error(message);
          }
        }
      } else {
        toast.error('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* Email */}
            <div>
              <Label className='mb-2' htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                {...register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <Label className='mb-2' htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                {...register("password", { 
                  required: "Password is required",
                  minLength: {
                    value: 4,
                    message: "Password must be at least 4 characters"
                  }
                })}
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-2 mt-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
            <div className="text-sm">
              Don't have an account? <Link href="/auth/register" className="text-blue-600">Register</Link>
            </div>
            <div className="text-sm">
              <Link href="/auth/reset-password" className="text-blue-600">Forgot password?</Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}