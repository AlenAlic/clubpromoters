from flask import Blueprint

bp = Blueprint('auth', __name__)

from clubpromoters.auth import routes
