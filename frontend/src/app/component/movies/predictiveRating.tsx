'use client';

import { useState, useEffect, useCallback } from 'react';
import { Rating } from 'react-simple-star-rating';

interface Principal {
    name: string;
    role: string;
}

interface PredictiveRatingProps {
    title: string;
    genres: string[];
    principals: Principal[];
    releaseYear: number;
    className?: string;
}

const PredictiveRating = ({
    title,
    genres,
    principals,
    releaseYear,
    className = '',
}: PredictiveRatingProps) => {
  const [rating, setRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Function to fetch the predictive rating
  const fetchPredictiveRating = useCallback(async () => {
    try {
        setLoading(true);
        
        // Make the API call to the backend
        const res = await fetch('/api/predictive_rating', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            title,
            genres,
            principals,
            releaseYear,
            }),
        });
        
        if (!res.ok) {
            console.log('API call failed');
            return;
        }
        
        const data = await res.json();
        setRating(parseFloat(data.predictedRating));
        
    } catch (err) {
        console.error('Error fetching prediction:', err);
    } finally {
        setLoading(false);
    }
  }, [title, genres, principals, releaseYear]);
  
  // Fetch the prediction whenever details change
  useEffect(() => {
    if (title && genres.length > 0 && releaseYear) {
      fetchPredictiveRating();
    }
  }, [title, releaseYear, genres.length, fetchPredictiveRating]);

  return (
    <div className={`${className}`}>
        {loading ? (
            <div className="flex">
                Loading...
            </div>
        ) : rating ? (
            <div className="relative group">
              <Rating
                  readonly
                  initialValue={rating} // Convert 10-point to 5-star scale
                  allowFraction
                  transition
                  fillColor="#facc15"
                  size={18}
                  SVGclassName="inline-block"
              />
          
              {/* Rating appears on hover */}
              <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 z-10 whitespace-nowrap pointer-events-none">
                  {rating.toFixed(1)}/5
              </div>
            </div>
      ) : (
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <span key={`empty-${i}`} className="text-gray-300">★</span>
          ))}
        </div>
      )}
    </div>
  );
};

export default PredictiveRating;