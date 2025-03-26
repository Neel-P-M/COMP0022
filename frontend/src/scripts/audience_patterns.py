import mysql.connector as sql
import pandas as pd
import json
import decimal
import sys

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def getUsersWithBoundedGenreRating(cursor, genreId, min_val, max_val):
    cursor.execute("""SELECT r.viewerId
                   FROM ratings r
                   JOIN (SELECT movieId FROM movie_genres WHERE genreId = %s) AS mg USING (movieId)
                   GROUP BY r.viewerId
                   HAVING AVG(r.rating) >= %s AND AVG(r.rating) <= %s
                   """, (genreId, min_val, max_val,))
    ratings = cursor.fetchall()
    userIds = [user[0] for user in ratings]
    return userIds

def getUsersAvgGenreRating(cursor, userIds, genreId):
    if len(userIds) == 0:
        return None
    queryPlaceholder = ", ".join(["%s"] * len(userIds))
    query = f"""
    SELECT AVG(viewerAvgs.avgViewerRating)
    FROM (
        SELECT AVG(r.rating) as avgViewerRating
        FROM
            (SELECT rating, movieId, viewerId FROM ratings WHERE viewerId IN ({queryPlaceholder})) AS r
            JOIN (SELECT movieId FROM movie_genres WHERE genreId = %s) AS mg USING (movieId)
            GROUP BY r.viewerId
    ) as viewerAvgs
    """
    cursor.execute(query, tuple(userIds) + (genreId,))
    avgRating = cursor.fetchone()[0]
    if avgRating is None:
        return None
    return float(avgRating)

def getBoundedGenreAudiencePatterns(cursor, genreString, min_val, max_val):
    cursor.execute("""SELECT genreId 
                   FROM genres
                   WHERE genreString = %s""", (genreString,))
    genre = cursor.fetchone()
    genreId = genre[0]
    cursor.execute("""SELECT genreId, genreString
                   FROM genres
                   WHERE genreString != %s""", (genreString,))
    otherGenres = cursor.fetchall()
    otherGenreIds = [g[0] for g in otherGenres]
    otherGenreStrings = [g[1] for g in otherGenres]

    userIds = getUsersWithBoundedGenreRating(cursor, genreId, min_val, max_val)

    audiencePatterns = {}
    for i in range(len(otherGenreIds)):
        audiencePatterns[otherGenreStrings[i]] = getUsersAvgGenreRating(cursor, userIds, otherGenreIds[i])

    return audiencePatterns

# -------------------------
# MAIN SCRIPT
# -------------------------

genre_arg = sys.argv[1]  # e.g., "Action"
comparison_flag = sys.argv[2]  # "over" or "under"
threshold = float(sys.argv[3])

if comparison_flag == "over":
    min_val, max_val = threshold, 5.0
else:
    min_val, max_val = 0.0, threshold

connection = sql.connect(
    host="database",
    port=3306,
    user="user",
    password="password",
    database="moviefestival"
)

cursor = connection.cursor()

print(json.dumps({ "audiencePatterns": getBoundedGenreAudiencePatterns(cursor, genre_arg, min_val, max_val) }, cls=DecimalEncoder))

cursor.close()
connection.close()
