'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MovieCard } from './component/movies/movieCard';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';

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
  id: number;
  title: string;
  note: string;
  movieCount: number;
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lists state
  const [userLists, setUserLists] = useState<MovieList[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [isAddingToList, setIsAddingToList] = useState(false);
  const [addToListSuccess, setAddToListSuccess] = useState<string | null>(null);
  const [addToListError, setAddToListError] = useState<string | null>(null);
  const [showListModal, setShowListModal] = useState(false);
  const [movieToAdd, setMovieToAdd] = useState<Movie | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [newListTitle, setNewListTitle] = useState('');
  const [newListNote, setNewListNote] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);

  //Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [searchPrincipal, setSearchPrincipal] = useState('');
  
  //Filtered State
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);

  //Pagination State
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [moviesPerPage, setMoviesPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [paginatedMovies, setPaginatedMovies] = useState<Movie[]>([]);
  
  // Get all unique genres from movies array
  const allGenres = [...new Set([
    ...movies.flatMap(movie => movie.genres),
  ])].sort();

  const allPrincipals = [...new Set(
    movies.flatMap(movie => 
      movie.principals.map(principal => principal.name)
    )
  )].sort();

  // Fetch movies data
  useEffect(() => {
    async function fetchMoviesData() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/movies');

        if (!res.ok) {
          console.log('API call failed');
          return;
        }

        const data = await res.json();
        const formattedMovies = data.map((movie) => ({
          id: movie.id,
          title: movie.title,
          release_year: movie.release_year,
          rating: movie.rating,
          genres: movie.genres || [],
          principals: movie.principals || []
        }));

        setMovies(formattedMovies);
        setError(null);
      } catch (error) {
        console.error('Error in fetching movies data:', error);
        setError('Failed to load movies.')
      } finally {
        setIsLoading(false);
      }
    }

    fetchMoviesData();
  }, []);

  // Fetch user's lists if authenticated
  useEffect(() => {
    async function fetchUserLists() {
      if (!isAuthenticated) return;
      
      try {
        setIsLoadingLists(true);
        setListError(null);
        const res = await fetch('/api/planner/lists');

        if (!res.ok) {
          setListError('Failed to fetch your lists. Please try again later.');
          return;
        }

        const data = await res.json();
        setUserLists(data);
      } catch (error) {
        console.error('Error fetching user lists:', error);
        setListError('Failed to load your lists. Please try again later.');
      } finally {
        setIsLoadingLists(false);
      }
    }

    fetchUserLists();
  }, [isAuthenticated]);

  // Filter movies when filters change
  useEffect(() => {
    setCurrentPageIndex(1);
    const filterMovies = (movieList: Movie[]) => {
      return movieList.filter(movie => {
        const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGenre = selectedGenre === '' || movie.genres.includes(selectedGenre);
        const matchesPrincipal = searchPrincipal === '' || 
          movie.principals.some(principal => 
            principal.name.toLowerCase().includes(searchPrincipal.toLowerCase())
          );
        return matchesSearch && matchesGenre && matchesPrincipal;
      });
    };

    const filtered = filterMovies(movies)
    setFilteredMovies(filtered);
    setTotalPages(Math.ceil(filtered.length / moviesPerPage));
  }, [searchTerm, selectedGenre, searchPrincipal, movies, moviesPerPage]);

  // Handle pagination
  useEffect(() => {
    const lastMovieIndex = currentPageIndex * moviesPerPage;
    const firstMovieIndex = lastMovieIndex - moviesPerPage;
    setPaginatedMovies(filteredMovies.slice(firstMovieIndex, lastMovieIndex));
  }, [filteredMovies, currentPageIndex, moviesPerPage]);

  // Open add to list modal with auth check
  const handleAddToList = useCallback((movie: Movie) => {
    if (!isAuthenticated) {
      // Show error notification instead of redirecting
      setAuthError("Please log in to add movies to your lists");
      
      // Auto-clear the error after 3 seconds
      setTimeout(() => {
        setAuthError(null);
      }, 3000);
      
      return;
    }
    
    setMovieToAdd(movie);
    setSelectedListId(null);
    setAddToListSuccess(null);
    setAddToListError(null);
    setShowListModal(true);
  }, [isAuthenticated]);

  // Create a new list
  const createNewList = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newListTitle.trim()) {
      return;
    }
    
    try {
      setIsCreatingList(true);
      
      const res = await fetch('/api/planner/lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newListTitle.trim(),
          note: newListNote.trim(),
        }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to create list');
      }
      
      const newList = await res.json();
      setUserLists(prevLists => [...prevLists, newList]);
      setSelectedListId(newList.id);
      setNewListTitle('');
      setNewListNote('');
      
    } catch (error) {
      console.error('Error creating list:', error);
      setAddToListError('Failed to create new list. Please try again.');
    } finally {
      setIsCreatingList(false);
    }
  }, [newListTitle, newListNote]);


  // Add movie to selected list
  const addMovieToList = useCallback(async () => {
    if (!selectedListId || !movieToAdd) return;
    
    try {
      setIsAddingToList(true);
      setAddToListError(null);
      
      const res = await fetch(`/api/planner/lists/${selectedListId}/movies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieId: movieToAdd.id
        }),
      });

      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || 'Failed to add movie to list');
      }

      setAddToListSuccess(`Added "${movieToAdd.title}" to your list!`);
      
      // Update list count in the userLists state
      setUserLists(prevLists => 
        prevLists.map(list => 
          list.id === selectedListId 
            ? { ...list, movieCount: data.movieCount }
            : list
        )
      );
      
      // Auto-close after success
      setTimeout(() => {
        setShowListModal(false);
        setAddToListSuccess(null);
      }, 2000);
      
    } catch (error) {
      console.error('Error adding movie to list:', error);
      setAddToListError(error instanceof Error ? error.message : 'Failed to add movie to list');
    } finally {
      setIsAddingToList(false);
    }
  }, [selectedListId, movieToAdd]);

  // Page change handler
  const handlePageChange = useCallback((pageNumber: number) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPageIndex(pageNumber);
  }, []);

  // Movies per page selector component
  const PageSizeSelector = () => {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span>Show</span>
        <select 
          value={moviesPerPage}
          onChange={(e) => setMoviesPerPage(Number(e.target.value))}
          className="p-1 rounded bg-[#1a1a24] text-white border border-[#2a2a34] focus:outline-none focus:border-[#e4c9a3]"
        >
          <option value={12}>12</option>
          <option value={16}>16</option>
          <option value={24}>24</option>
        </select>
        <span>per page</span>
      </div>
    );
  };

  // Add to list modal component
  const AddToListModal = () => {
    if (!showListModal || !movieToAdd) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-[#1a1a24] rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-bold text-[#e4c9a3] mb-4">
            Add "{movieToAdd.title}" to a List
          </h2>
          
          {addToListSuccess ? (
            <div className="bg-green-900/30 border border-green-800 text-white p-4 rounded-lg mb-4">
              {addToListSuccess}
            </div>
          ) : (
            <>
              {addToListError && (
                <div className="bg-red-900/30 border border-red-800 text-white p-4 rounded-lg mb-4">
                  {addToListError}
                </div>
              )}
              {isLoadingLists ? (
                <div className="text-center py-4 mb-4">
                  <p className="text-gray-400">Loading your lists...</p>
                </div>
              ) : listError ? (
                <div className="bg-red-900/30 border border-red-800 text-white p-4 rounded-lg mb-4">
                  {listError}
                </div>
              ) : userLists.length > 0 ? (
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Select a list:
                  </label>
                  <select
                    value={selectedListId || ''}
                    onChange={(e) => setSelectedListId(Number(e.target.value))}
                    className="w-full p-3 rounded-lg bg-[#0d0d14] text-white border border-[#2a2a34] focus:outline-none focus:border-[#e4c9a3]"
                  >
                    <option value="">-- Select a list --</option>
                    {userLists.map((list) => (
                      <option key={list.id} value={list.id}>
                        {list.title} ({list.movieCount} movies)
                      </option>
                    ))}
                  </select>
                  
                  <div className="mt-3 text-center">
                    <Link
                      href="/planner"
                      className="text-[#d2b48c] hover:text-[#e4c9a3] hover:underline"
                    >
                      Or create a new list
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 mb-4">
                  <p className="text-gray-400 mb-2">You don't have any lists yet.</p>
                  <Link
                    href="/planner"
                    className="text-[#d2b48c] hover:text-[#e4c9a3] hover:underline"
                  >
                    Create your first list
                  </Link>
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowListModal(false)}
                  className="bg-[#2a2a34] text-white py-2 px-4 rounded-lg hover:bg-[#3a3a44] transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addMovieToList}
                  disabled={!selectedListId || isAddingToList}
                  className="bg-[#d2b48c] text-[#0d0d14] py-2 px-6 rounded-lg hover:bg-[#e4c9a3] transition duration-200 disabled:opacity-50"
                >
                  {isAddingToList ? 'Adding...' : 'Add to List'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Pagination component
  const Pagination = () => {
    if (totalPages < 1) {
      return null;
    }

    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startIndex: number;
    let endIndex: number;

    if (totalPages <= maxPagesToShow) {
      startIndex = 1;
      endIndex = totalPages;
    } else {
      const maxBeforeCurrent = Math.floor(maxPagesToShow / 2);
      const maxAfterCurrent = Math.ceil(maxPagesToShow / 2) - 1;

      if (currentPageIndex <= maxBeforeCurrent) {
        startIndex = 1;
        endIndex = maxPagesToShow;
      } else if (currentPageIndex + maxAfterCurrent >= totalPages) {
        startIndex = totalPages - maxPagesToShow + 1;
        endIndex = totalPages;
      } else {
        startIndex = currentPageIndex - maxBeforeCurrent;
        endIndex = currentPageIndex + maxAfterCurrent;
      }
    }

    for (let i = startIndex; i <= endIndex; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex justify-center items-center gap-2 mt-8">
        {/* Previous page button */}
        <button 
          onClick={() => handlePageChange(currentPageIndex - 1)}
          disabled={currentPageIndex === 1}
          className={`px-3 py-2 rounded-md ${currentPageIndex === 1 ? 'bg-[#2a2a34] text-[#5e5e6d] cursor-not-allowed' : 'bg-[#1a1a24] text-white hover:bg-[#2a2a34]'}`}
        >
          &laquo;
        </button>
        
        {/* Page numbers */}
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            className={`px-3 py-2 rounded-md ${currentPageIndex === number ? 'bg-[#e4c9a3] text-[#0d0d14] font-bold' : 'bg-[#1a1a24] text-white hover:bg-[#2a2a34]'}`}
          >
            {number}
          </button>
        ))}
        
        {/* Next page button */}
        <button 
          onClick={() => handlePageChange(currentPageIndex + 1)}
          disabled={currentPageIndex === totalPages}
          className={`px-3 py-2 rounded-md ${currentPageIndex === totalPages ? 'bg-[#2a2a34] text-[#5e5e6d] cursor-not-allowed' : 'bg-[#1a1a24] text-white hover:bg-[#2a2a34]'}`}
        >
          &raquo;
        </button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0d0d14]">
        <div className="text-xl">Loading movie data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0d0d14]">
        <div className="text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-[#0d0d14] text-white min-h-screen">
      {/* Top Section */}
      <div className="mb-8">
        <div className="text-3xl font-bold text-[#e4c9a3] mb-4">Film Festival</div>
        <div className="flex flex-col gap-4">
          {/* Title Search */}
          <div className="relative w-full">
            <input 
              type="text" 
              className="w-full p-3 pl-4 pr-10 rounded-lg bg-[#1a1a24] text-white border border-[#2a2a34] focus:outline-none focus:border-[#e4c9a3]" 
              placeholder="Search for movies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#a0a0a0]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>
          
          {/* Principal Search */}
          <div className="relative w-full">
            <input 
              type="text" 
              className="w-full p-3 pl-4 pr-10 rounded-lg bg-[#1a1a24] text-white border border-[#2a2a34] focus:outline-none focus:border-[#e4c9a3]" 
              placeholder="Search for actors, directors..."
              value={searchPrincipal}
              onChange={(e) => setSearchPrincipal(e.target.value)}
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#a0a0a0]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-full md:w-auto">
              <select 
                className="p-3 rounded-lg bg-[#1a1a24] text-white border border-[#2a2a34] focus:outline-none focus:border-[#e4c9a3] w-full md:w-48"
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
              >
                <option value="">All Genres</option>
                {allGenres.map((genre) => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Movies Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="text-2xl font-bold text-[#e4c9a3]">
            All Movies {filteredMovies.length !== movies.length && `(${filteredMovies.length} results)`}
          </div>
          <PageSizeSelector />
        </div>

        {filteredMovies.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedMovies.map((movie) => (
                <div key={movie.id} className="flex flex-col h-full">      
                  <div className="flex-grow">
                    <MovieCard
                      title={movie.title}
                      releaseYear={movie.release_year}
                      genres={movie.genres}
                      principals={movie.principals}
                      rating={movie.rating}
                      className="flex-grow"
                    />
                  </div>
                  <div className="bg-[#13131b] p-4 flex justify-between items-center">
                    <Link 
                      href={`/movies/${movie.id}`}
                      className="text-sm text-[#d2b48c] hover:text-[#e4c9a3] hover:underline"
                    >
                      View Details
                    </Link>
                    <button 
                      onClick={() => handleAddToList(movie)}
                      className="text-sm text-[#d2b48c] hover:text-[#e4c9a3] hover:underline"
                    >
                      Add to List
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <Pagination />
            
            <div className="mt-4 text-center text-sm text-gray-400">
              Showing {paginatedMovies.length > 0 ? ((currentPageIndex - 1) * moviesPerPage) + 1 : 0} to {Math.min(currentPageIndex * moviesPerPage, filteredMovies.length)} of {filteredMovies.length} movies
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-400">
            No movies match your search criteria. Try adjusting your filters.
          </div>
        )}
      </div>
      
      {/* Authentication Error Notification */}
      {authError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-900/90 text-white px-6 py-3 rounded-lg shadow-lg border border-red-800 flex items-center">
          <span className="mr-2">⚠️</span>
          <span>{authError}</span>
          <button 
            onClick={() => setAuthError(null)} 
            className="ml-4 text-white/80 hover:text-white"
          >
            ×
          </button>
        </div>
      )}
      
      {/* Add to List Modal */}
      <AddToListModal />
    </div>
  );
}