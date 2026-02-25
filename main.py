import socketio
import eventlet
import eventlet.wsgi
from flask import Flask
import os

sio = socketio.Server(cors_allowed_origins='*')
app = Flask(__name__)
app.wsgi_app = socketio.WSGIApp(sio, app.wsgi_app)

admin_sid = None
ghosts = {} 
SECRET_KEY = "YOUR_SECRET_8888" # Change this to your key!

@sio.event
def connect(sid, environ):
    sio.emit('status_update', {'admin_present': admin_sid is not None}, room=sid)

@sio.on('claim_admin')
def claim_admin(sid, data):
    global admin_sid
    if admin_sid is None and data.get('key') == SECRET_KEY:
        admin_sid = sid
        sio.emit('role_assigned', {'role': 'MASTER'}, room=sid)
        sio.emit('status_update', {'admin_present': True})
        print(f"Master Admin Set: {sid}")

@sio.on('register_ghost')
def register_ghost(sid, data):
    ghosts[sid] = data['name']
    if admin_sid:
        sio.emit('new_ghost', {'name': data['name'], 'id': sid}, room=admin_sid)

@sio.event
def disconnect(sid):
    global admin_sid
    if sid == admin_sid:
        admin_sid = None
        sio.emit('status_update', {'admin_present': False})
    if sid in ghosts:
        del ghosts[sid]

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8080))
    eventlet.wsgi.server(eventlet.listen(('0.0.0.0', port)), app)
