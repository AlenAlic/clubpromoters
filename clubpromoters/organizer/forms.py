from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, RadioField, DateTimeField, IntegerField, SelectField, FileField
from wtforms.validators import Email, DataRequired, InputRequired, ValidationError, NumberRange
from clubpromoters.values import NEW_ACCOUNTS_ORGANIZER, CLUB_OWNER, PROMOTER, HOSTESS, ACCESS
from flask import request
from datetime import datetime, timezone, timedelta
from clubpromoters.models import User


class OptionalEmail(Email):
    """
    Validates an email address. Note that this uses a very primitive regular
    expression and should only be used in instances where you later verify by
    other means, such as email activation or lookups.
    """

    def __call__(self, form, field):
        value = field.data

        if value.strip(" ") != '':
            message = self.message
            if message is None:
                message = field.gettext('Invalid email address.')

            if not value or '@' not in value:
                raise ValidationError(message)

            user_part, domain_part = value.rsplit('@', 1)

            if not self.user_regex.match(user_part):
                raise ValidationError(message)

            if not self.validate_hostname(domain_part):
                raise ValidationError(message)


class CreateNewAccountFrom(FlaskForm):
    username = StringField('', validators=[DataRequired()], render_kw={"placeholder": "Username"},
                           description="The company name, without spaces or any weird marks would be good.")
    email = StringField('', validators=[Email()], render_kw={"placeholder": "E-mail address"},
                        description="This will send an email with a link to complete the login process.")
    hostess_email = StringField('', validators=[OptionalEmail()], render_kw={"placeholder": "Hostess e-mail address"},
                                description=f"The {HOSTESS} Username will be the same as the {CLUB_OWNER}, but with "
                                f"{HOSTESS} appended to it.")
    type = RadioField('Account type', coerce=int, choices=NEW_ACCOUNTS_ORGANIZER,
                      description=f"If you create a {CLUB_OWNER} account, an account will automatically be created for "
                      f"the {HOSTESS} as well.",
                      validators=[InputRequired(f"Choose whether you with to create a new {CLUB_OWNER} account, "
                                                f"or a new {PROMOTER} account.")])
    submit = SubmitField('Create new account')


class CreateNewPartyFrom(FlaskForm):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if request.method == "GET":
            self.party_start_datetime.data = datetime.now()\
                .replace(tzinfo=timezone.utc, hour=23, minute=0, second=0, microsecond=0)
            self.party_end_datetime.data = datetime.now()\
                .replace(tzinfo=timezone.utc, hour=4, minute=0, second=0, microsecond=0) + timedelta(days=1)

    title = StringField('Party title')
    party_start_datetime = DateTimeField('Party start', format="%Y-%m-%dT%H:%M")
    party_end_datetime = DateTimeField('Party end', format="%Y-%m-%dT%H:%M")
    num_available_tickets = IntegerField('Tickets', render_kw={"type": "number", "min": 0, "step": 1},
                                         description="Number of tickers that are required")
    ticket_price = IntegerField('Ticket price',
                                render_kw={"type": "number", "min": 0, "step": 0.01, "placeholder": "x.xx"})
    submit = SubmitField('Create new party')


class AddNewCodesFrom(FlaskForm):
    number_of_codes = IntegerField('Number of codes', default=1,
                                   render_kw={"type": "number", "min": 0, "max": 100, "step": 1})
    submit = SubmitField('Add new codes')


class AssignCodeForm(FlaskForm):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.promoter.choices = [(0, "Select a Promoter")] + \
            [(u.user_id, u.username) for u in
             User.query.filter(User.access == ACCESS[PROMOTER], User.is_active.is_(True)).all() if u.code is None]

    promoter = SelectField('Promoter', validators=[NumberRange(1)], coerce=int)
    code = StringField("Code", validators=[DataRequired()], render_kw={"hidden": True})
    submit_assign_code = SubmitField('Assign Code')
