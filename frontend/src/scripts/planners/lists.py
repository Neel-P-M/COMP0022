import json
import mysql.connector
import sys
import decimal


def get_planner_lists(user_id):
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
        
        #Gets all planner lists for the specific user
        fetch_query = """
        SELECT 
            planner_id as id, 
            title, 
            note
        FROM 
            planner_lists
        WHERE 
            user_id = %s
        """

        cursor.execute(fetch_query, (user_id,))
        lists = cursor.fetchall()

        #Counts the number of movies in each list
        for list in lists:
            count_query = """
            SELECT 
                COUNT(*) as count 
            FROM 
                planner_movies 
            WHERE 
                planner_id = %s
            """

            cursor.execute(count_query, (list['id'],))
            count = cursor.fetchone()
            list['movieCount'] = count['count']
        
        cursor.close()
        conn.close()

        return lists

    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        return None
        
def main():
    if len(sys.argv) < 2:
        print("Error: User ID is required", file=sys.stderr)
        sys.exit(1)
    
    user_id = sys.argv[1]
    lists = get_planner_lists(user_id)
    if lists is None:
        sys.exit(1)

    class DecimalEncoder(json.JSONEncoder):
        def default(self, obj):
            if isinstance(obj, decimal.Decimal):
                return float(obj)
            return super(DecimalEncoder, self).default(obj)
        
    print(json.dumps(lists, cls=DecimalEncoder, indent=2))

if __name__ == "__main__":
    main()