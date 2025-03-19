'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { MovieCard } from '@/app/component/movies/movieCard';
import { title } from 'process';

interface Principal {
    name: string;
    role: string;
    character?: string;
  }

interface Movie {
    id: number;
    title: string;
    release_year: number;
    rating: number;
    genres: string[];
    principals: Principal[];
}

interface MovieList {
    id: number,
    title: string,
    note: string,
    movies: Movie[],
    movie_count: number;
}

export default function ListPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated, loading: authLoading } = useAuth();
    const listId = params?.id;
    
    const [list, setList] = useState<MovieList | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    //List form state
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState('');
    const [note, setNote] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push(`/login?redirect=/planner/${listId}`);
        }
    }, [isAuthenticated, authLoading, router, listId])

    useEffect(() => {
        if (isAuthenticated && listId) {
            fetchListDetails();
        }
    }, [isAuthenticated, listId])

    const fetchListDetails = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`/api/planner/lists/${listId}`);

            if (!listId) {
                setError('Invalid list ID');
                setIsLoading(false);
                return;
            }

            if (!res.ok) {
                throw new Error('Failed fetching details of required list');
            }

            const data = await res.json();
            setList(data);
            setTitle(data.title);
            setNote(data.note);
            setError(null);
        } catch (error) {
            console.error('Error fetching list details:', error);
            setError('Failed to fetch list details');
        } finally {
            setIsLoading(false);
        }
    };

    const updateListDetails = async (e: React.FormEvent) => {
        e.preventDefault(); 

        if(!title.trim()) {
            return;
        }

        try {
            setIsSaving(true);
      
            const res = await fetch(`/api/planner/lists/${listId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                title: title.trim(),
                note: note.trim(),
              }),
            });
      
            if (!res.ok) {
              throw new Error('Failed updating list');
            }
      
            const updated = await res.json();
            setList(list => {
              if (!list) return updated;
              return { ...updated, movies: list.movies };
            });

            setIsEditing(false);
            setError(null);
        } catch (error) {
            console.error('Error updating list:', error);
            setError('Failed to update list');
        } finally {
            setIsSaving(false);
        }
    }

    const removeMovieFromList = async (movieId: number) => {
        if (!confirm('Are you sure you want to remove this movie from your list?')) {
          return;
        }
    
        try {
          const res = await fetch(`/api/planner/lists/${listId}/movies/${movieId}`, {
            method: 'DELETE',
          });
    
          if (!res.ok || res.status !== 204) {
            throw new Error('Failed removing movie from list');
          }
    
          // Update the list state by removing the movie
          setList(prevList => {
            if (!prevList) return null;
            return {
              ...prevList,
              movies: prevList.movies.filter(movie => movie.id !== movieId),
              movie_count: prevList.movie_count - 1
            };
          });
        } catch (error) {
          console.error('Error removing movie:', error);
          setError('Failed to remove movie from list');
        }
    };

    const removeList = async () => {
        if (!confirm('Are you sure you want to remove this list?')) {
            return;
        }

        try {
            const res = await fetch(`/api/planner/lists/${listId}`, {
                method: 'DELETE',
            });

            if (!res.ok || res.status !== 204) {
                throw new Error('Failed deleting list');
            }

            router.push(`/planner`);
        } catch (error) { 
            console.error('Error deleting list:', error);
            setError('Failed to delete list');
        }
    };

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
            <div className="text-xl">Loading list details...</div>
          </div>
        );
    }

    if (!list) {
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d0d14] px-4">
            <div className="text-xl mb-4">List not found</div>
            <Link href="/planner" className="text-[#d2b48c] hover:text-[#e4c9a3] hover:underline">
              Back to My Lists
            </Link>
          </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 bg-[#0d0d14] text-white min-h-screen">
            <div className="mb-8">
                {/* Navigation and Header */}
                <div className="flex items-center mb-6">
                    <Link href="/planner" className="text-[#d2b48c] hover:text-[#e4c9a3] hover:underline mr-2">
                        ← Back to Lists
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-900/30 border border-red-800 text-white p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* List Details Section */}
                <div className="bg-[#1a1a24] rounded-lg border border-[#2a2a34] mb-8">
                    {isEditing ? (
                        <div className="p-6">
                            <h2 className="text-xl font-semibold text-[#e4c9a3] mb-4">Edit List</h2>
                            <form onSubmit={updateListDetails}>
                                <div className="mb-4">
                                    <label htmlFor="title" className="block text-sm font-medium mb-1">
                                        List Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
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
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        className="w-full p-3 rounded-lg bg-[#0d0d14] text-white border border-[#2a2a34] focus:outline-none focus:border-[#e4c9a3] min-h-[100px]"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                        setIsEditing(false);
                                        setTitle(list.title);
                                        setNote(list.note);
                                        }}
                                        className="bg-[#2a2a34] text-white py-2 px-4 rounded-lg hover:bg-[#3a3a44] transition duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-[#d2b48c] text-[#0d0d14] py-2 px-6 rounded-lg hover:bg-[#e4c9a3] transition duration-200 disabled:opacity-50"
                                        disabled={isSaving || !title.trim()}
                                    >
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    </div>
                            </form>
                        </div>
                    ) : (
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h1 className="text-2xl font-bold text-[#e4c9a3]">{list.title}</h1>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-sm bg-[#2a2a34] text-white py-1 px-3 rounded hover:bg-[#3a3a44] transition duration-200"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={removeList}
                                        className="text-sm bg-red-900/50 text-red-200 py-1 px-3 rounded hover:bg-red-800/50 transition duration-200"
                                    >
                                        Delete List
                                    </button>
                                </div>
                            </div>
                        {list.note && <p className="text-gray-400 mb-4">{list.note}</p>}
                        <p className="text-sm text-gray-300">
                            {list.movie_count} {list.movie_count === 1 ? 'movie' : 'movies'} in this list
                        </p>
                    </div>
                    )}
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-[#e4c9a3]">Movies in this List</h2>
                    <Link 
                        href="/" 
                        className="text-sm bg-[#d2b48c] text-[#0d0d14] py-1 px-3 rounded hover:bg-[#e4c9a3] transition duration-200"
                    >
                        Browse Movies to Add
                    </Link>
                </div>

                {list.movies && list.movies.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {list.movies.map((movie) => (
                            <div key={movie.id} className="flex flex-col h-full">
                                <MovieCard
                                title={movie.title}
                                releaseYear={movie.release_year}
                                genres={movie.genres}
                                principals={movie.principals}
                                rating={movie.rating}
                                className="flex-grow"
                                />
                                {/* Remove movie from the list */}
                                <div className="bg-[#13131b] p-3 flex justify-between items-center">
                                    <button 
                                        onClick={() => removeMovieFromList(movie.id)}
                                        className="text-sm text-red-400 hover:text-red-300 hover:underline"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    ) : (
                        <div className="bg-[#1a1a24] rounded-lg border border-[#2a2a34] p-8 text-center">
                            <p className="text-xl text-gray-400 mb-4">No movies in this list yet</p>
                            <p className="text-gray-500 mb-6">Browse movies and add them to your list</p>
                            <Link 
                            href="/"
                            className="bg-[#d2b48c] text-[#0d0d14] py-2 px-6 rounded-lg hover:bg-[#e4c9a3] transition duration-200"
                            >
                                Browse Movies
                            </Link>
                        </div>
                    )
                }
            </div>
        </div>
    );  
}