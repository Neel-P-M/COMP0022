
import json
import mysql.connector
import sys
import decimal

def create_list(user_id, title, note):
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

        #Inserts a new planner list to the database
        insert_query = """
        INSERT INTO planner_lists 
            (user_id, title, note) 
        VALUES 
            (%s, %s, %s)
        """
        cursor.execute(insert_query, (user_id, title, note))
        new_list_id = cursor.lastrowid
        conn.commit()

        #Returns the newly added planner list
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
        cursor.execute(select_query, (new_list_id,))
        new_list = cursor.fetchone()
        new_list['movieCount'] = 0

        cursor.close()
        conn.close()

        return new_list
    
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        return None

def main():
    if len(sys.argv) < 4:
        print("Error: User ID, title and note are required", file=sys.stderr)
        sys.exit(1)
    
    user_id = sys.argv[1]
    title = sys.argv[2]
    note = sys.argv[3]
    new_list = create_list(user_id, title, note)
    if new_list is None:
        sys.exit(1)

    class DecimalEncoder(json.JSONEncoder):
        def default(self, obj):
            if isinstance(obj, decimal.Decimal):
                return float(obj)
            return super(DecimalEncoder, self).default(obj)
        
    print(json.dumps(new_list, cls=DecimalEncoder, indent=2))

if __name__ == "__main__":
    main()
