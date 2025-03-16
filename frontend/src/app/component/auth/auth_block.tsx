import React, { useState } from 'react';
import { LoginForm } from './login';
import { RegisterForm } from './register';

type AuthBlockProps = {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'register';
};

export const AuthBlock: React.FC<AuthBlockProps> = ({ isOpen, onClose, initialView = 'login'}) => {
        const [view, setView] = useState<'login' | 'register'>(initialView);

        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                    <div className="flex justify-between mb-4">
                    <div className="flex space-x-4">
                        <button
                        className={`font-medium ${
                            view === 'login' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
                        }`}
                        onClick={() => setView('login')}
                        >
                            Login
                        </button>
                        <button
                        className={`font-medium ${
                            view === 'register' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
                        }`}
                        onClick={() => setView('register')}
                        >
                            Register
                        </button>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        &times;
                    </button>
                    </div>
                    
                    {view === 'login' ? <LoginForm /> : <RegisterForm />}
                </div>
            </div>
        )
    }