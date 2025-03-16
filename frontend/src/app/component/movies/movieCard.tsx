import React from 'react';
import PredictiveRating from './predictiveRating';

interface Principal {
    name: string;
    role: string;
}

interface MovieCardProps {
    title: string;
    releaseYear: number;
    genres: string[];
    principals: Principal[];
    rating?: number;
    isNewSubmission?: boolean;
    className?: string;
}

export const MovieCard = ({
    title,
    releaseYear,
    genres,
    principals,
    rating,
    isNewSubmission = false,
    className = ''
} : MovieCardProps) => {
    const formatRatingStars = (rating: number) => {
        const fullStars = Math.floor(rating / 2);
        const halfStar = rating % 2 >= 1 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;
    
        return (
          <div className="flex">
            {[...Array(fullStars)].map((_, i) => (
              <span key={`full-${i}`} className="text-yellow-500">★</span>
            ))}
            {halfStar === 1 && <span className="text-yellow-500">½</span>}
            {[...Array(emptyStars)].map((_, i) => (
              <span key={`empty-${i}`} className="text-gray-300">★</span>
            ))}
          </div>
        );
    };

    return (
        <div className={`bg-[#1a1a24] rounded-lg shadow-md p-4 ${className}`}>
            {/* Display title and release year */}
            <h2 className="text-xl font-bold text-[#e4c9a3]">
                {title} {releaseYear && `(${releaseYear})`}
            </h2>

            {/* Display genres */}
            <div className="mt-1 text-sm text-[#a0a0a0]">
                {genres.join(' • ')}
            </div>
      
            {/* Display principals */}
            <div className="mt-2">
                <div className="text-sm">
                {principals.map((principal, index) => (
                    <span key={index} className="mr-3">
                        <span className="text-[#a8a8a8]">{principal.name}</span>
                        <span className="text-[#a8a8a8]"> ({principal.role})</span>
                        {index < principals.length - 1 ? ', ' : ''}
                    </span>
                ))}
                </div>
            </div>
            {/* Rating display */}
            <div className="mt-3">
                {isNewSubmission ? (
                <PredictiveRating
                    title={title}
                    genres={genres}
                    principals={principals}
                    releaseYear={releaseYear}
                />
                ) : (
                rating !== undefined && formatRatingStars(rating)
                )}
            </div>
        </div>
    );
}
