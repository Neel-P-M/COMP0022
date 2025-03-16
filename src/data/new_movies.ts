export interface Principal {
    name: string;
    role: string;
}

export interface NewMovie {
    id: string;
    title: string;
    releaseYear: number;
    genres: string[];
    submissionDate: string;
    principals: Principal[];
}
  
export const newMovies: NewMovie[] = [
    {
        id: 'unrel-001',
        title: 'The Last Frontier',
        releaseYear: 2025,
        genres: ['Action', 'Drama', 'Sci-Fi'],
        submissionDate: '2025-01-15T00:00:00Z',
        principals: [
            { name: 'Sarah Johnson', role: 'director' },
            { name: 'Michael Chen', role: 'actor' },
            { name: 'Olivia Williams', role: 'actor' }
        ],
    },
    {
        id: 'unrel-002',
        title: 'Whispers in the Dark',
        releaseYear: 2025,
        genres: ['Horror', 'Thriller', 'Mystery'],
        submissionDate: '2025-02-03T00:00:00Z',
        principals: [
            { name: 'Sarah Johnson', role: 'director' },
            { name: 'Michael Chen', role: 'actor' },
            { name: 'Olivia Williams', role: 'actor' }
        ],
    },
    {
        id: 'unrel-003',
        title: 'Whispers in the Dark',
        releaseYear: 2025,
        genres: ['Horror', 'Thriller', 'Mystery'],
        submissionDate: '2025-02-03T00:00:00Z',
        principals: [
            { name: 'Sarah Johnson', role: 'director' },
            { name: 'Michael Chen', role: 'actor' },
            { name: 'Olivia Williams', role: 'actor' }
        ],
    },
    {
        id: 'unrel-004',
        title: 'Whispers in the Dark',
        releaseYear: 2025,
        genres: ['Horror', 'Thriller', 'Mystery'],
        submissionDate: '2025-02-03T00:00:00Z',
        principals: [
            { name: 'Sarah Johnson', role: 'director' },
            { name: 'Michael Chen', role: 'actor' },
            { name: 'Olivia Williams', role: 'actor' }
        ],
    },
    {
        id: 'unrel-005',
        title: 'The Last Frontier',
        releaseYear: 2025,
        genres: ['Action', 'Drama', 'Sci-Fi'],
        submissionDate: '2025-01-15T00:00:00Z',
        principals: [
            { name: 'Sarah Johnson', role: 'director' },
            { name: 'Michael Chen', role: 'actor' },
            { name: 'Olivia Williams', role: 'actor' }
        ],
    },
    {
        id: 'unrel-006',
        title: 'The Last Frontier',
        releaseYear: 2025,
        genres: ['Action', 'Drama', 'Sci-Fi'],
        submissionDate: '2025-01-15T00:00:00Z',
        principals: [
            { name: 'Sarah Johnson', role: 'director' },
            { name: 'Michael Chen', role: 'actor' },
            { name: 'Olivia Williams', role: 'actor' }
        ],
    }
];

export const getAllGenres = (): string[] => {
    const genres = new Set<string>();
    newMovies.forEach(movie => {
      movie.genres.forEach(genre => genres.add(genre));
    });
    return Array.from(genres).sort();
};