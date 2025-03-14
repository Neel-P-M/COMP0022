"use client";

import React, { useEffect } from 'react';
import { RegisterForm } from '@/app/component/auth/register';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import { useRouter, useSearchParams } from '../../../node_modules/next/navigation';

export default function RegisterPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const redirectPath = useSearchParams().get('redirect') || '/'

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectPath);
    }
  }, [isAuthenticated, redirectPath, router]);


  return (
    <div className="min-h-screen flex flex-col items-center justify-top p-12">
        <div className="w-full max-w-md">
            <RegisterForm />
            <p className="mt-4 text-center">
                Already have an account?{' '}
                 <Link href="/login" className="text-[#d2b48c] hover:underline">
                    Login here
                </Link>
            </p>
        </div>
    </div>
  );
}