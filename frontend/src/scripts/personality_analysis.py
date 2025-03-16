import json
import mysql.connector
import sys
import pandas as pd

def main():
    """
    Connect to the MySQL database, run analysis queries, and output results as JSON.
    """
    try:
        # Connect to the MySQL database
        conn = mysql.connector.connect(
            host="localhost",
            port=3306,
            user="root",
            password="my-secret-pw",
            database="moviefestivaldatabase"
        )
        
        # Create a cursor
        cursor = conn.cursor(dictionary=True)
        
        results = {}
        
        # Function to calculate correlation between movie and trait
        def correlationMovieAndTrait(movieId, trait):
            cursor.execute("""SELECT * 
                           FROM (SELECT viewerId, rating FROM ratings WHERE movieId = %s) AS r
                           JOIN viewers v USING (viewerId);""", (movieId,))
            ratingsWithViewer = cursor.fetchall()

            column_titles = [d[0] for d in cursor.description]
            ratingAndViewerData = pd.DataFrame(ratingsWithViewer, columns=column_titles)
            ratingAndViewerData = ratingAndViewerData.dropna(subset=["rating",trait])

            if ratingAndViewerData.empty:
                return "Empty"

            if len(ratingAndViewerData[trait].unique()) < 2 or len(ratingAndViewerData["rating"].unique()) < 2:
                return "Less than 2 unique values"

            correlation = ratingAndViewerData["rating"].corr(ratingAndViewerData[trait])
            return correlation

        # Function to calculate correlation between genre and trait
        def correlationGenreAndTrait(genreId, trait):
            cursor.execute("""SELECT * 
                           FROM ratings r
                           JOIN (SELECT movieId FROM movie_genres WHERE genreId = %s) AS mg USING (movieId)
                           JOIN viewers v USING (viewerId);""", (genreId,))
            ratingsWithViewer = cursor.fetchall()
            
            column_titles = [d[0] for d in cursor.description]
            ratingAndViewerData = pd.DataFrame(ratingsWithViewer, columns=column_titles)
            ratingAndViewerData = ratingAndViewerData.dropna(subset=["rating",trait])

            if ratingAndViewerData.empty:
                return "Empty"

            if len(ratingAndViewerData[trait].unique()) < 2 or len(ratingAndViewerData["rating"].unique()) < 2:
                return "Less than 2 unique values"

            correlation = ratingAndViewerData["rating"].corr(ratingAndViewerData[trait])
            return correlation

        # Function to calculate correlation between genre string and trait
        def correlationGenreStringAndTrait(genreString, trait):
            cursor.execute("""SELECT genreId 
                           FROM genres
                           WHERE genreString = %s""", (genreString,))
            genre = cursor.fetchall()
            genreId = genre[0][0]
            return correlationGenreAndTrait(genreId, trait)

        # Function to calculate correlation between genre and all traits
        def correlationGenreAndAllTraits(genreString):
            cursor.execute("""SELECT genreId 
                           FROM genres
                           WHERE genreString = %s""", (genreString,))
            genre = cursor.fetchall()
            genreId = genre[0][0]
            correlations = pd.Series(index=["openness",
                                            "agreeableness",
                                            "emotional_stability",
                                            "conscientiousness",
                                            "extroversion"],
                                            dtype=float,
                                            name=genreString)
            for trait in correlations.index:
                correlations[trait] = correlationGenreAndTrait(genreId, trait)
            return correlations.to_dict()

        # Function to calculate correlation between all genres and a trait
        def correlationAllGenresAndTrait(trait):
            cursor.execute("""SELECT genreId, genreString 
                           FROM genres""")
            genres = cursor.fetchall()
            genreStrings = [genre['genreString'] for genre in genres]
            genreIds = [genre['genreId'] for genre in genres]
            correlations = pd.Series(index=genreStrings,
                                            dtype=float)
            for i in range(len(genreStrings)):
                correlations[genreStrings[i]] = correlationGenreAndTrait(genreIds[i], trait)
            return correlations.to_dict()

        # Example usage
        results['correlation_genre_string_and_trait'] = correlationGenreStringAndTrait("Action", "openness")
        results['correlation_genre_and_all_traits'] = correlationGenreAndAllTraits("Action")
        results['correlation_all_genres_and_trait'] = correlationAllGenresAndTrait("openness")

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