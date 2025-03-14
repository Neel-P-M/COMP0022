"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

export default function UserAuth() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname()
    const { logout } = useAuth();

    useEffect(() => {
        //Fetch current user data
        const fetchUser = async() => {
            try {
                const res = await fetch('/api/auth/me', {
                    method: 'GET',
                    credentials: 'include', // Important to include cookies
                });


            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
            } else {
                // If not authenticated, clear user state
                setUser(null);
            }
            } catch (error) {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        }
        
        fetchUser();
    }, [pathname]);

    const handleLogout = async () => {
        setIsLoading(true);

        try {
            await logout();
            setUser(null);
            router.refresh();
        
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="auth-container">Loading...</div>;
    }

    return (
    <div className="auth-container">
      {user ? (
        <div className="user-menu">
          <span className="username">{user.username}</span>
          <div className="dropdown-menu">
            <button onClick={() => {handleLogout()}}  className="dropdown-item logout-btn">
              Logout
            </button>
          </div>
        </div>
      ) : (
        <div className="auth-buttons">
          <Link href="/login" className="auth-button login-button">
            Login
          </Link>
          <Link href="/register" className="auth-button register-button">
            Register
          </Link>
        </div>
      )}
    </div>
  );
}