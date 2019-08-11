from flask import Blueprint

bp = Blueprint('self_admin', __name__)

from clubpromoters.admin import routes
