import json
import mysql.connector
import sys
from collections import defaultdict

def main():
    """
    Connect to the MySQL database, execute the specified query,
    and output results in the requested format.
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
        
        # Execute the query with GROUP_CONCAT for genres
        # Note: 'character' is a reserved word in MySQL, so we need to escape it with backticks
        query = """
        SELECT 
            m.movieId AS id,
            m.titleString AS title,
            m.releaseYear AS release_year,
            m.avgRating AS rating,
            n.nameId,
            n.nameString AS name,
            p.roleString AS role,
            p.characterString AS `character`,
            GROUP_CONCAT(DISTINCT g.genreString SEPARATOR ', ') AS genres
        FROM 
            movies m
        LEFT JOIN 
            principals p ON m.movieId = p.movieId
        LEFT JOIN 
            names n ON p.nameId = n.nameId
        LEFT JOIN 
            movie_genres mg ON m.movieId = mg.movieId
        LEFT JOIN 
            genres g ON mg.genreId = g.genreId
        GROUP BY 
            m.movieId, n.nameId, p.id
        ORDER BY 
            m.movieId, p.roleString;
        """
        
        cursor.execute(query)
        query_results = cursor.fetchall()
        
        # Process the results to group principals by movie
        movie_data = defaultdict(lambda: {
            'title': '',
            'release_year': None,
            'rating': None,
            'genres': set(),
            'principals_set': set(),  # Store tuples in a set for deduplication
        })
        
        for row in query_results:
            movie_id = row['id']
            movie = movie_data[movie_id]
            
            # Set movie details
            movie['title'] = row['title']
            movie['release_year'] = row['release_year']
            movie['rating'] = row['rating']
            
            # Add genres (from comma-separated string to set to avoid duplicates)
            if row['genres']:
                for genre in row['genres'].split(', '):
                    movie['genres'].add(genre)
            
            # Add principal if present
            if row['name'] and row['role']:
                # Create a tuple for the principal (tuples are hashable)
                if row['character']:
                    # Include character in the tuple if it exists
                    principal_tuple = (row['name'], row['role'], row['character'])
                else:
                    # Otherwise just name and role
                    principal_tuple = (row['name'], row['role'], None)
                
                # Add to set - duplicates are automatically eliminated
                movie['principals_set'].add(principal_tuple)
        
        # Format final results
        results = []
        for movie_id, data in movie_data.items():
            # Convert set to list for JSON serialization
            data['genres'] = sorted(list(data['genres']))
            
            # Convert principal tuples to dictionaries
            principals = []
            for principal_tuple in data['principals_set']:
                name, role, character = principal_tuple
                principal_dict = {'name': name, 'role': role}
                if character:
                    principal_dict['character'] = character
                principals.append(principal_dict)
            
            # Replace the set with the list of dictionaries
            data['principals'] = principals
            del data['principals_set']
            
            # Add the movie id
            data['id'] = movie_id
            
            results.append(data)
        
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
        
        print(json.dumps(results, cls=DecimalEncoder, indent=2))
        
    except Exception as e:
        # Print error to stderr and exit with non-zero status
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()