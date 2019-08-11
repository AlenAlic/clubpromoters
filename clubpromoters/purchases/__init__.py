from flask import Blueprint

bp = Blueprint('purchases', __name__)

from clubpromoters.purchases import routes
