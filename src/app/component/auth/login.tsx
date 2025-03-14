import React, { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

export const LoginForm: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            //Checks if login is successful
            const loggedIn = await login(username,password);
            if (loggedIn) {
                router.push('/planner');
            } else {
                setError('Invalid credentials');
            } 
        } catch (err) {
            setError('An error occurred during login');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="max-w-xl mx-auto p-12 bg-[#1a1a24] rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4 text-[#e4c9a3]">Log in</h1>
            
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                <div className="mb-6">
                    <label className="block mb-2 text-sm font-medium">Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-2 border text-black rounded-md"
                        required
                    />
                </div>
                
                <div className="mb-8 relative">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium">Password</label>
                        <button 
                            type="button" 
                            className="text-[#e4c9a3] text-sm hover:underline"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border text-black rounded-md"
                        required
                    />
                </div>
                
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full p-2 bg-[#e4c9a3] text-[#1a1a24] rounded-md hover:bg-[#d6bb95] disabled:bg-cyan-400"
                >
                    {isLoading ? 'Logging in...' : 'Log in'}
                </button>
            </form>
        </div>
    );
};
