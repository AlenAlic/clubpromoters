from flask import render_template, request, redirect, url_for, flash
from flask_login import login_user, logout_user, login_required, current_user
from clubpromoters.admin import bp
from clubpromoters.admin.forms import CreateOrganizerAccountFrom
from clubpromoters.models import User, Code, Party, Purchase, Ticket
from clubpromoters.values import ACCESS, ORGANIZER, PROMOTER, ADMIN, NORMAL, STATUS_PAID
from clubpromoters import db
from clubpromoters.auth.email import send_organizer_activation_email
import random
import string
from datetime import datetime, timezone, timedelta


def random_password():
    allowed_chars = string.ascii_letters + '0123456789'
    return ''.join(random.sample(allowed_chars, 16))


@bp.route('/dashboard', methods=['GET'])
@login_required
def dashboard():
    return render_template('admin/dashboard.html')


@bp.route('/users', methods=['GET'])
@login_required
def users():
    return render_template('admin/users.html')


@bp.route('/setup', methods=['GET', 'POST'])
@login_required
def setup():
    create_form = CreateOrganizerAccountFrom()
    organizer = User.query.filter(User.access == ACCESS[ORGANIZER]).first()
    if request.method == "POST":
        if create_form.validate_on_submit():
            organizer = User()
            organizer.username = ORGANIZER
            organizer.email = create_form.email.data
            organizer.access = ACCESS[ORGANIZER]
            organizer.is_active = True
            db.session.add(organizer)
            db.session.commit()
            send_organizer_activation_email(organizer)
            flash("Organizer account created.")
            return redirect(url_for('self_admin.setup'))
    return render_template('admin/setup.html', create_form=create_form, organizer=organizer)


@bp.route('/test_data', methods=['GET', 'POST'])
@login_required
def test_data():
    test_config = {
        "organizer": User.query.filter(User.access == ACCESS[ORGANIZER]).first(),
        "promoters": 10,
        "codes": 10,
        "parties": 8
    }
    test_check = {
        "organizer": test_config["organizer"] is not None,
        "promoters": len(User.query.filter(User.access == ACCESS[PROMOTER]).all()) >= test_config["promoters"],
        "codes": len(Code.query.all()) >= test_config["codes"],
        "parties": len(Party.query.all())
    }
    if request.method == "POST":
        if "reset" in request.form:
            site_users = User.query.filter(User.access != ACCESS[ADMIN]).all()
            for u in site_users:
                db.session.delete(u)
            Ticket.query.delete()
            Purchase.query.delete()
            Code.query.delete()
            Party.query.delete()
            db.session.commit()
            flash("Test data reset.")
        if "organizer" in request.form:
            organizer = test_config["organizer"]
            if organizer is None:
                organizer = User()
                organizer.username = ORGANIZER
                organizer.email = "organizer@test.com"
                organizer.access = ACCESS[ORGANIZER]
                organizer.is_active = True
                organizer.set_password(random_password())
                db.session.add(organizer)
                db.session.commit()
                flash(f"Added {ORGANIZER} account.", "success")
            else:
                flash(f"There already is an {ORGANIZER} account.", "warning")
        if "promoters" in request.form:
            if len(User.query.filter(User.access == ACCESS[PROMOTER]).all()) < test_config["promoters"]:
                for i in range(test_config["promoters"]):
                    promoter = User()
                    promoter.username = f"{PROMOTER}{i}"
                    promoter.email = f"{PROMOTER}{i}@test.com"
                    promoter.access = ACCESS[PROMOTER]
                    promoter.is_active = True
                    promoter.set_password(random_password())
                    db.session.add(promoter)
                db.session.commit()
                flash(f"Added testing {PROMOTER} accounts.", "success")
            else:
                flash(f"The {PROMOTER} accounts for testing have already been created.", "warning")
        if "codes" in request.form:
            if len(Code.query.all()) < test_config["codes"]:
                for i in range(test_config["codes"]):
                    db.session.add(Code(code=f"1000000{i}"))
                db.session.commit()
                flash("Added testing Codes.", "success")
            else:
                flash("The testing Codes have already been created.", "warning")
        if "parties" in request.form:
            if len(Party.query.all()) < test_config["parties"]:
                for i in range(test_config["parties"]):
                    party = Party()
                    party.title = f"Party{i}"
                    start_date = datetime.now().replace(tzinfo=timezone.utc, hour=23, minute=0,
                                                        second=0, microsecond=0) + timedelta(days=3+i)
                    party.party_start_datetime = start_date
                    party.party_end_datetime = start_date + timedelta(hours=5)
                    party.num_available_tickets = 100
                    party.ticket_price = 25
                    party.status = NORMAL
                    db.session.add(party)
                db.session.commit()
                flash("Added testing Parties.", "success")
            else:
                flash("The testing Parties have already been created.", "warning")
        return redirect(url_for('self_admin.test_data'))
    return render_template('admin/test_data.html', test_check=test_check)


@bp.route('/switch_organizer', methods=['GET'])
@login_required
def switch_organizer():
    user = User.query.filter(User.access == ACCESS[ORGANIZER], User.is_active.is_(True),
                             User.password_hash.isnot(None)).first()
    if user is not None:
        logout_user()
        login_user(user)
    else:
        flash(f'{ORGANIZER} account is not available.')
    return redirect(url_for('main.index'))


@bp.route('/test_emails', methods=['GET', "POST"])
@login_required
def test_emails():
    email = {
        "activate_account": "Account activation",
        "purchased_tickets": "Confirmation of ticket purchase"
    }
    txt_preview, html_preview = None, None
    if request.method == "POST":
        if "activate_account" in request.form:
            token = current_user.get_reset_password_token(expires_in=86400)
            txt_preview = render_template('email/activate_account.txt', user=current_user, token=token)
            html_preview = render_template('email/activate_account.html', user=current_user, token=token)
        if "purchased_tickets" in request.form:
            purchase = Purchase.query.filter(Purchase.status == STATUS_PAID).first()
            if purchase is not None:
                txt_preview = render_template('email/purchased_tickets.txt', purchase=purchase)
                html_preview = render_template('email/purchased_tickets.html', purchase=purchase)
            else:
                flash(f"There are no paid purchases", "warning")
    return render_template('admin/test_emails.html', email=email, txt_preview=txt_preview, html_preview=html_preview)
