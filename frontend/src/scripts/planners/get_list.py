
import json
import mysql.connector
import sys
import decimal
from collections import defaultdict

def get_list(user_id, list_id):
    """
    Connect to the MySQL database, execute the specified query,
    and output results in the requested format.
    """

    try:
        #Connect to the MySQL database
        conn = mysql.connector.connect(
            host="database",
            port=3306,
            user="user",
            password="password",
            database="moviefestival"
        )

        cursor = conn.cursor(dictionary=True)

        #Fetch the specific list under a specific user
        fetch_query = """
        SELECT 
            planner_id as id, 
            title, 
            note
        FROM 
            planner_lists
        WHERE 
            planner_id = %s and user_id = %s
        """
        cursor.execute(fetch_query, (list_id, user_id))
        planner_list = cursor.fetchone()

        if not planner_list:
            cursor.close()
            conn.close()
            return None

        #Get the movies in the list
        movies_query = """
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
            planner_movies pm
        JOIN 
            movies m ON pm.movie_id = m.movieId
        LEFT JOIN 
            principals p ON m.movieId = p.movieId
        LEFT JOIN 
            names n ON p.nameId = n.nameId
        LEFT JOIN 
            movie_genres mg ON m.movieId = mg.movieId
        LEFT JOIN 
            genres g ON mg.genreId = g.genreId
        WHERE 
            pm.planner_id = %s
        GROUP BY 
            m.movieId, n.nameId, p.id
        ORDER BY 
            m.movieId, p.roleString
        """
        cursor.execute(movies_query, (list_id,))
        query_results = cursor.fetchall()

        # Process the results to group principals by movie
        movie_data = defaultdict(lambda: {
            'title': '',
            'release_year': None,
            'rating': None,
            'poster_path': None,
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
            movie['poster_path'] = row['poster_path']
            
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

        # Format movies for response
        movies = []
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
            
            movies.append(data)

        # Add movies to the list
        planner_list['movies'] = movies
        planner_list['movieCount'] = len(movies)

        cursor.close()
        conn.close()

        return planner_list
    
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        return None

def main():
    if len(sys.argv) < 3:
        print("Error: User ID, list ID are required", file=sys.stderr)
        sys.exit(1)
    
    user_id = sys.argv[1]
    list_id = sys.argv[2]
    planner_list = get_list(user_id, list_id)
    if planner_list is None:
        sys.exit(1)

    class DecimalEncoder(json.JSONEncoder):
        def default(self, obj):
            if isinstance(obj, decimal.Decimal):
                return float(obj)
            return super(DecimalEncoder, self).default(obj)
        
    print(json.dumps(planner_list, cls=DecimalEncoder, indent=2))

if __name__ == "__main__":
    main()
