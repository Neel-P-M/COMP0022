import Image from "next/image";

const movies = [
  { id: 1, title: "Film Title", releaseDate: "2024-02-01", genre: "Drama", language: "English", rating: "★★★★☆", ratingNumber: "4.0/5.0", runtime: "120 min", image: "/placeholder.jpg" },
  { id: 2, title: "Film", releaseDate: "2024-02-01", genre: "Drama", language: "English", rating: "★★★★☆", ratingNumber: "4.0/5.0", runtime: "120 min", image: "/placeholder.jpg" },
  { id: 3, title: "Another Film", releaseDate: "2024-01-15", genre: "Comedy", language: "Spanish", rating: "★★★★★", ratingNumber: "5.0/5.0", runtime: "95 min", image: "/placeholder.jpg" },
  { id: 4, title: "Film", releaseDate: "2024-02-01", genre: "Drama", language: "English", rating: "★★★★☆", ratingNumber: "4.0/5.0", runtime: "120 min", image: "/placeholder.jpg" }
];

const latestReleases = [
  { id: 3, title: "New Release", releaseDate: "2024-03-10", genre: "Sci-Fi", language: "French", rating: "★★★★☆", ratingNumber: "4.2/5.0", runtime: "130 min", image: "/placeholder.jpg" },
  { id: 4, title: "Recent Blockbuster", releaseDate: "2024-03-05", genre: "Action", language: "English", rating: "★★★★★", ratingNumber: "4.8/5.0", runtime: "145 min", image: "/placeholder.jpg" },
  { id: 5, title: "New movie", releaseDate: "2024-03-05", genre: "Action", language: "English", rating: "★★★★★", ratingNumber: "4.8/5.0", runtime: "145 min", image: "/placeholder.jpg" }
];

export default function Home() {
  return (
    <div className="container">
      {/* Top Section */}
      <div className="top-section">
        <div className="header">Film</div>
        <div className="filter-section" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="search-wrapper" style={{ flexGrow: 1 }}>
            <input 
              type="text" 
              className="search-box" 
              placeholder="Search..."
              id="searchInput"
            />
            <button className="calendar-button" id="calendarButton">
              <svg className="calendar-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </button>
          </div>
          <div className="genre-filter">
            <select className="genre-select">
              <option value="">All Genres</option>
              <option value="action">Action</option>
              <option value="comedy">Comedy</option>
              <option value="drama">Drama</option>
              <option value="horror">Horror</option>
              <option value="romance">Romance</option>
              <option value="thriller">Thriller</option>
            </select>
          </div>
        </div>
      </div>
      {/* Movies Section */}
      <div className="section">
        <div className="header">Movies</div>
        <div className="film-grid">
          {movies.map((movie) => (
            <div key={movie.id} className="film-card">
              <div className="film-poster">
                <Image src={movie.image} alt="Film Poster" width={250} height={350} />
              </div>
              <h3 className="film-title">{movie.title}</h3>
              <div className="film-info">Release Date: {movie.releaseDate}</div>
              <div className="film-info">Genre: {movie.genre}</div>
              <div className="film-info">Language: {movie.language}</div>
              <div className="rating">
                <span className="stars">{movie.rating}</span>
                <span className="rating-number">{movie.ratingNumber}</span>
              </div>
              <div className="film-info">Runtime: {movie.runtime}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Latest Releases Section */}
      <div className="section">
        <div className="header">Latest Releases</div>
        <div className="film-grid">
          {latestReleases.map((movie) => (
            <div key={movie.id} className="film-card">
              <div className="film-poster">
                <Image src={movie.image} alt="Film Poster" width={250} height={350} />
              </div>
              <h3 className="film-title">{movie.title}</h3>
              <div className="film-info">Release Date: {movie.releaseDate}</div>
              <div className="film-info">Genre: {movie.genre}</div>
              <div className="film-info">Language: {movie.language}</div>
              <div className="rating">
                <span className="stars">{movie.rating}</span>
                <span className="rating-number">{movie.ratingNumber}</span>
              </div>
              <div className="film-info">Runtime: {movie.runtime}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}