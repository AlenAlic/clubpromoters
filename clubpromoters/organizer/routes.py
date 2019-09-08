from flask import render_template, request, redirect, url_for, flash, jsonify, g, json
from flask_login import login_required
from clubpromoters.organizer import bp
from clubpromoters.models import requires_access_level, User, Party, Code, File, Party, Purchase, Refund, \
    activation_code, page_inactive
from clubpromoters import db
from clubpromoters.organizer.forms import CreateNewClubOwnerAccountFrom, CreateNewPromoterAccountFrom, \
    CreateNewPartyFrom, AddNewCodesFrom, AssignCodeForm, UploadImagesForm
from clubpromoters.values import ACCESS, ORGANIZER, CLUB_OWNER, HOSTESS, PROMOTER, NORMAL, UPLOAD_FOLDER, \
    LOGO, IMAGE
import random
from werkzeug.utils import secure_filename
from clubpromoters.util import upload_file, last_month_datetime
import os
from sqlalchemy import func
from datetime import datetime
from mollie.api.client import Client
from clubpromoters.auth.email import send_activation_email


def random_code():
    return ''.join(random.sample('01234567', 6))


@bp.route('/create_new_account', methods=['GET', 'POST'])
@login_required
@requires_access_level([ACCESS[ORGANIZER]])
def create_new_account():
    new_club_owner_form = CreateNewClubOwnerAccountFrom(prefix="club_owner")
    new_promoter_form = CreateNewPromoterAccountFrom(prefix="promoter")
    if request.method == "POST":
        if new_club_owner_form.submit.name in request.form:
            if new_club_owner_form.validate_on_submit():
                account = User()
                account.username = new_club_owner_form.username.data
                account.email = new_club_owner_form.email.data
                account.access = new_club_owner_form.type.data
                account.activation_code = activation_code()
                account.commission = g.config.default_club_owner_commission
                send_activation_email(account)
                db.session.add(account)
                db.session.commit()
                flash(f"Added Club Owner account ({account.email}).")
                return redirect(url_for('organizer.create_new_account'))
        if new_promoter_form.submit.name in request.form:
            if new_promoter_form.validate_on_submit():
                account = User()
                account.username = new_promoter_form.username.data
                account.email = new_promoter_form.email.data
                account.access = new_promoter_form.type.data
                account.code = Code.query.filter(Code.code_id == new_promoter_form.code.data).first()
                account.activation_code = activation_code()
                account.commission = g.config.default_promoter_commission
                send_activation_email(account)
                db.session.add(account)
                db.session.commit()
                flash(f"Added Promoter account ({account.email}).")
                return redirect(url_for('organizer.create_new_account'))
    return render_template('organizer/create_new_account.html', new_club_owner_form=new_club_owner_form,
                           new_promoter_form=new_promoter_form)


@bp.route('/club_owner_accounts', methods=['GET', 'POST'])
@login_required
@requires_access_level([ACCESS[ORGANIZER]])
def club_owner_accounts():
    accounts = User.query.filter(User.access == ACCESS[CLUB_OWNER]).order_by(User.username).all()
    hostesses = sum([len(a.hostesses) for a in accounts])
    return render_template('organizer/club_owner_accounts.html', accounts=accounts, hostesses=hostesses)


@bp.route('/promoter_accounts', methods=['GET', 'POST'])
@login_required
@requires_access_level([ACCESS[ORGANIZER]])
def promoter_accounts():
    accounts = User.query.filter(User.access == ACCESS[PROMOTER]).order_by(User.username).all()
    return render_template('organizer/promoter_accounts.html', accounts=accounts)


@bp.route('/codes', methods=['GET', 'POST'])
@login_required
@requires_access_level([ACCESS[ORGANIZER]])
def codes():
    add_codes_form = AddNewCodesFrom()
    assign_code_form = AssignCodeForm()
    if request.method == "POST":
        if add_codes_form.submit.name in request.form:
            if add_codes_form.validate_on_submit():
                added_codes = []
                i = 0
                while add_codes_form.number_of_codes.data > len(added_codes):
                    new_code = random_code()
                    test_code = Code.query.filter(Code.code == new_code).first()
                    if test_code is None:
                        db.session.add(Code(code=new_code))
                        added_codes.append(new_code)
                    i += 1
                    if i > 1000:
                        break
                flash(f"Added {len(added_codes)} new code{'s' if len(added_codes) > 1 else ''}.", "success")
                db.session.commit()
                return redirect(url_for('organizer.codes'))
        if assign_code_form.submit_assign_code.name in request.form:
            if assign_code_form.validate_on_submit():
                promoter = User.query.filter(User.user_id == assign_code_form.promoter.data).first()
                code = Code.query.filter(Code.code == assign_code_form.code.data).first()
                promoter.code = code
                db.session.commit()
                flash(f"Assigned code '{code}' to {promoter}")
                return redirect(url_for('organizer.codes'))
        if "deactivateCodeSubmit" in request.form:
            code = Code.query.filter(Code.code == request.form["deactivateCode"]).first()
            if code.user is not None:
                flash(f"Deactivated code '{code}', and removed it from {code.user}.")
            else:
                flash(f"Deactivated code '{code}'.")
            code.deactivate()
            db.session.commit()
            return redirect(url_for('organizer.codes'))
    active_codes = Code.query.filter(Code.active.is_(True)).all()
    inactive_codes = Code.query.filter(Code.active.is_(False)).all()
    return render_template('organizer/codes.html', add_codes_form=add_codes_form, assign_code_form=assign_code_form,
                           active_codes=active_codes, inactive_codes=inactive_codes)


@bp.route('/party_images', methods=['GET', 'POST'])
@login_required
@requires_access_level([ACCESS[ORGANIZER]])
def party_images():
    upload_form = UploadImagesForm()
    if request.method == "POST":
        if upload_form.validate_on_submit():
            club_owner = User.query.filter(User.user_id == upload_form.club_owner.data).first()
            if upload_form.logo.name in request.files:
                upload_file(request.files[upload_form.logo.name], club_owner, LOGO)
            if upload_form.image.name in request.files:
                upload_file(request.files[upload_form.image.name], club_owner, IMAGE)
            return redirect(url_for('organizer.party_images'))
    return render_template('organizer/party_images.html', upload_form=upload_form)


@bp.route('/party_template', methods=['GET', 'POST'])
@login_required
@requires_access_level([ACCESS[ORGANIZER]])
@page_inactive
def party_template():
    return render_template('organizer/party_template.html')


@bp.route('/create_new_party', methods=['GET', 'POST'])
@login_required
@requires_access_level([ACCESS[ORGANIZER]])
def create_new_party():
    new_party_form = CreateNewPartyFrom()
    if request.method == "POST":
        if new_party_form.validate_on_submit():
            club_owner = User.query.filter(User.user_id == new_party_form.club_owner.data).first()
            logo = upload_file(request.files[new_party_form.logo.name], club_owner, LOGO)
            image = upload_file(request.files[new_party_form.image.name], club_owner, IMAGE)
            party = Party()
            party.title = new_party_form.title.data
            party.party_start_datetime = new_party_form.party_start_datetime.data
            party.party_end_datetime = new_party_form.party_end_datetime.data
            party.num_available_tickets = new_party_form.num_available_tickets.data
            party.set_ticket_price(new_party_form.ticket_price.data)
            party.status = NORMAL
            party.club_owner_commission = new_party_form.club_owner_commission.data
            party.club_owner = club_owner
            party.logo = logo.url()
            party.image = image.url()
            party.files.append(logo)
            party.files.append(image)
            db.session.add(party)
            db.session.commit()
            return redirect(url_for('organizer.create_new_party'))
        new_party_form.image.data = None
        new_party_form.logo.data = None
    return render_template('organizer/create_new_party.html', new_party_form=new_party_form)


@bp.route('/inactive_parties', methods=['GET', 'POST'])
@login_required
@requires_access_level([ACCESS[ORGANIZER]])
def inactive_parties():
    if request.method == "POST":
        if "start_ticket_sale" in request.form:
            party = Party.query.filter(Party.party_id == request.form["start_ticket_sale"]).first()
            party.is_active = True
            db.session.commit()
            return redirect(url_for('organizer.inactive_parties'))
    return render_template('organizer/inactive_parties.html')


@bp.route('/active_parties', methods=['GET', 'POST'])
@login_required
@requires_access_level([ACCESS[ORGANIZER]])
def active_parties():
    if request.method == "POST":
        if "pause_ticket_sale" in request.form:
            party = Party.query.filter(Party.party_id == request.form["pause_ticket_sale"]).first()
            party.is_active = False
            db.session.commit()
            return redirect(url_for('organizer.active_parties'))
    return render_template('organizer/active_parties.html')


@bp.route('/past_parties', methods=['GET', 'POST'])
@login_required
@requires_access_level([ACCESS[ORGANIZER]])
def past_parties():
    min_year = db.session.query(func.min(Party.party_end_datetime)).all()
    if min_year[0][0] is not None:
        min_year = min_year[0][0].year
    now = datetime.now()
    return render_template('organizer/past_parties.html', min_year=min_year, year=now.year, month=now.month)


def past_parties_list(year, month):
    last_month = last_month_datetime(year, month)
    party = Party.query.filter(Party.party_end_datetime < datetime.now(),
                               func.month(Party.party_end_datetime) == func.month(last_month),
                               func.year(Party.party_end_datetime) == func.year(last_month)).all()
    return [p.past_party_json() for p in party]


@bp.route('/parties/<int:year>/<int:month>', methods=['GET'])
@login_required
def parties(year, month):
    return jsonify(past_parties_list(year, month))


@bp.route('/party_income', methods=['GET', 'POST'])
@login_required
@requires_access_level([ACCESS[ORGANIZER]])
@page_inactive
def party_income():
    party = Party.query.filter(Party.purchases.any()).all()
    return render_template('organizer/party_income.html', parties=party)


def purchases_list(year, month):
    last_month = last_month_datetime(year, month)
    purchase = Purchase.query.filter(Purchase.purchase_datetime < datetime.now(),
                                     func.month(Purchase.purchase_datetime) == func.month(last_month),
                                     func.year(Purchase.purchase_datetime) == func.year(last_month)).all()
    return [p.refund_json() for p in purchase]


@bp.route('/purchases/<int:year>/<int:month>', methods=['GET'])
@login_required
def purchases(year, month):
    return jsonify(purchases_list(year, month))


@bp.route('/party_refunds', methods=['GET', 'POST'])
@login_required
@requires_access_level([ACCESS[ORGANIZER]])
def party_refunds():
    min_year = db.session.query(func.min(Party.party_end_datetime)).all()
    if min_year[0][0] is not None:
        min_year = min_year[0][0].year
    now = datetime.now()
    return render_template('organizer/party_refunds.html', min_year=min_year, year=now.year, month=now.month)


@bp.route('/refund', methods=['GET', 'POST'])
@login_required
@requires_access_level([ACCESS[ORGANIZER]])
def refund():
    mollie_client = Client()
    mollie_client.set_api_key(g.mollie)

    data = json.loads(request.data)
    purchase_id = data["purchase_id"]
    amount = data["amount"]
    mollie_value = '{:,.2f}'.format(float(amount))

    purchase = Purchase.query.filter(Purchase.purchase_id == purchase_id).first()
    mollie_id = purchase.mollie_payment_id
    payment = mollie_client.payments.get(mollie_id)

    if payment is not None:
        ref = Refund()
        ref.set_price(float(mollie_value))
        ref.purchase = purchase
        db.session.add(ref)
        db.session.commit()

        if payment.can_be_refunded() and float(payment.amount_remaining['value']) >= 1.0:
            data = {
                'amount': {'value': mollie_value, 'currency': 'EUR'},
                'description': f'test {datetime.now().strftime("%d-%m-%Y %H:%M:%S")}'
            }
            r = mollie_client.payment_refunds.with_parent_id(mollie_id).create(data)
            ref.mollie_refund_id = r["id"]
            db.session.commit()
            return jsonify({"payment": payment, "refund": r})
        else:
            db.session.delete(ref)
            db.session.commit()
            return "", 500


@bp.route('/organization_commissions', methods=['GET', 'POST'])
@login_required
@requires_access_level([ACCESS[ORGANIZER]])
@page_inactive
def organization_commissions():
    return render_template('organizer/active_parties.html')


@bp.route('/promoter_commissions', methods=['GET', 'POST'])
@login_required
@requires_access_level([ACCESS[ORGANIZER]])
@page_inactive
def promoter_commissions():
    return render_template('organizer/active_parties.html')
