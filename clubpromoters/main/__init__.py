from flask import Blueprint

bp = Blueprint('main', __name__)

from clubpromoters.main import routes
