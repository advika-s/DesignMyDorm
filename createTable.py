import psycopg2
import os
#only run once to create table

connection_string = os.environ['DB_HOST']

conn = psycopg2.connect(connection_string)

conn.set_session(autocommit=True)
cur = conn.cursor()

cur.execute(
  """
  DROP TABLE IF EXISTS furniture_save
  """)

cur.execute(
  """
  DROP TABLE IF EXISTS room_save
  """)

cur.execute(
  """
  DROP TABLE IF EXISTS shared_save
  """)

cur.execute(
  """
  CREATE TABLE furniture_save(
          net_id TEXT NOT NULL,
          save_name TEXT NOT NULL,
          type TEXT NOT NULL,
          width FLOAT NOT NULL,
          height FLOAT NOT NULL,
          rotation FLOAT NOT NULL,
          x_coord FLOAT NOT NULL,
          y_coord FLOAT NOT NULL
  )
  """)

#database saved to pull up all saves done by each net_id
cur.execute(
  """
  CREATE TABLE room_save(
          net_id TEXT NOT NULL,
          save_name TEXT NOT NULL,
          room_scale FLOAT NOT NULL,
          img_url TEXT
      )
  """)

#database saved to pull up all saves done by each net_id
#save name has to be identical to their personal save name
#add edge case incase that the Net_id_host tries to share a save name that doesn't exist in their profile
cur.execute(
  """
  CREATE TABLE shared_save(
          net_id_host TEXT NOT NULL,
          net_id_shared TEXT NOT NULL,
          save_name TEXT NOT NULL
      )
  """)

print("Created table")

cur.close()

conn.close()