import json
import mysql.connector
import sys
import decimal

def delete_list(user_id, list_id):
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
            planner_id as id
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


        # Delete the list
        delete_query = """
        DELETE FROM planner_lists 
        WHERE 
            planner_id = %s AND user_id = %s
        """
        cursor.execute(delete_query, (list_id, user_id))
        conn.commit()

        deleted = cursor.rowcount > 0
        
        cursor.close()
        conn.close()

        return {"deleted": deleted}
    
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        return None

def main():
    if len(sys.argv) < 3:
        print("Error: User ID and list ID are required", file=sys.stderr)
        sys.exit(1)
    
    user_id = sys.argv[1]
    list_id = sys.argv[2]
    result = delete_list(user_id, list_id)
    if result is None:
        sys.exit(1)

    class DecimalEncoder(json.JSONEncoder):
        def default(self, obj):
            if isinstance(obj, decimal.Decimal):
                return float(obj)
            return super(DecimalEncoder, self).default(obj)
        
    print(json.dumps(result, cls=DecimalEncoder, indent=2))

if __name__ == "__main__":
    main()