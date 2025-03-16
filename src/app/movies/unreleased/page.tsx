import { Metadata } from 'next';
import UnreleasedMovies from './unreleased_movies';

export const metadata: Metadata = {
  title: 'Unreleased Movies & New Submissions | Film Festival',
  description: 'Browse upcoming unreleased movies and new submissions with predictive ratings',
};

export default function UnreleasedMoviesPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      
      <UnreleasedMovies />
    </main>
  );
}