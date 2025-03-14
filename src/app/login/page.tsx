"use client";

import React, { useEffect } from 'react';
import { LoginForm } from '@/app/component/auth/login';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import { useRouter, useSearchParams } from '../../../node_modules/next/navigation';

export default function LoginPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const redirectPath = useSearchParams().get('redirect') || '/'

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
                Don't have an account?{' '}
                <Link href="/register" className="text-[#d2b48c] hover:underline">
                    Register here
                </Link>
            </p>
        </div>
    </div>
  );
}