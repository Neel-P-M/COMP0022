import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Type definitions
type User = {
    id: string;
    username: string;
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    register: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create AuthProvider component
export const AuthProvider= ({children}: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Check Auth on initial render
    useEffect(() => {
        const checkLoggedIn = async () => {
            try {
                const res = await fetch('/api/auth/me');

                if (res.ok) {
                    const userData = await res.json();
                    setUser(userData);
                } 
            } catch (error) {
                console.error('Auth check failed:', error);
            } finally {
                setLoading(false);
            }
        };

        checkLoggedIn();
    }, []);


    // Login function
    const login = async (username: string, password: string) => {
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          });
      
          if (!res.ok) {
            return false;
          }
      
          const userData = await res.json();
          setUser(userData);
          return true;
          
        } catch (error) {
          console.error('Login failed:', error);
          return false;
        }
    };

    // Register function
    const register = async (username: string, password: string) => {
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          });
      
          if (!res.ok) {
            return false;
          }
      
          const userData = await res.json();
          setUser(userData);
          return true;
        } catch (error) {
          console.error('Registration failed:', error);
          return false;
        }
    };

    const logout = async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
          setUser(null);
          router.push('/');
        } catch (error) {
          console.error('Logout failed:', error);
        }
    };

    return (
        <AuthContext.Provider
          value={{
            user,
            loading,
            login,
            register,
            logout,
            isAuthenticated: !!user,
          }}
        >
          {children}
        </AuthContext.Provider>
    );
};

// Creates a hook to access auth state and methods
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
  };