import React, { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

export const RegisterForm: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmedPassword, setConfirmedPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { register } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Reconfirming the inserted password
        if (password !== confirmedPassword) {
            setError('Password does not match');
            return;
        }

        setIsLoading(true);

        try {
            const registered = await register(username, password);
            if (registered) {
                router.push('/planner');
            } else {
                setError('Registration failed. Username may already exist');
            }
        } catch (err) {
            setError('An error occurred during registration');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-12 bg-[#1a1a24] rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-[#e4c9a3]">Create Account</h1>

            {error && (
                <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-6">
                    <label className="block mb-2 text-sm font-medium text-[#e4c9a3]">Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-2 border rounded-md text-black"
                        required
                    />
                </div>

                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2"> {/* Flex container for label and button */}
                        <label className="text-sm font-medium text-[#e4c9a3]">Password</label>
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
                        className="w-full p-2 border rounded-md text-black"
                        required
                    />
                </div>

                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2"> {/* Flex container for label and button */}
                        <label className="text-sm font-medium text-[#e4c9a3]">Confirm Password</label>
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
                        value={confirmedPassword}
                        onChange={(e) => setConfirmedPassword(e.target.value)}
                        className="w-full p-2 border rounded-md text-black"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full p-2 bg-[#e4c9a3] text-[#1a1a24] rounded-md hover:bg-[#d6bb95] disabled:bg-cyan-400"
                >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                </button>
            </form>
        </div>
    );
};