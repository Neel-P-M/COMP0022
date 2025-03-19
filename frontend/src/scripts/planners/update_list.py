
import json
import mysql.connector
import sys
import decimal

def update_list(user_id, list_id, title, note):
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
        FROM 
            planner_lists
        WHERE 
            planner_id = %s and user_id = %s
        """
        cursor.execute(fetch_query, (user_id, list_id))
        planner_list = cursor.fetchone()

        if not planner_list:
            cursor.close()
            conn.close()
            return None

        #Updates the planner list
        update_query = """
        UPDATE planner_lists
        SET
            title = %s
            note = %s
        WHERE 
            planner_id = %s and user_id = %s
        """
        cursor.execute(update_query, (title, note, list_id, user_id))
        conn.commit()

        #Gets the updated planner list
        select_query = """
        SELECT 
            planner_id as id, 
            title, 
            note
        FROM 
            planner_lists
        WHERE 
            planner_id = %s
        """
        cursor.execute(select_query, (list_id,))
        updated_list = cursor.fetchone()

        #Gets the movie count
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
        updated_list['movieCount'] = count_result['count']


        cursor.close()
        conn.close()

        return updated_list
    
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        return None

def main():
    if len(sys.argv) < 5:
        print("Error: User ID, list ID, title and note are required", file=sys.stderr)
        sys.exit(1)
    
    user_id = sys.argv[1]
    list_id = sys.argv[2]
    title = sys.argv[3]
    note = sys.argv[4]
    update_list = update_list(user_id, list_id, title, note)
    if update_list is None:
        sys.exit(1)

    class DecimalEncoder(json.JSONEncoder):
        def default(self, obj):
            if isinstance(obj, decimal.Decimal):
                return float(obj)
            return super(DecimalEncoder, self).default(obj)
        
    print(json.dumps(update_list, cls=DecimalEncoder, indent=2))

if __name__ == "__main__":
    main()
