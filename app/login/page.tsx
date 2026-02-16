"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      // Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if email is verified
      if (!user.emailVerified) {
        setNeedsVerification(true);
        setLoading(false);
        return;
      }

      // Email is verified, proceed to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);

      if (err instanceof Error) {
        const firebaseError = err as { code?: string };

        if (firebaseError.code === "auth/user-not-found") {
          setError("No account found with this email.");
        } else if (firebaseError.code === "auth/wrong-password") {
          setError("Incorrect password.");
        } else if (firebaseError.code === "auth/invalid-email") {
          setError("Invalid email address.");
        } else if (firebaseError.code === "auth/too-many-requests") {
          setError("Too many failed attempts. Please try again later.");
        } else if (firebaseError.code === "auth/invalid-credential") {
          setError("Invalid email or password.");
        } else {
          setError("Login failed. Please check your credentials.");
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerification = async () => {
    setLoading(true);
    setError("");

    try {
      const user = auth.currentUser;
      
      if (!user) {
        setError("Please log in again to send verification email.");
        setLoading(false);
        return;
      }

      await sendEmailVerification(user);
      setVerificationSent(true);
    } catch (err) {
      console.error("Send verification error:", err);
      
      if (err instanceof Error) {
        const firebaseError = err as { code?: string; message?: string };
        setError(`Failed to send verification email: ${firebaseError.message}`);
      } else {
        setError("Failed to send verification email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setLoading(true);
    setError("");

    try {
      const user = auth.currentUser;
      
      if (!user) {
        setError("Please log in again.");
        setLoading(false);
        return;
      }

      // Reload user to get updated emailVerified status
      await user.reload();
      
      if (user.emailVerified) {
        router.push("/dashboard");
      } else {
        setError("Email not verified yet. Please check your inbox (and spam folder) and click the verification link.");
      }
    } catch (err) {
      console.error("Check verification error:", err);
      setError("Failed to check verification status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!resetEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!resetEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetEmailSent(true);
    } catch (err) {
      console.error("Password reset error:", err);

      if (err instanceof Error) {
        const firebaseError = err as { code?: string };

        if (firebaseError.code === "auth/user-not-found") {
          setError("No account found with this email address.");
        } else if (firebaseError.code === "auth/invalid-email") {
          setError("Invalid email address.");
        } else if (firebaseError.code === "auth/too-many-requests") {
          setError("Too many requests. Please try again later.");
        } else {
          setError("Failed to send password reset email. Please try again.");
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Show forgot password screen
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Reset Password
              </h2>
              <p className="text-gray-600">
                {resetEmailSent 
                  ? "Check your email for reset instructions"
                  : "Enter your email address and we'll send you a link to reset your password"
                }
              </p>
            </div>

            {!resetEmailSent ? (
              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="you@domain.com"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/30"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail("");
                    setError("");
                  }}
                  className="w-full text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
                >
                  ← Back to Login
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-sm text-green-800 mb-2">
                    ✓ Password reset email sent to <strong>{resetEmail}</strong>
                  </p>
                  <p className="text-xs text-green-700">
                    Check your inbox and spam folder for the reset link. The link will expire in 1 hour.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmailSent(false);
                    setResetEmail("");
                    setError("");
                  }}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all shadow-lg shadow-green-500/30"
                >
                  Back to Login
                </button>

                <button
                  onClick={() => {
                    setResetEmailSent(false);
                    setError("");
                  }}
                  className="w-full text-green-600 hover:text-green-700 font-medium text-sm transition-colors"
                >
                  Resend Reset Email
                </button>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-xs text-blue-800">
                    <strong>Tip:</strong> After resetting your password via the email link, return to the login page to sign in with your new password.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show verification required screen
  if (needsVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="h-8 w-8 text-amber-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Verify Your Email
              </h2>
              <p className="text-gray-600">
                For security, you need to verify your email address before accessing the dashboard.
              </p>
            </div>

            <div className="space-y-6">
              {!verificationSent ? (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Your email:</strong> {email}
                    </p>
                  </div>

                  <button
                    onClick={handleSendVerification}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/30"
                  >
                    {loading ? "Sending..." : "Send Verification Email"}
                  </button>
                </>
              ) : (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-sm text-green-800 mb-2">
                      ✓ Verification email sent to <strong>{email}</strong>
                    </p>
                    <p className="text-xs text-green-700">
                      Check your inbox and spam folder for the verification link.
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleCheckVerification}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/30"
                  >
                    {loading ? "Checking..." : "I've Verified My Email"}
                  </button>

                  <button
                    onClick={handleSendVerification}
                    disabled={loading}
                    className="w-full text-green-600 hover:text-green-700 font-medium text-sm transition-colors"
                  >
                    Resend Verification Email
                  </button>
                </>
              )}

              <button
                onClick={() => {
                  setNeedsVerification(false);
                  setVerificationSent(false);
                  auth.signOut();
                }}
                className="w-full text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
              >
                ← Back to Login
              </button>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs text-amber-800">
                  <strong>Note:</strong> After clicking the verification link in your email, come back here and click "I've Verified My Email" to continue.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>

        {/* Decorative circles */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-300 opacity-10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <Image
                src="/nobg.png"
                width={140}
                height={70}
                alt="Logo"
                className="h-10 w-auto"
              />
            </div>
            <h1 className="text-3xl font-bold">EmpowerDreamz</h1>
          </div>

          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Welcome back to your
            <br />
            success journey
          </h2>

          <p className="text-lg text-green-50 opacity-90 mb-8">
            Access your dashboard and continue building your dreams with
            powerful tools and insights.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Real-time Analytics</h3>
                <p className="text-green-50 opacity-80 text-sm">
                  Track your progress with comprehensive metrics
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Secure Platform</h3>
                <p className="text-green-50 opacity-80 text-sm">
                  Your data is protected with enterprise-grade security
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
              <Image src="/nobg.png" width={40} height={40} alt="Logo" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">EmpowerDreamz</h1>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Sign in
              </h2>
              <p className="text-gray-600">
                Enter your credentials to access the dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="you@domain.com"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Enter your password"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Remember me for 30 days
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/30"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>
          </div>

          {/* Footer links */}
          <div className="mt-8 text-center space-x-4 text-sm text-gray-600">
            <button
              onClick={() => router.push("/")}
              className="hover:text-green-600 transition-colors"
            >
              Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}