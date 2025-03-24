'use client';

import React, { useState, useEffect } from 'react';

const PersonalityGenreHeatmap = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        const response = await fetch('/api/personality_analysis');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }
        
        const res = await response.json();
        console.log("Fetched correlation data:", res);
        
        if (res.error) {
          throw new Error(res.error);
        }
        
        setData(res);
        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "Failed to load personality-genre correlation data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Get color based on correlation value
  const getCellColor = (value: number) => {
    if (value === null || value === undefined) {
      return 'bg-gray-100';
    }
    
    const numValue = parseFloat(value.toString());
    
    // Color scale from red (negative) to blue (positive)
    if (numValue > 0) {
      // Blue scale for positive correlations
      if (numValue < 0.1) return 'bg-blue-100';
      if (numValue < 0.2) return 'bg-blue-200';
      if (numValue < 0.3) return 'bg-blue-300';
      if (numValue < 0.4) return 'bg-blue-400';
      if (numValue < 0.5) return 'bg-blue-500';
      if (numValue < 0.6) return 'bg-blue-600';
      if (numValue < 0.7) return 'bg-blue-700';
      return 'bg-blue-800';
    } else {
      // Red scale for negative correlations
      const absValue = Math.abs(numValue);
      if (absValue < 0.1) return 'bg-red-100';
      if (absValue < 0.2) return 'bg-red-200';
      if (absValue < 0.3) return 'bg-red-300';
      if (absValue < 0.4) return 'bg-red-400';
      if (absValue < 0.5) return 'bg-red-500';
      if (absValue < 0.6) return 'bg-red-600';
      if (absValue < 0.7) return 'bg-red-700';
      return 'bg-red-800';
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-xl">Loading correlation data...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }
  
  if (!data || !data.genres || !data.traits || !data.correlations) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded m-4">
        <p>Invalid data format received from API</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl text-[#e4c9a3] text-center font-bold mb-4">Personality Traits And Film Genre Correlations</h1>

      <div className="overflow-x-auto mb-8">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="text-black bg-gray-100">
              <th className="py-2 px-4 border-b border-gray-300 text-left">Genre / Trait</th>
              {data.traits.map((trait, index) => (
                <th key={index} className="py-2 px-4 border-b border-gray-300 text-center">
                  {trait}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.genres.map((genre, genreIndex) => (
              <tr key={genreIndex} className='bg-gray-50 text-black'>
                <td className="py-2 px-4 border-b border-gray-300 font-medium">{genre}</td>
                {data.correlations[genreIndex].map((value, traitIndex) => (
                  <td 
                    key={traitIndex} 
                    className={`py-2 px-4 border-b border-gray-300 text-center text-gray-800 ${getCellColor(value)}`}
                  >
                    {value.toFixed(2)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-600 mr-2"></div>
          <span>Strong Negative</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-300 mr-2"></div>
          <span>Weak Negative</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-300 mr-2"></div>
          <span>Weak Positive</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-600 mr-2"></div>
          <span>Strong Positive</span>
        </div>
      </div>
      
      <div className="text-sm text-gray-500 text-center">
        Based on GroupLens Personality 2018 Dataset
      </div>
    </div>
  );
};

export default PersonalityGenreHeatmap;