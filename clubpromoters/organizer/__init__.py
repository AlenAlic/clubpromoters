from flask import Blueprint

bp = Blueprint('organizer', __name__)

from clubpromoters.organizer import routes
