from flask import render_template, request, redirect, url_for, flash
from flask_login import login_required
from clubpromoters.organizer import bp
from clubpromoters.models import requires_access_level, User, Party, Code
from clubpromoters import db
from clubpromoters.organizer.forms import CreateNewAccountFrom, CreateNewPartyFrom, AddNewCodesFrom, AssignCodeForm
from clubpromoters.values import ACCESS, ORGANIZER, CLUB_OWNER, HOSTESS, PROMOTER, hostess_name, NORMAL
import random


def random_code():
    return ''.join(random.sample('0123456789', 8))


@bp.route('/create_new_account', methods=['GET', 'POST'])
@login_required
@requires_access_level([ACCESS[ORGANIZER]])
def create_new_account():
    new_account_form = CreateNewAccountFrom()
    if request.method == "POST":
        new_account_form.validate()
        if new_account_form.validate_on_submit():
            account = User()
            account.username = new_account_form.username.data
            account.email = new_account_form.email.data
            account.access = new_account_form.type.data
            account.is_active = True
            db.session.add(account)
            db.session.commit()
            if new_account_form.type.data == ACCESS[CLUB_OWNER]:
                hostess = User()
                hostess.username = hostess_name(new_account_form.username.data)
                hostess.email = new_account_form.hostess_email.data
                hostess.access = ACCESS[HOSTESS]
                hostess.is_active = True
                db.session.add(hostess)
                db.session.commit()
                flash(f"Added {account} and {hostess} account.")
            else:
                flash(f"Added {account} account.")
            return redirect(url_for('organizer.create_new_account'))
    return render_template('organizer/create_new_account.html', new_account_form=new_account_form)


@bp.route('/club_owner_accounts', methods=['GET', 'POST'])
@login_required
@requires_access_level([ACCESS[ORGANIZER]])
def club_owner_accounts():
    accounts = User.query.filter(User.access == ACCESS[CLUB_OWNER]).order_by(User.username).all()
    hostesses = {a: User.query.filter(User.access == ACCESS[HOSTESS], User.username == hostess_name(a.username)).first()
                 for a in accounts}
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


@bp.route('/create_new_party', methods=['GET', 'POST'])
@login_required
@requires_access_level([ACCESS[ORGANIZER]])
def create_new_party():
    new_party_form = CreateNewPartyFrom()
    new_party_form.validate()
    if request.method == "POST":
        if new_party_form.validate_on_submit():
            party = Party()
            party.title = new_party_form.title.data
            party.party_start_datetime = new_party_form.party_start_datetime.data
            party.party_end_datetime = new_party_form.party_end_datetime.data
            party.num_available_tickets = new_party_form.num_available_tickets.data
            party.ticket_price = new_party_form.ticket_price.data
            party.status = NORMAL
            db.session.add(party)
            db.session.commit()
            return redirect(url_for('organizer.create_new_party'))
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
    return render_template('organizer/active_parties.html')


@bp.route('/past_parties', methods=['GET', 'POST'])
@login_required
@requires_access_level([ACCESS[ORGANIZER]])
def past_parties():
    return render_template('organizer/past_parties.html')


@bp.route('/party_income', methods=['GET', 'POST'])
@login_required
@requires_access_level([ACCESS[ORGANIZER]])
def party_income():
    parties = Party.query.filter(Party.purchases.any()).all()
    return render_template('organizer/party_income.html', parties=parties)
