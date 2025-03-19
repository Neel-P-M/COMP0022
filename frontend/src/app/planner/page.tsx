'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

interface MovieList {
  id: number;
  title: string;
  note: string;
  movieCount: number;
}

export default function Planner() {
    const { isAuthenticated, loading: authLoading} = useAuth();
    const router = useRouter();

    const [lists, setLists] = useState<MovieList[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    //Create list form state
    const [newListTitle, setNewListTitle] = useState('');
    const [newListNote, setNewListNote] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

    //Checks if user is authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
          router.push('/login?redirect=/planner');
        }
    }, [isAuthenticated, authLoading, router]);

    //Fetch users list if authenticated
    useEffect(() => {
        if(isAuthenticated) {
            fetchLists();
        }
    }, [isAuthenticated]);

    const fetchLists = async() => {
        try{
            setIsLoading(true);
            const res = await fetch('/api/planner/list', {
                method: 'GET',
            })
        }
    }
}   