from flask import render_template, redirect, url_for, flash, request
from flask_login import current_user
from clubpromoters import db
from clubpromoters.auth import bp
from clubpromoters.auth.forms import ResetPasswordRequestForm, ResetPasswordForm
from clubpromoters.models import User
from clubpromoters.auth.email import send_password_reset_email


@bp.route('/reset_password_request', methods=['GET', 'POST'])
def reset_password_request():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    form = ResetPasswordRequestForm()
    if request.method == "POST":
        if form.validate_on_submit():
            user = User.query.filter(User.email==form.email.data).first()
            if user is not None:
                send_password_reset_email(user)
                flash('Check your email for the instructions to reset your password.')
            else:
                flash("This e-mail address is not registered here.")
            return redirect(url_for('main.index'))
    return render_template('auth/reset_password_request.html', title='Reset Password', form=form)


@bp.route('/reset_password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    user = User.verify_reset_password_token(token)
    if not user:
        return redirect(url_for('main.index'))
    if user == 'error':
        flash('Not a valid token.', 'danger')
        return redirect(url_for('main.index'))
    form = ResetPasswordForm()
    if request.method == "POST":
        if form.validate_on_submit():
            user.set_password(form.password.data)
            db.session.commit()
            flash('Your password has been reset.', 'success')
            return redirect(url_for('main.index'))
    return render_template('auth/reset_password.html', form=form, user=user)


@bp.route('/activate_account/<token>', methods=['GET', 'POST'])
def activate_account(token):
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    user = User.verify_reset_password_token(token)
    if not user:
        return redirect(url_for('main.index'))
    if user == 'error':
        flash('Not a valid token.', 'danger')
        return redirect(url_for('main.index'))
    form = ResetPasswordForm()
    form.submit.label.text = "Set password"
    if request.method == "POST":
        if form.validate_on_submit():
            user.set_password(form.password.data)
            db.session.commit()
            flash('Your password has been set.', 'success')
            return redirect(url_for('main.login'))
    return render_template('auth/activate_account.html', form=form, user=user)
