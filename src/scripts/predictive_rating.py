#!/usr/bin/env python3
# File: src/scripts/predictive_rating.py

import json
import mysql.connector
import sys
import pandas as pd
import ast  # For safely evaluating string literals

def predictive_rating(title_string, genres, principals, release_year):
    """
    Calculate predictive rating based on similar films.
    
    Args:
        title_string (str): Title of the movie
        genres (list): List of genres
        principals (list): List of [name, role] pairs
        release_year (int): Year of release
    
    Returns:
        tuple: (title, predicted_rating)
    """
    try:
        # Connect to the MySQL database
        conn = mysql.connector.connect(
            host="localhost",
            port=3306,
            user="user",
            password="password",
            database="moviefestival"
        )
        
        # Create a cursor
        cursor = conn.cursor(dictionary=True)

        # Algorithm parameters
        release_year_weight = 1.0 / 5.0
        per_genre_weight = 1.0 / len(genres) if genres else 0
        principal_factor = 0.3
        principal_weights = {
            "director": 2.0,
            "producer": 1.6,
            "writer": 1.6,
            "actor": 1.2,
            "other": 1.0
        }
        weighted_rating = 0.0
        weight_sum = 0.0
        
        # Calculate weights for closeness of release year
        release_year_query = """
        SELECT movieId, releaseYear 
        FROM movies;
        """
        cursor.execute(release_year_query)
        release_years = cursor.fetchall()
        release_years = pd.DataFrame(release_years, columns=["movieId", "releaseYear"]).set_index("movieId")
        release_years["weight"] = 1.0 / (abs(release_year - release_years["releaseYear"]) * release_year_weight + 0.2) + 1.0

        # Add weighted rating per overlapping genre
        if genres and len(genres) > 0:
            weighted_rating_by_genre = {genre_string: 0.0 for genre_string in genres}
            weight_sum_by_genre = {genre_string: 0.0 for genre_string in genres}

            genres_query_placeholder = ", ".join(["%s"] * len(genres))
            genres_query = f"""
            SELECT m.movieId, m.avgRating, g.genreString 
            FROM (SELECT genreId, genreString FROM genres WHERE genreString in ({genres_query_placeholder})) as g 
            JOIN movie_genres mg USING (genreId)
            JOIN movies m USING (movieId);
            """
            cursor.execute(genres_query, tuple(genres))
            ratings_same_genre = cursor.fetchall()

            for rating in ratings_same_genre:
                weight = release_years.loc[rating['movieId']]["weight"]
                weighted_rating_by_genre[rating['genreString']] += rating['avgRating'] * weight
                weight_sum_by_genre[rating['genreString']] += weight

            for genre in genres:
                if weight_sum_by_genre[genre] > 0:
                    weighted_rating += (weighted_rating_by_genre[genre] / weight_sum_by_genre[genre]) * per_genre_weight
                    weight_sum += per_genre_weight

        # Add weighted rating per overlapping principal
        if principals and len(principals) > 0:
            weighted_rating_by_name = {principal[0]: 0.0 for principal in principals}
            weight_sum_by_name = {principal[0]: 0.0 for principal in principals}
            principal_role = {principal[0]: principal[1] for principal in principals}

            names = [principal[0] for principal in principals]
            principals_query_placeholder = ", ".join(["%s"] * len(names))
            principals_query = f"""
            SELECT m.movieId, m.avgRating, n.nameString, p.roleString 
            FROM (SELECT nameId, nameString FROM names WHERE nameString in ({principals_query_placeholder})) as n 
            JOIN principals p USING (nameId)
            JOIN movies m USING (movieId);
            """
            cursor.execute(principals_query, tuple(names))
            ratings_same_name = cursor.fetchall()

            for rating in ratings_same_name:
                name_string = rating['nameString']
                role_string = rating['roleString']
                weight = release_years.loc[rating['movieId']]["weight"]
                if role_string == principal_role[name_string]:
                    if role_string in principal_weights:
                        weight *= principal_weights[role_string]
                    else:
                        weight *= principal_weights["other"]
                weighted_rating_by_name[name_string] += rating['avgRating'] * weight
                weight_sum_by_name[name_string] += weight

            temp_wr = 0.0
            temp_ws = 0.0

            for principal in principals:
                if principal[1] in principal_weights:
                    if weighted_rating_by_name[principal[0]] > 0:
                        temp_wr += (weighted_rating_by_name[principal[0]] / weight_sum_by_name[principal[0]]) * principal_weights[principal[1]]
                        temp_ws += principal_weights[principal[1]]
                else:
                    if weighted_rating_by_name[principal[0]] > 0:
                        temp_wr += (weighted_rating_by_name[principal[0]] / weight_sum_by_name[principal[0]]) * principal_weights["other"]
                        temp_ws += principal_weights["other"]
            
            if temp_wr > 0:
                weighted_rating += (temp_wr / temp_ws) * principal_factor
                weight_sum += principal_factor

        # Close connections
        cursor.close()
        conn.close()
        
        # Calculate final rating
        final_rating = weighted_rating / weight_sum if weight_sum > 0 else 0
        
        return (title_string, final_rating)
        
    except Exception as e:
        # Print error to stderr and exit with non-zero status
        print(f"Error: {str(e)}", file=sys.stderr)
        return (title_string, 0)

def main():
    """
    Main function to handle command line arguments and output results as JSON.
    """
    try:
        # Parse command line arguments
        if len(sys.argv) < 2:
            print("Usage: predictive_rating.py <command> [args]", file=sys.stderr)
            sys.exit(1)
            
        command = sys.argv[1]
        
        if command == "get-rating" and len(sys.argv) == 6:
            title_string = sys.argv[2]
            genres = ast.literal_eval(sys.argv[3])  # Safely parse JSON string to list
            principals = ast.literal_eval(sys.argv[4])  # Safely parse JSON string to list
            release_year = int(sys.argv[5])
            
            result = predictive_rating(title_string, genres, principals, release_year)
            
            # Output results as JSON
            class DecimalEncoder(json.JSONEncoder):
                def default(self, obj):
                    import decimal
                    if isinstance(obj, decimal.Decimal):
                        return float(obj)
                    return super(DecimalEncoder, self).default(obj)
            
            print(json.dumps(result, cls=DecimalEncoder))
        else:
            print(f"Unknown command or incorrect number of arguments: {command}", file=sys.stderr)
            sys.exit(1)
            
    except Exception as e:
        # Print error to stderr and exit with non-zero status
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()