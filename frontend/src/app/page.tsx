'use client';

import React, { useState, useEffect } from 'react';
import { MovieCard } from './component/movies/movieCard';

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

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //Search states=
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
  
  // Get all unique genres from both movie arrays
  const allGenres = [...new Set([
    ...movies.flatMap(movie => movie.genres),
  ])].sort();

  const allPrincipals = [...new Set(
    movies.flatMap(movie => 
      movie.principals.map(principal => principal.name)
    )
  )].sort();

  //Fetch data with API
  useEffect(() => {
    async function fetchMoviesData() {
      try {
        setIsLoading(true);
        const res = await fetch ('/api/movies');

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

  //Filters movies when filters change
  useEffect(() => {
    setIsLoading(true);
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
    setIsLoading(false);
  }, [searchTerm, selectedGenre, searchPrincipal, movies]);

  //Handles change of movies in pagination
  useEffect(() => {
    const lastMovieIndex = currentPageIndex * moviesPerPage;
    const firstMovieIndex = lastMovieIndex - moviesPerPage;
    setPaginatedMovies(filteredMovies.slice(firstMovieIndex, lastMovieIndex));
  }, [filteredMovies, currentPageIndex, moviesPerPage])

  //Page change handler
  const handlePageChange = (pageNumber: number) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPageIndex(pageNumber);
  }

  //Movies per page handler
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
                  <MovieCard
                    title={movie.title}
                    releaseYear={movie.release_year}
                    genres={movie.genres}
                    principals={movie.principals}
                    rating={movie.rating}
                    className="flex-grow"
                  />
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
    </div>
  );
}