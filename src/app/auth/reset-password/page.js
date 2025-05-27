// FILE: src/app/(auth)/reset-password/page.jsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1 = email input, 2 = OTP+password input
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [authChecked, setAuthChecked] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setError,
    clearErrors,
  } = useForm({
    defaultValues: {
      email: "",
      otp: "",
      newPassword: ""
    }
  });

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/isauth`,
          { withCredentials: true }
        );

        if (response.status === 200 && response.data.message === "user verified") {
          router.push("/dashboard");
        }
      } catch (error) {
        // User is not authenticated, proceed with reset password page
        console.log("User not authenticated, showing reset password page");
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, [router]);

  // Countdown timer for resend OTP button
  useEffect(() => {
    let timer;
    if (resendDisabled && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [resendDisabled, countdown]);

  // Handle email submission to request OTP
  const handleEmailSubmit = async (data) => {
    setLoading(true);
    clearErrors();
    
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/resetrequest`,
        { email: data.email },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.message === "otp sent") {
        setStep(2);
        setResendDisabled(true);
        setCountdown(30);
        toast.success("OTP sent to your email!");
      } else {
        throw new Error(response.data.message || "Unexpected response");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                         err.response?.data?.errors?.[0]?.msg || 
                         err.message || 
                         "Failed to send OTP";
      setError("root", {
        type: "manual",
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP resend request
  const handleResendOTP = async () => {
    setLoading(true);
    clearErrors();
    
    try {
      const email = watch("email");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/resetrequest`,
        { email }
      );

      if (response.data.message === "otp sent") {
        setResendDisabled(true);
        setCountdown(30);
        toast.success("New OTP sent to your email!");
      } else {
        throw new Error(response.data.message || "Unexpected response");
      }
    } catch (err) {
      setError("root", {
        type: "manual",
        message: err.response?.data?.message || "Failed to resend OTP"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP and password submission
  const handlePasswordReset = async (data) => {
    setLoading(true);
    clearErrors();
    
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/resetpassword`,
        { 
          otp: data.otp, 
          password: data.newPassword 
        }
      );

      if (response.data.message === "password reset successful") {
        toast.success("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/auth/login");
        }, 1500);
      } else if (response.data.message === "failed") {
        throw new Error("Invalid or expired OTP");
      } else {
        throw new Error(response.data.message || "Password reset failed");
      }
    } catch (err) {
      setError("root", {
        type: "manual",
        message: err.response?.data?.message || 
               err.message || 
               "Failed to reset password"
      });
    } finally {
      setLoading(false);
    }
  };

  // Don't render anything until auth check is complete
  if (!authChecked) {
    return null; // or a loading spinner
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {step === 1 ? "Reset Password" : "Enter OTP & New Password"}
          </CardTitle>
        </CardHeader>
        
        <form onSubmit={handleSubmit(step === 1 ? handleEmailSubmit : handlePasswordReset)}>
          <CardContent className="space-y-4">
            {/* Step 1: Email input */}
            {step === 1 && (
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
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            )}

            {/* Step 2: OTP and new password */}
            {step === 2 && (
              <>
                <div>
                  <Label className='mb-2' htmlFor="otp">OTP</Label>
                  <Input 
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    {...register("otp", {
                      required: "OTP is required",
                      minLength: {
                        value: 6,
                        message: "OTP must be 6 digits"
                      },
                      maxLength: {
                        value: 6,
                        message: "OTP must be 6 digits"
                      }
                    })}
                  />
                  {errors.otp && (
                    <p className="mt-1 text-sm text-red-600">{errors.otp.message}</p>
                  )}
                </div>
                <div>
                  <Label className='mb-2' htmlFor="newPassword">New Password</Label>
                  <Input 
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password (min 8 characters)"
                    {...register("newPassword", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters"
                      }
                    })}
                  />
                  {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
                  )}
                </div>
              </>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col gap-2 mt-3">
            {errors.root && (
              <p className="text-sm text-red-600">{errors.root.message}</p>
            )}
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? "Processing..." : step === 1 ? "Send OTP" : "Reset Password"}
            </Button>
            
            {step === 2 && (
              <>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={handleResendOTP}
                  disabled={resendDisabled || loading}
                >
                  {resendDisabled ? `Resend OTP in ${countdown}s` : "Send OTP Again"}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => {
                    setStep(1);
                    reset({ otp: "", newPassword: "" });
                  }}
                >
                  Back to Email
                </Button>
              </>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}