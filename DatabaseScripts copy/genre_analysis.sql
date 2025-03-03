USE movie_festival;

-- Genre Popularity by average rating
SELECT 
    g.genreString,
    COUNT(DISTINCT mg.movieId) AS movie_count,
    AVG(r.rating) AS avg_rating,
    COUNT(DISTINCT r.viewerId) AS viewer_count
FROM genres g
JOIN movie_genres mg ON g.genreId = mg.genreId
JOIN movies m ON mg.movieId = m.movieId
LEFT JOIN ratings r ON m.movieId = r.movieId
GROUP BY g.genreId, g.genreString
ORDER BY avg_rating DESC
LIMIT 20;

-- Genre Popularity by average rating

SELECT 
    g.genreString,
    COUNT(DISTINCT r.viewerId) AS viewer_count,
    COUNT(DISTINCT mg.movieId) AS movie_count,
    AVG(r.rating) AS avg_viewer_rating
FROM genres g
JOIN movie_genres mg ON g.genreId = mg.genreId
JOIN ratings r ON mg.movieId = r.movieId
GROUP BY g.genreId, g.genreString
ORDER BY viewer_count DESC
LIMIT 20;

-- Genre Popularity by standard deviation

SELECT 
    g.genreString,
    COUNT(DISTINCT r.viewerId) AS viewer_count,
    AVG(r.rating) AS avg_rating,
    STDDEV(r.rating) AS rating_std_dev,
    MIN(r.rating) AS min_rating,
    MAX(r.rating) AS max_rating
FROM genres g
JOIN movie_genres mg ON g.genreId = mg.genreId
JOIN ratings r ON mg.movieId = r.movieId
GROUP BY g.genreId, g.genreString
HAVING COUNT(r.rating) > 30  -- Ensuring enough ratings for meaningful statistics
ORDER BY rating_std_dev DESC;


