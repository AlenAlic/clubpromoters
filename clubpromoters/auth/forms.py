from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField
from wtforms.validators import ValidationError, DataRequired, Email, EqualTo
import re


PASSWORD_LENGTH = 16


class CorrectPassword(object):
    """
    Validates that an input is a correct password.

    :param length:
        The minimum required length of the string.
    """
    def __init__(self, length=PASSWORD_LENGTH):
        self.length = length

    def __call__(self, form, field):
        data = field.data
        if len(data) < self.length:
            raise ValidationError(f"Password must be at least {self.length} characters long.")
        if not re.search("[a-z]", data):
            raise ValidationError(f"Password must contain at least one lowercase character.")
        if not re.search("[A-Z]", data):
            raise ValidationError(f"Password must contain at least one uppercase character")
        if not re.search("[0-9]", data):
            raise ValidationError(f"Password must contain at least one number.")


class LoginForm(FlaskForm):
    username = StringField('', validators=[DataRequired()], render_kw={"placeholder": "Username or e-mail"})
    password = PasswordField('', validators=[DataRequired()], render_kw={"placeholder": "Password"})
    remember_me = BooleanField('Remember me')
    submit = SubmitField('Sign in')


class ResetPasswordRequestForm(FlaskForm):
    email = StringField('', validators=[Email()], render_kw={"placeholder": "E-mail"})
    submit = SubmitField('Request password reset')


class ResetPasswordForm(FlaskForm):
    password = PasswordField('', validators=[DataRequired(), CorrectPassword()], render_kw={"placeholder": "Password"})
    password2 = PasswordField('', render_kw={"placeholder": "Repeat password"},
                              validators=[DataRequired(), EqualTo('password', message="Passwords must be the same.")])
    submit = SubmitField('Reset Password')
