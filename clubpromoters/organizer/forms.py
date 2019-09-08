from flask import g
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, IntegerField, SelectField, FileField, FloatField
from wtforms.widgets import HiddenInput
from wtforms.validators import Email, DataRequired, ValidationError, NumberRange
from clubpromoters.values import NEW_ACCOUNTS_ORGANIZER, CLUB_OWNER, PROMOTER, HOSTESS, ACCESS, IMAGE, LOGO
from flask import request
from datetime import datetime, timezone, timedelta
from clubpromoters.models import User, Code, File
from flask_admin.form.fields import DateTimeField


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
    email = StringField('', validators=[Email()], render_kw={"placeholder": "E-mail address"},
                        description="This will send an email with a link to complete the login process.")
    type = IntegerField('Account type', validators=[DataRequired()], widget=HiddenInput())
    submit = SubmitField('Create new account')


class CreateNewClubOwnerAccountFrom(CreateNewAccountFrom):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.type.data = ACCESS[CLUB_OWNER]

    username = StringField('', validators=[DataRequired()], render_kw={"placeholder": "Company name"})


class CreateNewPromoterAccountFrom(CreateNewAccountFrom):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.type.data = ACCESS[PROMOTER]
        self.code.choices = [(0, "Select a Code")] + \
                            [(c.code_id, c) for c in Code.query.filter(Code.active.is_(True),
                                                                       Code.user_id.is_(None)).all()]

    username = StringField('', validators=[DataRequired()], render_kw={"placeholder": "Name"})
    code = SelectField('Code', validators=[NumberRange(min=1, message="Please select a code.")], coerce=int)


class CreateNewHostessAccountFrom(CreateNewAccountFrom):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.type.data = ACCESS[HOSTESS]


class UploadImagesForm(FlaskForm):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.club_owner.choices = [(0, f"Select a {CLUB_OWNER}")] + \
                                  [(u.user_id, u.username) for u in
                                   User.query.filter(User.access == ACCESS[CLUB_OWNER], User.is_active.is_(True)).all()]

    logo = FileField("Logo")
    image = FileField("Image")
    club_owner = SelectField('', validators=[NumberRange(min=1, message=f"Please select a {CLUB_OWNER}.")], coerce=int)
    submit = SubmitField('Upload')


class CreateNewPartyFrom(FlaskForm):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if request.method == "GET":
            self.party_start_datetime.data = datetime.now()\
                .replace(tzinfo=timezone.utc, hour=23, minute=0, second=0, microsecond=0)
            self.party_end_datetime.data = datetime.now()\
                .replace(tzinfo=timezone.utc, hour=4, minute=0, second=0, microsecond=0) + timedelta(days=1)
            self.club_owner_commission.data = g.config.default_club_owner_commission
        self.club_owner.choices = [(0, f"Select a {CLUB_OWNER}")] + \
                                  [(u.user_id, u.username) for u in
                                   User.query.filter(User.access == ACCESS[CLUB_OWNER], User.is_active.is_(True)).all()
                                   if u.code is None]

    club_owner = SelectField('', validators=[NumberRange(1)], coerce=int)

    title = StringField('', validators=[DataRequired("A title for the party is required.")],
                        render_kw={"placeholder": "Party title"})
    party_start_datetime = DateTimeField('Party start')
    party_end_datetime = DateTimeField('Party end')
    num_available_tickets = IntegerField('', render_kw={"type": "number", "min": 0, "step": 1,
                                                        "placeholder": "Number of tickets"})
    club_owner_commission = IntegerField('', render_kw={"type": "number", "min": 0, "step": 1,
                                                        "placeholder": "Club owner commission"})
    ticket_price = FloatField('', render_kw={"type": "number", "min": 0, "step": 0.01, "placeholder": "Ticket price"})
    logo = FileField("Logo", validators=[DataRequired()])
    image = FileField("Image", validators=[DataRequired()])
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
