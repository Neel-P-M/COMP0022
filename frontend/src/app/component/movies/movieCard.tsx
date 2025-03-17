import React, { useState } from 'react';
import PredictiveRating from './predictiveRating';
import { Rating } from 'react-simple-star-rating';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

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
    const [showAllPrincipals, setShowAllPrincipals] = useState(false);

    //Handles shown principals
    const visibilePrincipals = showAllPrincipals ? principals : principals.slice(0,3);
    const showExpandButton = principals.length > 3;

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
                {visibilePrincipals.map((principal, index) => (
                    <span key={index} className="mr-3">
                        <span className="text-[#a8a8a8]">{principal.name}</span>
                        <span className="text-[#a8a8a8]"> ({principal.role})</span>
                        {index < principals.length - 1 ? ', ' : ''}
                    </span>
                ))}
                </div>

                {showExpandButton && (
                    <button 
                        onClick={() => setShowAllPrincipals(!showAllPrincipals)}
                        className="flex items-center mt-1 text-xs text-[#a0a0a0] hover:text-[#e4c9a3] transition-colors"
                    >
                        {showAllPrincipals ? (
                            <>
                                <span>Show less</span>
                                <FiChevronUp size={14} className="ml-1" />
                            </>
                        ) : (
                            <>
                                <span>Show all {principals.length} principals</span>
                                <FiChevronDown size={14} className="ml-1" />
                            </>
                        )}
                    </button>
                )}
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
                    rating !== undefined && (
                        <div className="relative group">
                            <Rating
                                readonly
                                initialValue={rating}
                                allowFraction
                                transition
                                fillColor="#facc15"
                                size={18}
                                SVGclassName="inline-block"
                            />
                        
                            {/* Rating appears on hover */}
                            <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 z-10 whitespace-nowrap pointer-events-none">
                                {(rating).toFixed(1)}/5
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}