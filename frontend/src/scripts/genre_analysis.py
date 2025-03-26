import json
import mysql.connector
import sys

def main():
    """
    Connect to the MySQL database, run analysis queries, and output results as JSON.
    """
    try:
        # Connect to the MySQL database
        conn = mysql.connector.connect(
            host="database",
            port=3306,
            user="user",
            password="password",
            database="moviefestival"
        )

        # Create a cursor
        cursor = conn.cursor(dictionary=True)
        
        results = {}
        
        # Genre distribution query based on viewer count and average rating
        genre_popularity_query = """       
        SELECT 
            g.genreString AS genre_name,
            COUNT(DISTINCT mg.movieId) AS movie_count,
            AVG(r.rating) AS avg_rating,
            COUNT(DISTINCT r.viewerId) AS viewer_count
        FROM genres g
        JOIN movie_genres mg ON g.genreId = mg.genreId
        JOIN movies m ON mg.movieId = m.movieId
        LEFT JOIN ratings r ON m.movieId = r.movieId
        GROUP BY g.genreId, g.genreString
        ORDER BY avg_rating DESC;
        """
        
        cursor.execute(genre_popularity_query)
        results['genre_distribution'] = cursor.fetchall()

        # Genre trends over time based on standard deviation
        trends_query = """
        SELECT 
            g.genreString AS genre_name,
            AVG(r.rating) AS avg_rating,
            STDDEV(r.rating) AS rating_std_dev,
            MIN(r.rating) AS min_rating,
            MAX(r.rating) AS max_rating
        FROM genres g
        JOIN movie_genres mg ON g.genreId = mg.genreId
        JOIN ratings r ON mg.movieId = r.movieId
        GROUP BY g.genreId, g.genreString
        HAVING COUNT(r.rating) > 30
        ORDER BY rating_std_dev DESC;
        """
        
        cursor.execute(trends_query)
        results['genre_polarization'] = cursor.fetchall()
        
        # Close connections
        cursor.close()
        conn.close()
        
        # Output results as JSON
        # Convert decimal values to float for JSON serialization
        class DecimalEncoder(json.JSONEncoder):
            def default(self, obj):
                import decimal
                if isinstance(obj, decimal.Decimal):
                    return float(obj)
                return super(DecimalEncoder, self).default(obj)
        
        print(json.dumps(results, cls=DecimalEncoder))
        
    except Exception as e:
        # Print error to stderr and exit with non-zero status
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()