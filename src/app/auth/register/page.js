// FILE: src/app/auth/register/page.jsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_BASE_URL}/register`, {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone,
      });

      if (response.status === 200) {
        toast.success('Registration successful! Please check your email for verification.');
        router.push('/auth/login');
      }
    } catch (error) {
      if (error.response) {
        // Handle validation errors from backend
        if (error.response.data.errors) {
          error.response.data.errors.forEach(err => {
            toast.error(err.msg);
          });
        } else if (error.response.data.message) {
          toast.error(error.response.data.message);
        }
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Register</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* First Name */}
            <div>
              <Label className='mb-2' htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName" 
                type="text" 
                placeholder="John" 
                {...register("firstName", { 
                  required: "First Name is required",
                  minLength: {
                    value: 3,
                    message: "First Name must be at least 3 characters"
                  }
                })}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <Label className='mb-2' htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                type="text" 
                placeholder="Doe" 
                {...register("lastName", { 
                  required: "Last Name is required",
                  minLength: {
                    value: 3,
                    message: "Last Name must be at least 3 characters"
                  }
                })}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>
              )}
            </div>

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
                    value: 8,
                    message: "Password must be at least 8 characters"
                  }
                })}
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <Label className='mb-2' htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                type="tel" 
                placeholder="01XXXXXXXXX" 
                {...register("phone", { 
                  required: "Phone number is required",
                  pattern: {
                    value: /^01[3-9]\d{8}$/,
                    message: "Invalid Bangladeshi phone number"
                  }
                })}
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-2 mt-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </Button>
            <div className="text-sm">
              Already have an account? <Link href="/auth/login" className="text-blue-600">Login</Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}