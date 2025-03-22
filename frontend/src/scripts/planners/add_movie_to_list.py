
import json
import mysql.connector
import sys
import decimal

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def add_movie_to_list(user_id, list_id, movie_id):
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

        #Check if movie exists in the planner list
        check_query = """
        SELECT 
            id
        FROM 
            planner_movies
        WHERE 
            planner_id = %s AND movie_id = %s
        """
        cursor.execute(check_query, (list_id, movie_id))
        existing = cursor.fetchone()
        
        if existing:
            cursor.close()
            conn.close()
            return {
                "success": False,
                "error": "This movie is already in the list",
                "listId": int(list_id),
                "movieId": int(movie_id)
            }

        #Add the movie to the list
        insert_query = """
        INSERT INTO planner_movies 
            (planner_id, movie_id) 
        VALUES 
            (%s, %s)
        """
        cursor.execute(insert_query, (list_id, movie_id))
        conn.commit()

        #Get the updated movie count
        count_query = """
        SELECT 
            COUNT(*) as count
        FROM 
            planner_movies
        WHERE 
            planner_id = %s
        """
        cursor.execute(count_query, (list_id,))
        count_result = cursor.fetchone()
        
        cursor.close()
        conn.close()

        return {
            "success": True,
            "message": "Movie added to list successfully",
            "listId": int(list_id),
            "movieId": int(movie_id),
            "movieCount": count_result['count']
        }
    
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        return None

def main():
    if len(sys.argv) < 4:
        print("Error: User ID, listID and movieID are required", file=sys.stderr)
        sys.exit(1)
    
    user_id = sys.argv[1]
    list_id = sys.argv[2]
    movie_id = sys.argv[3]
    res = add_movie_to_list(user_id, list_id, movie_id)
    if res is None:
        sys.exit(1)

    if not res["success"]:
        print(json.dumps(res, cls=DecimalEncoder, indent=2))
        sys.exit(0)
        
    print(json.dumps(res, cls=DecimalEncoder, indent=2))

if __name__ == "__main__":
    main()
