from flask import render_template, jsonify
from flask_login import login_required, current_user
from clubpromoters.promoter import bp
from clubpromoters.models import Purchase, Party
from datetime import datetime
from sqlalchemy import func
from clubpromoters import db
from clubpromoters.util import last_month_datetime


@bp.route('/code', methods=['GET'])
@login_required
def code():
    return render_template('promoter/code.html')


def purchase_list(year, month):
    now = datetime(year, month, 1)
    party = Party.query.join(Purchase).filter(Purchase.promoter == current_user,
                                              Party.party_end_datetime < datetime.now(),
                                              func.month(Party.party_end_datetime) == func.month(now),
                                              func.year(Party.party_end_datetime) == func.year(now)).all()
    return [p.promoter_finances_json() for p in party]


def refund_list(year, month):
    last_month = last_month_datetime(year, month)
    r = Party.query.join(Purchase).filter(Purchase.promoter == current_user,
                                          Party.party_end_datetime < datetime.now(),
                                          func.month(Party.party_end_datetime) == func.month(last_month),
                                          func.year(Party.party_end_datetime) == func.year(last_month)).all()
    return [p.promoter_finances_json() for p in r]


@bp.route('/finances', methods=['GET'])
@login_required
def finances():
    min_year = db.session.query(func.min(Party.party_end_datetime)).join(Purchase)\
        .filter(Purchase.promoter == current_user).all()
    if min_year[0][0] is not None:
        min_year = min_year[0][0].year
    now = datetime.now()
    return render_template('promoter/finances.html', min_year=min_year, year=now.year, month=now.month)


@bp.route('/parties/<int:year>/<int:month>', methods=['GET'])
@login_required
def parties(year, month):
    return jsonify({"purchases": purchase_list(year, month), "refunds": refund_list(year, month)})
