from flask import Blueprint

bp = Blueprint('promoter', __name__)

from clubpromoters.promoter import routes
