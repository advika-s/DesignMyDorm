#!/usr/bin/env python

#-----------------------------------------------------------------------
# designmydorm.py
#-----------------------------------------------------------------------

import flask
import json 
import savetable
import auth
import os
import re
import urllib.parse
#-----------------------------------------------------------------------

app = flask.Flask(__name__, template_folder = '.',
    static_url_path='/static')
app.secret_key = os.environ['APP_SECRET_KEY']
_CAS_URL = 'https://fed.princeton.edu/cas/'

#-----------------------------------------------------------------------

@app.route('/logoutapp', methods=['GET'])
def logoutapp():
    return auth.logoutapp()

@app.route('/logoutcas', methods=['GET'])
def logoutcas():
    return auth.logoutcas()

@app.route('/', methods=['GET'])
@app.route('/home', methods=['GET'])
def landing():
    html_code = flask.render_template('landing.html')
    response = flask.make_response(html_code)
    return response

@app.before_request
def before_request():
    if not flask.request.is_secure:
        url = flask.request.url.replace('http://', 'https://', 1)
        return flask.redirect(url, code=301)
    return None

@app.route('/scale', methods=['GET'])
def scale():
    username = auth.authenticate()
    # username = 'sjberry'
    html_code = flask.render_template('scale.html', username=username)
    response = flask.make_response(html_code)
    return response

@app.route('/design', methods=['GET'])
def design():
    username = auth.authenticate()
    # username = 'sjberry'
    scale = flask.request.cookies.get('scale')
    img_url = flask.request.cookies.get('img_url')
    if scale is None:
        error = "Error: Your request appeared to be missing a scale value for your design."
        html_code = flask.render_template('error.html', error=error)
        response = flask.make_response(html_code)
        return response
    if img_url is None:
        error = "Error: Your request appeared to be missing a background image for your design."
        html_code = flask.render_template('error.html', error=error)
        response = flask.make_response(html_code)
        return response
    html_code = flask.render_template('index.html', username=username,
        json_string='', scale=scale, img_url=img_url, save_name="DesignMyDorm")
    response = flask.make_response(html_code)
    return response

@app.route('/scaleguest', methods=['GET'])
def scaleguest():
    html_code = flask.render_template('scaleguest.html')
    response = flask.make_response(html_code)
    return response

@app.route('/designguest', methods=['GET'])
def designguest():
    scale = flask.request.cookies.get('scale')
    img_url = flask.request.cookies.get('img_url')
    if scale is None:
        error = "Error: Your request appeared to be missing a scale value for your design."
        html_code = flask.render_template('error.html', error=error)
        response = flask.make_response(html_code)
        return response
    if img_url is None:
        error = "Error: Your request appeared to be missing a background image for your design."
        html_code = flask.render_template('error.html', error=error)
        response = flask.make_response(html_code)
        return response
    html_code = flask.render_template('indexguest.html', scale=scale, img_url=img_url)
    response = flask.make_response(html_code)
    return response

@app.route('/save', methods=['GET', 'PUT'])
def save():
    savename = flask.request.cookies.get('savename')
    scale = flask.request.cookies.get('scale')
    img_url = flask.request.cookies.get('img_url')
    json_data = flask.request.cookies.get('json_string')
    username = auth.authenticate()
    # username = 'sjberry'
    if savename is None:
        error = "Error: Your request appeared to be missing a save name."
        html_code = flask.render_template('error.html', error=error)
        response = flask.make_response(html_code)
        return response
    if len(savename) > 15:
        error = "Error: Your save name was too long."
        html_code = flask.render_template('error.html', error=error)
        response = flask.make_response(html_code)
        return response
    if len(savename) == 0:
        error = "Error: You didn't provide a save name."
        html_code = flask.render_template('error.html', error=error)
        response = flask.make_response(html_code)
        return response
    if savename.isascii() == False:
        error = "Error: Your save name was not in ASCII."
        html_code = flask.render_template('error.html', error=error)
        response = flask.make_response(html_code)
        return response
    if scale is None:
        error = "Error: Your request appeared to be missing a scale value for your design."
        html_code = flask.render_template('error.html', error=error)
        response = flask.make_response(html_code)
        return response
    if img_url is None:
        error = "Error: Your request appeared to be missing a background image for your design."
        html_code = flask.render_template('error.html', error=error)
        response = flask.make_response(html_code)
        return response
    if json_data is None:
        error = "Error: Your request appeares to be invalid."
        html_code = flask.render_template('error.html', error=error)
        response = flask.make_response(html_code)
        return response
    

    checkErr = savetable.save(savename, username, scale, img_url, json_data)

    if checkErr[0]==True:
        json_string = ""
        html_code = flask.render_template('error.html', error=checkErr[1])
        return response

    else:
        err, scale, img_url, furniture = savetable.load(False, username, savename)
        if err==True:
            json_string = ""
            html_code = flask.render_template('error.html', error=scale)
            return response
        # there is an error in this case.
        # if scale==0 and img_url==0 and furniture==0:
        #     error_msg = 'This design no longer exists.'
        #     error(error_msg=error_msg)

        else:
            json_string = json.dumps(furniture)
            html_code = flask.render_template('index.html', username=username,
                json_string=json_string, scale=scale, img_url=img_url, save_name=savename)
            response = flask.make_response(html_code)
            return response

@app.route('/initload', methods=['GET'])
def initload():
    username = auth.authenticate()
    # username = 'sjberry'
    err, rooms, shared_rooms = savetable.initload(username)

    if err==True:
        html_code = flask.render_template('error.html', error=rooms)
    else:
        html_code = flask.render_template('load.html', username=username,
            rooms=rooms, shared_rooms=shared_rooms)

    response = flask.make_response(html_code)
    return response


@app.route('/load', methods=['GET'])
def load():
    username = auth.authenticate()
    # username = 'sjberry'
    save_name = flask.request.args.get('save_name')
    shared = flask.request.args.get('shared')
    if save_name is None:
        error = "Error: Your request appeared to be missing a design name."
        html_code = flask.render_template('error.html', error=error)
        response = flask.make_response(html_code)
        return response

    if shared != 'True' and shared != 'False':
        error = "Error: It appears that your entered URL has been altered."
        html_code = flask.render_template('error.html', error=error)
        response = flask.make_response(html_code)
        return response

    if shared=='True':
        save_name = flask.request.args.get('save_name')
        arr = save_name.split('_', 1)
        user_username = username
        try:
            username = arr[0]
            save_name = arr[1]
        except Exception as ex:
            error = "Error: It appears that your entered URL has been altered."
            html_code = flask.render_template('error.html', error=error)
            response = flask.make_response(html_code)
            return response
        err, mess = savetable.share_check(user_username, username, save_name)
        if err==True:
            html_code = flask.render_template('error.html', error=mess)
            response = flask.make_response(html_code)
            return response
    
    err, scale, img_url, furniture = savetable.load(True, username, save_name)

    if err==True:
        html_code = flask.render_template('error.html', error=scale)
        response = flask.make_response(html_code)
        return response
    else:
        json_string = json.dumps(furniture)
        html_code = flask.render_template('index.html', username=username,
            json_string=json_string, scale=scale, img_url=img_url, save_name=save_name)
        response = flask.make_response(html_code)
        return response

@app.route('/share', methods=['GET', 'PUT'])
def share():
    sharename = flask.request.args.get('sharename')
    share_id = flask.request.cookies.get('shareid')
    username = auth.authenticate()
    # username = 'sjberry'
    if sharename is None:
        error = "Error: Your request appeared to be missing a design name."
        html_code = flask.render_template('error.html', error=error)
        response = flask.make_response(html_code)
        return response
    if share_id is None:
        error = "Error: Your request appeared to be missing a shareid."
        html_code = flask.render_template('error.html', error=error)
        response = flask.make_response(html_code)
        return response
    err, ex = savetable.share_save(sharename, username, share_id)

    if err==True:
        html_code = flask.render_template('error.html', error=ex)
        response = flask.make_response(html_code)
        return response

    err2, rooms, shared_rooms = savetable.initload(username)
    print(err2, "hello")
    if err2==True:
        html_code = flask.render_template('error.html', error=rooms)
        response = flask.make_response(html_code)
        return response

    html_code = flask.render_template('load.html', username=username,
        rooms=rooms, shared_rooms=shared_rooms)
    response = flask.make_response(html_code)
    return response
    
@app.route('/delete', methods=['GET'])
def delete():
    username = auth.authenticate()
    # username = 'sjberry'
    save_name = flask.request.args.get('save_name')

    if save_name is None:
        error = "Error: Your request appeared to be missing a design name."
        html_code = flask.render_template('error.html', error=error)
        response = flask.make_response(html_code)
        return response

    err, ex = savetable.delete(username, save_name)

    if err==True:
        html_code = flask.render_template('error.html', error=ex)
        response = flask.make_response(html_code)
        return response

    err2, rooms, shared_rooms = savetable.initload(username)

    if err2==True:
        html_code = flask.render_template('error.html', error=rooms)
        response = flask.make_response(html_code)
        return response

    html_code = flask.render_template('load.html', username=username,
        rooms=rooms, shared_rooms=shared_rooms)
    response = flask.make_response(html_code)
    return response


@app.route('/sharedelete', methods=['GET'])
def sharedelete():
    username = auth.authenticate()
    # username = 'sjberry'
    save_name = flask.request.args.get('save_name')

    if save_name is None:
        error = "Error: Your request appeared to be missing a design name."
        html_code = flask.render_template('error.html', error=error)
        response = flask.make_response(html_code)
        return response

    err, ex = savetable.sharedelete(username, save_name)

    if err==True:
        html_code = flask.render_template('error.html', error=ex)
        response = flask.make_response(html_code)
        return response

    err2, rooms, shared_rooms = savetable.initload(username)

    if err2==True:
        html_code = flask.render_template('error.html', error=rooms)
        response = flask.make_response(html_code)
        return response

    html_code = flask.render_template('load.html', username=username,
        rooms=rooms, shared_rooms=shared_rooms)
    response = flask.make_response(html_code)
    return response

@app.route('/instructions', methods=['GET'])
def instructions():
    html_code = flask.render_template('instructions.html')
    response = flask.make_response(html_code)
    return response