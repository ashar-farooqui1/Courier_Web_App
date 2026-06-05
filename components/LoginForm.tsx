"use client";

import React, { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AppLogo from "@/components/AppLogo";
import OtpVerificationForm from "@/components/OtpVerificationForm";
import { useRouter } from "next/navigation";
import { EmailNotVerifiedError, isEmailNotVerifiedError, login } from "@/lib/api/auth";
import { saveAuthSession } from "@/lib/auth/role";

const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otpInfoMessage, setOtpInfoMessage] = useState("");

  const attemptLogin = async (loginEmail: string, loginPassword: string) => {
    const session = await login({
      email: loginEmail.trim(),
      password: loginPassword,
    });

    saveAuthSession(session);
    router.push("/dashboard");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      await attemptLogin(email, password);
    } catch (err) {
      if (isEmailNotVerifiedError(err)) {
        const verifiedEmail =
          err instanceof EmailNotVerifiedError ? err.email : email.trim();
        setEmail(verifiedEmail);
        setOtpInfoMessage(
          err instanceof Error ? err.message : "Email not verified. Please enter the OTP."
        );
        setShowOtpVerification(true);
        setLoginError("");
        return;
      }

      setLoginError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerified = async (message: string) => {
    setShowOtpVerification(false);
    setSuccessMessage(message);
    setLoading(true);
    setLoginError("");

    try {
      await attemptLogin(email, password);
    } catch (err) {
      if (isEmailNotVerifiedError(err)) {
        setOtpInfoMessage(
          err instanceof Error ? err.message : "Email is still not verified. Please try again."
        );
        setShowOtpVerification(true);
        return;
      }

      setLoginError(err instanceof Error ? err.message : "Login failed after verification.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowOtpVerification(false);
    setOtpInfoMessage("");
    setLoginError("");
  };

  if (showOtpVerification) {
    return (
      <OtpVerificationForm
        email={email}
        infoMessage={otpInfoMessage}
        onVerified={handleOtpVerified}
        onBack={handleBackToLogin}
      />
    );
  }

  return (
    <div className="w-full max-w-5xl bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,43,91,0.15)] overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-slate-100">
      <div className="hidden md:flex md:w-[55%] relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-primary/20 z-10 mix-blend-multiply" />
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"
          alt="Office Environment"
          className="absolute inset-0 object-cover w-full h-full transform hover:scale-105 transition-transform duration-700"
        />
        <div className="relative z-20 p-12 text-white flex flex-col justify-end h-full w-full bg-gradient-to-t from-primary/80 to-transparent">
          <h3 className="text-3xl font-bold mb-2">Streamline Your Logistics</h3>
          <p className="text-slate-200 text-sm max-w-md">
            Experience the power of efficient courier management with Stallionex. Fast, reliable, and secure.
          </p>
        </div>
      </div>

      <div className="w-full md:w-[45%] p-8 md:p-14 flex flex-col justify-center bg-white">
        <div className="mb-10">
          <AppLogo className="items-start mb-8 scale-110 origin-left" />
          <h2 className="text-3xl font-extrabold text-primary mb-2 tracking-tight">Login Portal</h2>
          <p className="text-slate-500 text-sm">Welcome back! Access your management dashboard.</p>
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Email</label>
              <Input
                type="email"
                placeholder="Enter your email"
                icon={<Mail size={18} className="text-primary/60" />}
                className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">
                  Password
                </label>
                <button type="button" className="text-xs text-secondary font-semibold hover:underline">
                  Forgot password?
                </button>
              </div>
              <Input
                type="password"
                placeholder="Enter your password"
                icon={<Lock size={18} className="text-primary/60" />}
                className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
              />
            </div>
          </div>

          {successMessage ? (
            <p className="text-sm text-emerald-600 font-medium bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3">
              {successMessage}
            </p>
          ) : null}

          {loginError ? (
            <p className="text-sm text-red-500 font-medium bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              {loginError}
            </p>
          ) : null}

          <div className="flex items-center">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary/20 transition-all cursor-pointer"
                disabled={loading}
              />
              <span className="text-sm text-slate-600 font-medium group-hover:text-primary transition-colors">
                Keep me signed in
              </span>
            </label>
          </div>

          <div className="flex flex-col gap-4 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="h-14 font-bold text-lg bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Login to Account"}
            </Button>
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
                New to Portal?
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              className="h-14 font-bold text-lg border-2 border-primary/20 text-primary hover:bg-primary/5 transition-all"
            >
              Request Registration
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
