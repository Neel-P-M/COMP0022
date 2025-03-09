// src/app/reports/page.tsx
import Image from "next/image";

const genres = [
  { id: 1, name: "Action", popularity: 85, polarization: 25, color: "#3498db" },
  { id: 2, name: "Comedy", popularity: 78, polarization: 40, color: "#2ecc71" },
  { id: 3, name: "Drama", popularity: 75, polarization: 15, color: "#e74c3c" },
  { id: 4, name: "Horror", popularity: 60, polarization: 65, color: "#9b59b6" },
  { id: 5, name: "Romance", popularity: 55, polarization: 45, color: "#e84393" },
  { id: 6, name: "Sci-Fi", popularity: 70, polarization: 30, color: "#00cec9" },
  { id: 7, name: "Thriller", popularity: 65, polarization: 20, color: "#fd79a8" },
  { id: 8, name: "Documentary", popularity: 45, polarization: 10, color: "#636e72" }
];

export default function Reports() {
  return (
    <div className="container">
      <h1 className="reports-title">Genre Popularity & Polarization Reports</h1>
      
      <div className="reports-section">
        <h2 className="section-title">Genre Popularity</h2>
        <p className="section-description">
          This chart shows the relative popularity of different film genres based on viewer numbers and ratings.
        </p>
        
        <div className="chart-container">
          {genres.map((genre) => (
            <div key={genre.id} className="chart-bar-container">
              <div className="genre-label">{genre.name}</div>
              <div className="chart-bar-wrapper">
                <div 
                  className="chart-bar popularity-bar" 
                  style={{ 
                    width: `${genre.popularity}%`,
                    backgroundColor: genre.color
                  }}
                >
                  <span className="bar-value">{genre.popularity}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="reports-section">
        <h2 className="section-title">Genre Polarization</h2>
        <p className="section-description">
          This chart represents how divisive each genre is among viewers, with higher values indicating more polarized opinions.
        </p>
        
        <div className="chart-container">
          {genres.map((genre) => (
            <div key={genre.id} className="chart-bar-container">
              <div className="genre-label">{genre.name}</div>
              <div className="chart-bar-wrapper">
                <div 
                  className="chart-bar polarization-bar" 
                  style={{ 
                    width: `${genre.polarization}%`,
                    backgroundColor: genre.color
                  }}
                >
                  <span className="bar-value">{genre.polarization}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="reports-section">
        <h2 className="section-title">Insights</h2>
        <div className="insights-container">
          <div className="insight-card">
            <h3>Most Popular Genres</h3>
            <p>Action and Comedy continue to dominate viewer preferences, with Science Fiction showing increased interest in recent months.</p>
          </div>
          <div className="insight-card">
            <h3>Most Polarizing Genres</h3>
            <p>Horror films generate the most divided opinions among viewers, while Documentaries show the most consistent ratings.</p>
          </div>
          <div className="insight-card">
            <h3>Emerging Trends</h3>
            <p>Cross-genre films that combine elements of Drama with other genres are seeing increased popularity and generally positive reception.</p>
          </div>
        </div>
      </div>
    </div>
  );
}