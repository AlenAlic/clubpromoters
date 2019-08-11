from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField
from wtforms.validators import Email, ValidationError
from clubpromoters.models import User


class UniqueEmail(object):
    """
        Validates that an e-mail address is unique in the database.
        """

    def __call__(self, form, field):
        user_list = User.query.all()
        email_list = [user.email.lower() for user in user_list]
        if field.data.lower() in email_list:
            raise ValidationError(field.gettext("A user with this e-mail address is already registered."))


class CreateOrganizerAccountFrom(FlaskForm):
    email = StringField('', validators=[Email(), UniqueEmail()], render_kw={"placeholder": "E-mail address"},
                        description="This will send an email with a link to complete the login process.")
    submit = SubmitField('Create Organizer account')
