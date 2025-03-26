import json
import mysql.connector
import sys
import pandas as pd
import os
import time
import decimal

def main():
    """
    Connect to the MySQL database, run analysis queries, and output results in a 2D array format.
    With caching to avoid recalculating frequently.
    """
    cache_file = os.path.join(os.path.dirname(__file__), 'personality_genre_cache.json')
    
    # Check if we have a recent cache file (less than 24 hours old)
    if os.path.exists(cache_file):
        file_age = time.time() - os.path.getmtime(cache_file)
        # If cache is less than 24 hours old, use it
        if file_age < 86400:  # 86400 seconds = 24 hours
            try:
                with open(cache_file, 'r') as f:
                    cached_data = f.read()
                    print(cached_data)
                    return
            except Exception as e:
                pass
    
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

        # Function to calculate correlation between genre and trait
        def correlationGenreAndTrait(genreId, trait):
            cursor.execute("""SELECT * 
                           FROM ratings r
                           JOIN (SELECT movieId FROM movie_genres WHERE genreId = %s) AS mg USING (movieId)
                           JOIN viewers v USING (viewerId);""", (genreId,))
            ratingsWithViewer = cursor.fetchall()
            
            column_titles = [d[0] for d in cursor.description]
            ratingAndViewerData = pd.DataFrame(ratingsWithViewer, columns=column_titles)
            ratingAndViewerData = ratingAndViewerData.dropna(subset=["rating", trait])

            if ratingAndViewerData.empty:
                return 0

            if len(ratingAndViewerData[trait].unique()) < 2 or len(ratingAndViewerData["rating"].unique()) < 2:
                return 0

            correlation = ratingAndViewerData["rating"].corr(ratingAndViewerData[trait])
            return correlation

        # Get all genres
        cursor.execute("SELECT genreId, genreString FROM genres")
        genres = cursor.fetchall()
        genre_strings = [genre['genreString'] for genre in genres]
        genre_ids = [genre['genreId'] for genre in genres]
        
        # Define all traits
        traits = ["openness", "agreeableness", "emotional stability", 
                  "conscientiousness", "extroversion"]
        
        # Prepare heatmap data structure
        heatmap_data = {
            "genres": genre_strings,
            "traits": traits,
            "correlations": []
        }
        
        # For each genre, calculate correlation with all traits
        for i, genre_id in enumerate(genre_ids):
            genre_correlations = []
            
            for trait in traits:
                corr_value = correlationGenreAndTrait(genre_id, trait)
                
                # Convert to float if it's a Decimal
                if isinstance(corr_value, decimal.Decimal):
                    corr_value = float(corr_value)
                
                # Add to correlations list for this genre
                genre_correlations.append(corr_value)
            
            # Add this genre's correlations to the main data structure
            heatmap_data["correlations"].append(genre_correlations)
        
        # Close database connection
        cursor.close()
        conn.close()
        
        # Add metadata
        heatmap_data["metadata"] = {
            "generated_at": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        
        # Define JSON encoder for Decimal values
        class DecimalEncoder(json.JSONEncoder):
            def default(self, obj):
                if isinstance(obj, decimal.Decimal):
                    return float(obj)
                return super(DecimalEncoder, self).default(obj)
        
        # Output as JSON
        json_data = json.dumps(heatmap_data, cls=DecimalEncoder)
        
        # Save to cache file
        try:
            with open(cache_file, 'w') as f:
                f.write(json_data)
        except Exception:
            pass
        
        # Print the actual JSON data to stdout
        print(json_data)
        
    except Exception as e:
        # Print error to stderr and exit with non-zero status
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()