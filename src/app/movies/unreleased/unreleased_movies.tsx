'use client';

import { useState, useEffect } from 'react';
import { MovieCard } from '@/app/component/movies/movieCard';
import { newMovies, getAllGenres, type NewMovie } from '@/data/new_movies';

export default function UnreleasedMovies() {
  const [movies, setMovies] = useState<NewMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterGenre, setFilterGenre] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('submissionDate');
  const [allGenres, setAllGenres] = useState<string[]>([]);

  useEffect(() => {
      setMovies(newMovies);
      setAllGenres(getAllGenres());
      setLoading(false);  
  }, []);

  const filtered_sorted_movies = movies.filter(movie =>
      filterGenre ? movie.genres.includes(filterGenre) : true
      ).sort((a, b) => {
        switch (sortBy) {
          case 'title':
            return a.title.localeCompare(b.title);
          case 'releaseYear':
            return b.releaseYear - a.releaseYear;
          case 'submissionDate':
          default:
            return new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime();
        }
      }
  );

  if (loading) {
      return <div>Loading submissions...</div>;
  }

  return (
      <div>
    {/* Filters and Sort Controls */}
    <div className="bg-[#1a1a24] p-4 rounded-lg shadow-sm mb-6 flex flex-col sm:flex-row gap-4 justify-between">
      <div className="flex flex-wrap gap-4 items-center">
        <div>
          <label htmlFor="genreFilter" className="block text-sm font-medium text-[#e4c9a3] mb-1">
            Filter by Genre
          </label>
          <select
            id="genreFilter"
            value={filterGenre}
            onChange={(e) => setFilterGenre(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-black"
          >
            <option value="">All Genres</option>
            {allGenres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="sortBy" className="block text-sm font-medium text-[#e4c9a3] mb-1">
          Sort By
        </label>
        <select
          id="sortBy"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-black"
        >
          <option value="title">Title</option>
          <option value="releaseYear">Release Year</option>
        </select>
      </div>
    </div>

    {/* Results count */}
    <div className="mb-4 text-gray-600">
      Found {filtered_sorted_movies.length} {filtered_sorted_movies.length === 1 ? 'movie' : 'movies'}
      {filterGenre && ` in ${filterGenre}`}
    </div>

    {/* Movie list */}
    <div className="space-y-6">
      {filtered_sorted_movies.length > 0 ? (
        filtered_sorted_movies.map((movie) => (
          <MovieCard
            key={movie.id}
            id={movie.id}
            title={movie.title}
            releaseYear={movie.releaseYear}
            genres={movie.genres}
            principals={movie.principals}
            isNewSubmission={true}
            className="h-full"
          />
        ))
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No unreleased movies found with the selected filters.</p>
        </div>
      )}
    </div>
  </div>
  )
}