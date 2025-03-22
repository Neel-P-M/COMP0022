'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { json } from 'stream/consumers';

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

    //Fetch lists
    const fetchLists = async() => {
        try{
            setIsLoading(true);
            const res = await fetch('/api/planner/lists', {
                method: 'GET',
            })

            if (!res.ok) {
                throw new Error('Failed fetching lists');
            }

            const data = await res.json();
            setLists(data);
            setError(null);
        } catch (error) {
            console.error('Error fetching lists:', error);
            setError('Failed to load movie lists');
        } finally {
        setIsLoading(false);
        }
    }

    //Create list
    const createList = async(e: React.FormEvent) => {
        e.preventDefault();

        if (!newListTitle.trim()) {
            return;
        }

        try{
            setIsCreating(true);

            const res = await fetch('/api/planner/lists', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                  },
                body: JSON.stringify({
                    title: newListTitle.trim(),
                    note: newListNote.trim(),
                }),
            })

            if (!res.ok) {
                throw new Error('Failed creating lists');
            }

            //Renew states of lists
            const newList = await res.json();
            setLists(lists => lists.concat(newList));

            //Reset forms
            setNewListTitle('');
            setNewListNote('');
            setShowCreateForm(false);
        } catch (error) {
            console.error('Error creating list:', error);
            setError('Failed to create list');
        } finally {
            setIsCreating(false);
        }
    }

    const deleteList = async (listId: number) => {
        if (!confirm('Are you sure you want to delete this list? This action cannot be undone.')) {
            return;
        }

        try{
            const res = await fetch(`/api/planner/lists/${listId}`, {
                method: 'DELETE',
            });

            if (!res.ok || res.status !== 204) {
                throw new Error('Failed deleting list');
            }

            setLists(lists => lists.filter(list => list.id != listId));
        } catch (error) {
            console.error('Error deleting list:', error);
            setError('Failed to delete list');
        }
    }

    if (authLoading) {
        return (
          <div className="flex items-center justify-center min-h-screen bg-[#0d0d14]">
            <div className="text-xl">Checking authentication...</div>
          </div>
        );
    }
    
      if (isLoading) {
        return (
          <div className="flex items-center justify-center min-h-screen bg-[#0d0d14]">
            <div className="text-xl">Loading your movie lists...</div>
          </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 bg-[#0d0d14] text-white min-h-screen">
        {/* Header Section */}
        <div className="mb-8">
          <div className="text-3xl font-bold text-[#e4c9a3] mb-4">My Movie Lists</div>
          <p className="text-gray-400 mb-6">
            Create and manage your custom movie collections
          </p>
          
          {error && (
            <div className="bg-red-900/30 border border-red-800 text-white p-4 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-[#d2b48c] text-[#0d0d14] py-2 px-4 rounded-lg hover:bg-[#e4c9a3] transition duration-200"
          >
            {showCreateForm ? 'Cancel' : '+ Create New List'}
          </button>
        </div>
        
        {/* Create List Form */}
        {showCreateForm && (
          <div className="bg-[#1a1a24] p-6 rounded-lg mb-8 border border-[#2a2a34]">
            <h2 className="text-xl font-semibold text-[#e4c9a3] mb-4">Create New List</h2>
            <form onSubmit={createList}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  List Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  className="w-full p-3 rounded-lg bg-[#0d0d14] text-white border border-[#2a2a34] focus:outline-none focus:border-[#e4c9a3]"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="note" className="block text-sm font-medium mb-1">
                  Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="note"
                  value={newListNote}
                  onChange={(e) => setNewListNote(e.target.value)}
                  className="w-full p-3 rounded-lg bg-[#0d0d14] text-white border border-[#2a2a34] focus:outline-none focus:border-[#e4c9a3] min-h-[100px]"
                  placeholder="Add some notes about this list..."
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-[#d2b48c] text-[#0d0d14] py-2 px-6 rounded-lg hover:bg-[#e4c9a3] transition duration-200 disabled:opacity-50"
                  disabled={isCreating || !newListTitle.trim()}
                >
                  {isCreating ? 'Creating...' : 'Create List'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Lists Section */}
        {lists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => (
              <div key={list.id} className="bg-[#1a1a24] rounded-lg border border-[#2a2a34] overflow-hidden flex flex-col">
                <div className="p-6 flex-grow">
                  <h3 className="text-xl font-semibold text-[#e4c9a3] mb-2">{list.title}</h3>
                  {list.note && <p className="text-gray-400 mb-4 text-sm">{list.note}</p>}
                  <p className="text-sm text-gray-300">{list.movieCount} {list.movieCount === 1 ? 'movie' : 'movies'}</p>
                </div>
                <div className="bg-[#13131b] p-4 flex justify-between">
                  <Link 
                    href={`/planner/${list.id}`}
                    className="text-[#d2b48c] hover:text-[#e4c9a3] hover:underline"
                  >
                    View List
                  </Link>
                  <button 
                    onClick={() => deleteList(list.id)}
                    className="text-red-400 hover:text-red-300 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#1a1a24] rounded-lg border border-[#2a2a34] p-8 text-center">
            <p className="text-xl text-gray-400 mb-4">You don't have any movie lists yet</p>
            <p className="text-gray-500 mb-6">Create your first list to start organizing your favorite movies</p>
            {!showCreateForm && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-[#d2b48c] text-[#0d0d14] py-2 px-6 rounded-lg hover:bg-[#e4c9a3] transition duration-200"
              >
                Create Your First List
              </button>
            )}
          </div>
        )}
      </div>
    ); 
}   