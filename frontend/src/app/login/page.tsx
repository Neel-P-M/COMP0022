"use client";

import React, { useEffect, Suspense } from 'react';
import { LoginForm } from '@/app/component/auth/login';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

// Create a component that uses useSearchParams
function LoginContent() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const redirectPath = useSearchParams().get('redirect') || '/';

  useEffect(() => {
    console.log("Login page:", isAuthenticated);
    if (isAuthenticated) {
      router.push(redirectPath);
    }
  }, [isAuthenticated, redirectPath, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-top p-12">
      <div className="w-full max-w-md">
        <LoginForm />
        <p className="mt-4 text-center">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[#d2b48c] hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

// Main page component that provides the Suspense boundary
export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}