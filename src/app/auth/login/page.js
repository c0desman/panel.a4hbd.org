"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from "@/context/auth";

export default function LoginPage() {
  // ==================== STATE MANAGEMENT ====================
  const router = useRouter();
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  
  // Form submission state
  const [submitting, setSubmitting] = useState(false);
  
  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  
  // Caps lock detection state
  const [capsLockOn, setCapsLockOn] = useState(false);
  
  // Authentication context
  const { isLoading, isAuthenticated, verifySession } = useAuth();

  // Form configuration with real-time validation
  const {
    register,
    handleSubmit,
    formState: { errors, isValidating },
    trigger,
    watch
  } = useForm({
    mode: "onChange", // Enable real-time validation
    criteriaMode: "all"
  });

  // Watch form values for real-time validation triggers
  const watchedFields = watch();

  // ==================== EFFECTS ====================
  
  /**
   * Auto-focus email input on component mount
   */
  useEffect(() => {
    if (emailInputRef.current && !isLoading) {
      emailInputRef.current.focus();
    }
  }, [isLoading]);

  /**
   * Redirect authenticated users to dashboard
   */
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  /**
   * Real-time validation trigger for email
   */
  useEffect(() => {
    if (watchedFields.email && watchedFields.email.length > 0) {
      trigger("email");
    }
  }, [watchedFields.email, trigger]);

  /**
   * Real-time validation trigger for password
   */
  useEffect(() => {
    if (watchedFields.password && watchedFields.password.length > 0) {
      trigger("password");
    }
  }, [watchedFields.password, trigger]);

  // ==================== EVENT HANDLERS ====================
  
  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  /**
   * Detect caps lock state during password input
   * @param {KeyboardEvent} event - Keyboard event
   */
  const handlePasswordKeyPress = useCallback((event) => {
    const capsLock = event.getModifierState && event.getModifierState('CapsLock');
    setCapsLockOn(capsLock);
  }, []);

  /**
   * Handle form submission with improved error handling and UX
   * @param {Object} data - Form data containing email and password
   */
  const onSubmit = async (data) => {
    setSubmitting(true);
    
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/login`,
        {
          email: data.email,
          password: data.password,
        },
        { withCredentials: true }
      );

      if (response.status === 200) {
        // Announce success to screen readers
        const successMessage = 'Login successful! Redirecting to dashboard...';
        toast.success(successMessage);
        
        // Screen reader announcement
        announceToScreenReader(successMessage);
        
        // Verify session and update auth state
        await verifySession(true);
        
        // Use window.location to ensure complete state refresh
        window.location.href = "/dashboard";
      }
    } catch (error) {
      handleLoginError(error);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Enhanced error handling with better user feedback
   * @param {Error} error - Axios error object
   */
  const handleLoginError = useCallback((error) => {
    let errorMessage = 'An unexpected error occurred. Please try again.';
    
    if (error.response) {
      // Handle backend validation errors
      if (error.response.data.errors) {
        error.response.data.errors.forEach(err => {
          toast.error(err.msg);
          announceToScreenReader(`Error: ${err.msg}`);
        });
        return;
      } 
      // Handle specific error messages
      else if (error.response.data.message) {
        const message = error.response.data.message;
        if (message === "user not found") {
          errorMessage = "Account not found. Please register first.";
        } else if (message === "password is incorrect") {
          errorMessage = "Incorrect password. Please try again.";
          // Focus password field for easy retry
          setTimeout(() => {
            passwordInputRef.current?.focus();
            passwordInputRef.current?.select();
          }, 100);
        } else {
          errorMessage = message;
        }
      }
    } else {
      // Handle network errors
      errorMessage = 'Network error. Please check your connection and try again.';
    }
    
    toast.error(errorMessage);
    announceToScreenReader(`Error: ${errorMessage}`);
  }, []);

  /**
   * Announce messages to screen readers
   * @param {string} message - Message to announce
   */
  const announceToScreenReader = useCallback((message) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  /**
   * Handle keyboard navigation for better accessibility
   * @param {KeyboardEvent} event - Keyboard event
   * @param {string} action - Action to perform
   */
  const handleKeyDown = useCallback((event, action) => {
    if (event.key === 'Enter' && action === 'submit') {
      handleSubmit(onSubmit)();
    }
  }, [handleSubmit, onSubmit]);

  // ==================== RENDER HELPERS ====================
  
  /**
   * Render field error with improved styling and accessibility
   * @param {Object} error - Form error object
   * @param {string} fieldName - Name of the field
   */
  const renderFieldError = useCallback((error, fieldName) => {
    if (!error) return null;
    
    return (
      <div 
        className="flex items-center gap-1 mt-1 text-sm text-red-500 animate-in slide-in-from-top-1 duration-200"
        role="alert"
        aria-live="polite"
        id={`${fieldName}-error`}
      >
        <AlertCircle className="h-3 w-3 flex-shrink-0" />
        <span>{error.message}</span>
      </div>
    );
  }, []);

  // ==================== LOADING STATE ====================
  
  // Show loading state while auth is initializing
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground" aria-live="polite">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Welcome back
          </CardTitle>
        </CardHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-6">
            {/* ==================== EMAIL FIELD ==================== */}
            <div className="space-y-2">
              <Label 
                htmlFor="email" 
                className="text-sm font-medium"
              >
                Email
                <span className="text-red-500 ml-1" aria-label="required">*</span>
              </Label>
              
              <div className="relative">
                <Input
                  ref={emailInputRef}
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={submitting}
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  className={`transition-all duration-200 ${
                    errors.email 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                      : "focus:border-primary focus:ring-primary/20"
                  }`}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Please enter a valid email address"
                    }
                  })}
                  onKeyDown={(e) => handleKeyDown(e, 'submit')}
                />
              </div>
              
              {renderFieldError(errors.email, 'email')}
            </div>

            {/* ==================== PASSWORD FIELD ==================== */}
            <div className="space-y-2">
              <Label 
                htmlFor="password" 
                className="text-sm font-medium"
              >
                Password
                <span className="text-red-500 ml-1" aria-label="required">*</span>
              </Label>
              
              <div className="relative">
                <Input
                  ref={passwordInputRef}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={submitting}
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={
                    errors.password ? 'password-error' : 
                    capsLockOn ? 'caps-lock-warning' : undefined
                  }
                  className={`pr-12 transition-all duration-200 ${
                    errors.password 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                      : "focus:border-primary focus:ring-primary/20"
                  }`}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters"
                    }
                  })}
                  onKeyDown={(e) => {
                    handlePasswordKeyPress(e);
                    handleKeyDown(e, 'submit');
                  }}
                />
                
                {/* Password visibility toggle button */}
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded"
                  onClick={togglePasswordVisibility}
                  disabled={submitting}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={0}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              
              {/* Caps Lock Warning */}
              {capsLockOn && (
                <div 
                  className="flex items-center gap-1 mt-1 text-sm text-amber-600 animate-in slide-in-from-top-1 duration-200"
                  role="alert"
                  aria-live="polite"
                  id="caps-lock-warning"
                >
                  <AlertCircle className="h-3 w-3 flex-shrink-0" />
                  <span>Caps Lock is on</span>
                </div>
              )}
              
              {renderFieldError(errors.password, 'password')}
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col pt-4 gap-4">
            {/* ==================== SUBMIT BUTTON ==================== */}
            <Button 
              type="submit" 
              className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" 
              disabled={submitting || isValidating}
              aria-describedby={submitting ? 'loading-status' : undefined}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span id="loading-status">Logging in...</span>
                </>
              ) : "Login"}
            </Button>
            
            {/* ==================== NAVIGATION LINKS ==================== */}
            <div className="flex justify-between w-full text-sm">
              <Link 
                href="/auth/register" 
                className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-1 py-0.5 transition-all duration-200"
                tabIndex={0}
              >
                Create account
              </Link>
              <Link 
                href="/auth/reset-password" 
                className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-1 py-0.5 transition-all duration-200"
                tabIndex={0}
              >
                Forgot password?
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}