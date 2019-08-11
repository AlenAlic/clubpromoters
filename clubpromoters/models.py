from clubpromoters import db, login, Anonymous
from flask import current_app, flash, redirect, url_for, session
from flask_login import UserMixin, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from clubpromoters.values import *
from time import time
import jwt
from datetime import datetime, timedelta
from functools import wraps
from hashlib import sha3_256
import pyqrcode


# Table names
USERS = 'users'
CONFIGURATION = 'configuration'
PARTY = 'party'
TICKET = 'ticket'
PURCHASE = 'purchase'
REFUND = 'refund'
CODE = 'code'


def requires_access_level(access_levels):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if current_user.access not in access_levels:
                flash("Page inaccessible.")
                return redirect(url_for('main.index'))
            return f(*args, **kwargs)
        return decorated_function
    return decorator


def code_required(view):
    @wraps(view)
    def wrapped_view(**kwargs):
        if "code" not in session:
            flash("Cannot enter page without a valid code.")
            return redirect(url_for('main.index'))
        return view(**kwargs)
    return wrapped_view


@login.user_loader
def load_user(user_id):
    try:
        user_id = user_id.split("-")
        return User.query.filter(User.user_id == user_id[0], User.reset_index == user_id[1]).first()
    except AttributeError:
        return None


class User(UserMixin, Anonymous, db.Model):
    __tablename__ = USERS
    user_id = db.Column(db.Integer, primary_key=True)
    reset_index = db.Column(db.Integer, nullable=False, default=0)
    username = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(128), index=True, unique=True)
    password_hash = db.Column(db.String(128))
    access = db.Column(db.Integer, index=True, nullable=False)
    is_active = db.Column(db.Boolean, index=True, nullable=False, default=False)
    last_seen = db.Column(db.DateTime, default=datetime.utcnow)
    code = db.relationship('Code', back_populates='user', uselist=False)

    def __repr__(self):
        return f'{self.username}'

    def get_id(self):
        return f"{self.user_id}-{self.reset_index}"

    def is_admin(self):
        return self.access == ACCESS[ADMIN]

    def is_organizer(self):
        return self.access == ACCESS[ORGANIZER]

    def is_club_owner(self):
        return self.access == ACCESS[CLUB_OWNER]

    def allowed(self, access_level):
        return self.access == access_level

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        if self.reset_index is not None:
            self.reset_index += 1
        db.session.commit()

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def get_reset_password_token(self, expires_in=600):
        return jwt.encode({'reset_password': self.user_id, 'exp': time() + expires_in},
                          current_app.config['SECRET_KEY'], algorithm='HS256').decode('utf-8')

    @staticmethod
    def verify_reset_password_token(token):
        try:
            user_id = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])['reset_password']
        except jwt.exceptions.InvalidTokenError:
            return 'error'
        return User.query.get(user_id)


class Configuration(db.Model):
    __tablename__ = CONFIGURATION
    lock_id = db.Column(db.Integer, primary_key=True)
    mollie_api_key = db.Column(db.String(128))


class Party(db.Model):
    __tablename__ = PARTY
    party_id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(128), index=True, nullable=False)
    is_active = db.Column(db.Boolean, index=True, nullable=False, default=False)
    party_start_datetime = db.Column(db.DateTime, default=datetime.utcnow())
    party_end_datetime = db.Column(db.DateTime, default=datetime.utcnow() + timedelta(hours=4))
    status = db.Column(db.String(128), index=True, nullable=False, default=NORMAL)
    num_available_tickets = db.Column(db.Integer, nullable=False, default=0)
    ticket_price = db.Column(db.Integer, nullable=False, default=0)
    purchases = db.relationship('Purchase', back_populates='party', cascade='all, delete-orphan')

    def __repr__(self):
        return f"{self.title}"

    def tickets_with_status(self, status=""):
        return sum([len([t for t in p.tickets]) for p in self.purchases if p.status == status])

    def sold_tickets(self):
        return self.tickets_with_status(STATUS_PAID)

    def tickets_on_hold(self):
        return self.tickets_with_status(STATUS_PENDING) + self.tickets_with_status(STATUS_OPEN)

    def remaining_tickets(self):
        return self.num_available_tickets - self.sold_tickets()

    def party_date(self):
        return self.party_start_datetime.strftime("%d %B, %Y")

    def party_time(self):
        return f'{self.party_start_datetime.strftime("%H:%M")}-{self.party_end_datetime.strftime("%H:%M")}'

    def json(self):
        return {
            "party_id": self.party_id,
            "title": self.title,
            "ticket_price": self.ticket_price,
            'party_date': self.party_date(),
            'party_time': self.party_time()
        }

    def purchases_with_status(self, status=""):
        return [p for p in self.purchases if p.status == status]

    def paid_purchases(self):
        return self.purchases_with_status(STATUS_PAID)

    def party_income(self):
        return sum([p.price for p in self.paid_purchases()])


class Ticket(db.Model):
    __tablename__ = TICKET
    ticket_id = db.Column(db.Integer, primary_key=True)
    used = db.Column(db.Boolean, index=True, nullable=False, default=False)
    purchase_id = db.Column(db.Integer, db.ForeignKey(f"{PURCHASE}.purchase_id"))
    purchase = db.relationship('Purchase', back_populates='tickets', cascade='all, delete-orphan', single_parent=True)


class Purchase(db.Model):
    __tablename__ = PURCHASE
    purchase_id = db.Column(db.Integer, primary_key=True)
    price = db.Column(db.Integer, nullable=False, default=0)
    status = db.Column(db.String(128), nullable=False, default=STATUS_OPEN)
    name = db.Column(db.String(128), nullable=False)
    email = db.Column(db.String(128), index=True, nullable=False)
    hash = db.Column(db.String(160), nullable=False, default="")
    mollie_payment_id = db.Column(db.String(128), nullable=False, default="")
    purchase_datetime = db.Column(db.DateTime, default=datetime.utcnow())
    party_id = db.Column(db.Integer, db.ForeignKey(f"{PARTY}.party_id"))
    party = db.relationship('Party', back_populates='purchases', single_parent=True)
    tickets = db.relationship('Ticket', back_populates='purchase', cascade='all, delete-orphan')
    refunds = db.relationship('Refund', back_populates='purchase', cascade='all, delete-orphan')
    code_id = db.Column(db.Integer, db.ForeignKey(f"{CODE}.code_id"))
    code = db.relationship('Code', back_populates='purchases')

    def __repr__(self):
        return f"Purchase {self.purchase_id} - Party: {self.party} - Tickets: {len(self.tickets)}"

    def mollie_description(self):
        return f"{self.purchase_id} - {len(self.tickets)} tickets to {self.party}"

    def mollie_price(self):
        return '{:,.2f}'.format(self.price)

    def calculate_hash(self, add_date=False):
        purchase_hash = f"Purchase {self.purchase_id} - Party: {self.party} - Email: {self.email} - " \
            f"{current_app.config.get('SECRET_KEY')}{datetime.utcnow() if add_date else ''}"
        return sha3_256(purchase_hash.encode()).hexdigest()

    def purchase_paid(self):
        self.status = STATUS_PAID

    def purchase_pending(self):
        self.status = STATUS_PENDING

    def cancel_purchase(self):
        self.status = STATUS_CANCELED

    def first_name(self):
        return self.name.split(" ")[0]

    def qr_code(self):
        url = pyqrcode.create(self.hash)
        return url.png_as_base64_str(scale=6)

    def entrance_code(self):
        return f"{ self.name }-{ self.purchase_id }"


class Refund(db.Model):
    __tablename__ = REFUND
    refund_id = db.Column(db.Integer, primary_key=True)
    price = db.Column(db.Integer, nullable=False, default=0)
    refund_datetime = db.Column(db.DateTime, default=datetime.utcnow)
    purchase_id = db.Column(db.Integer, db.ForeignKey(f"{PURCHASE}.purchase_id"))
    purchase = db.relationship('Purchase', back_populates='refunds', cascade='all, delete-orphan', single_parent=True)
    mollie_refund_id = db.Column(db.String(128), nullable=False)


class Code(db.Model):
    __tablename__ = CODE
    code_id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(8), nullable=False)
    active = db.Column(db.Boolean, nullable=False, default=True)
    user_id = db.Column(db.Integer, db.ForeignKey(f"{USERS}.user_id"))
    user = db.relationship('User', back_populates='code', single_parent=True)
    purchases = db.relationship('Purchase', back_populates='code')

    def __repr__(self):
        return self.code

    def promoter(self):
        if self.user is None:
            return "-"
        return self.user

    def deactivate(self):
        self.active = False
        self.user = None
