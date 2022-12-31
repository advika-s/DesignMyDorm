import psycopg2
import sqlalchemy
from sqlalchemy import create_engine
from psycopg2.extensions import register_adapter, AsIs
import os


connection_string = os.environ['DB_HOST']
engine = create_engine(connection_string, pool_size=10,
                                      max_overflow=2,
                                      pool_recycle=300,
                                      pool_pre_ping=True,
                                      pool_use_lifo=True)

def save(save_name, net_id, scale, img_url, json_string):
    if json_string == '[]':
        return
    json_string = json_string[1:]
    json_string = json_string[:len(json_string)-1]
    print(json_string)
    save_objects = json_string.split(',')
    i = 0

    img_url = str(img_url)
    scale = float(scale)
    #edge condition if they try to save room with no furniture?

    # true if db error
    try:
        with engine.connect() as connection:
            query1 = "DELETE FROM furniture_save WHERE save_name = %s AND net_id = %s"
            connection.execute(query1, (save_name, net_id))

            query2 = "DELETE FROM room_save WHERE room_save.save_name= %s AND net_id= %s"
            connection.execute(query2, (str(save_name), str(net_id)))
                
            query3 = """INSERT INTO room_save (net_id, save_name, room_scale, img_url) VALUES(%s, %s, %s, %s)"""

            connection.execute(query3, (net_id, save_name, scale, img_url))

            while i < len(save_objects):
                save_name = str(save_name)
                net_id = str(net_id)
                furntype = str(save_objects[i])
                furntype = furntype[1:len(furntype)-1]
                width = float(save_objects[i+1])
                height = float(save_objects[i+2])
                rotation = float(save_objects[i+3])
                x_coord = float(save_objects[i+4])
                y_coord = float(save_objects[i+5])
                i += 6

                query4 = """INSERT INTO furniture_save (net_id, save_name, type, width, height, rotation, x_coord, y_coord) VALUES(%s, %s, %s, %s, %s, %s, %s, %s)"""
                connection.execute(query4, (net_id, save_name, furntype, width, height, rotation, x_coord, y_coord))
        return [False, 0]

    except Exception as ex:
        return [True, 'A database related error occurred. Please contact your administrator.']



def initload(net_id):
    share_list = []
    load_list = []
    try:
        with engine.connect() as connection:
            result2 = connection.execute(
                "SELECT * FROM shared_save WHERE net_id_shared= %s", (net_id))
            for row in result2:
                share_list.append(row[2])

            result = connection.execute(
                "SELECT * FROM room_save WHERE net_id= %s", (net_id))
            for row in result:
                load_list.append(row[1])
            
        return False, load_list, share_list

    except Exception as ex:
        print(ex)
        return True, 'A database related error occurred. Please contact your administrator.', share_list


def share_check(net_id_shared, net_id_host, save_name):
    try:
        shared_save = net_id_host + "_" + save_name
        with engine.connect() as connection:
            check_share = connection.execute(
            "SELECT * FROM shared_save WHERE net_id_shared = %s AND net_id_host = %s AND save_name = %s", (net_id_shared, net_id_host, shared_save)
            )

            for row in check_share:
                return False, ''
                
        return True, 'A database related error occurred. Please contact your administrator.'
    except:
        return True, 'A database related error occurred. Please contact your administrator.'

def load(shared, net_id, save_name):  
    try:
        furniture = '['
        with engine.connect() as connection:

            scale_iter = connection.execute(
                "SELECT room_scale FROM room_save WHERE net_id = %s AND save_name = %s", (net_id, save_name)
                )

            for row in scale_iter:
                scale = str(row[0])
            img_url_iter = connection.execute(
                "SELECT img_url FROM room_save WHERE net_id = %s AND save_name = %s", (net_id, save_name))
            for row in img_url_iter:
                img_url = str(row[0])
            result = connection.execute(
                "SELECT * FROM furniture_save WHERE net_id = %s AND save_name = %s", (net_id, save_name))
            for row in result:
                for res in row[2:]:
                    furniture += str(res) + ','
        
        furniture = furniture[: len(furniture) - 1]
        furniture += ']'
        return False, scale, img_url, furniture

    except Exception as ex:
        return True, 'A database related error occurred. Please contact your administrator.', 0, 0

# share it with someone - netid of the other person, savename that they wanna share
def share_save(save_name, host_net_id, shared_net_id):
    save_name_fin = host_net_id + '_' + save_name
    err, ex, _, _ = load(True, host_net_id, save_name)

    if err==True:
        return True, 'A database related error occurred. Please contact your administrator.'

    try:
        with engine.connect() as connection:
            query1 = "DELETE FROM shared_save WHERE save_name = %s AND net_id_host = %s AND net_id_shared = %s"

            connection.execute(query1, (save_name_fin, host_net_id, shared_net_id))

            query2 = """INSERT INTO shared_save (net_id_host, net_id_shared, save_name) VALUES(%s, %s, %s)"""
            connection.execute(query2, (host_net_id, shared_net_id, save_name_fin))

            return False, 0
    except Exception as ex:
        return True, 'A database related error occurred. Please contact your administrator.'

def delete(username, save_name):
    try:
        with engine.connect() as connection:
            # if furniture save exists, delete all previous saves
            query1 = "DELETE FROM room_save WHERE save_name = %s AND net_id = %s"
            connection.execute(query1, (save_name, username, ))

            query2 = "DELETE FROM furniture_save WHERE save_name = %s AND net_id = %s"
            connection.execute(query2, (save_name, username, ))

            save_name = username + '_' + save_name
            query3 = "DELETE FROM shared_save WHERE save_name = %s AND net_id_host = %s"
            connection.execute(query3, (save_name, username))

            return False, 0

    except Exception:
        True, 'A database related error occurred. Please contact your administrator.'

def sharedelete(sharedwith, save_name):
    arr = save_name.split('_', 1)
    sharer = arr[0]
    
    try:
        with engine.connect() as connection:
            queryShare = "DELETE FROM shared_save WHERE save_name = %s AND net_id_shared = %s AND net_id_host = %s"
            connection.execute(queryShare, (save_name, sharedwith, sharer))
            
            return False, 0
    except Exception:
        True, 'A database related error occurred. Please contact your administrator.'
