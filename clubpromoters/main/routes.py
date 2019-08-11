from flask import render_template, redirect, url_for, request, flash, session, g
from flask_login import current_user, login_user, logout_user, login_required
from clubpromoters.main import bp
from clubpromoters.auth.forms import LoginForm
from clubpromoters.models import User, Code
from sqlalchemy import or_


@bp.route('/', methods=['GET', "POST"])
@bp.route('/index', methods=['GET', "POST"])
def index():
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
    if request.method == "POST":
        code = Code.query.filter(Code.active.is_(True), Code.code == request.form["code"]).first()
        if code is not None:
            session["code"] = code.code
            return redirect(url_for('purchases.index'))
        else:
            flash("Code invalid.", "warning")
            return redirect(url_for('main.index'))
    if "code" in session and len(g.active_parties) > 0:
        code = Code.query.filter(Code.active.is_(True), Code.code == session["code"]).first()
        if code is not None:
            return redirect(url_for("purchases.index"))
    return render_template('index.html')


@bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
    login_form = LoginForm()
    if request.method == "POST":
        if login_form.validate_on_submit():
            user = User.query.filter(or_(User.username == login_form.username.data,
                                         User.email == login_form.username.data)).first()
            if user is None or not user.check_password(login_form.password.data):
                flash('Invalid username or password')
            elif user.is_active:
                login_user(user, remember=login_form.remember_me.data)
                return redirect(url_for('main.dashboard'))
            else:
                flash("This account is inactive. If you believe this to be an error, please contact the site admin.")
                return redirect(url_for('main.index'))
    return render_template('login.html', login_form=login_form)


@bp.route('/logout', methods=['GET'])
@login_required
def logout():
    logout_user()
    return redirect(url_for('main.login'))


@bp.route('/dashboard', methods=['GET'])
@login_required
def dashboard():
    if current_user.is_admin():
        return redirect(url_for('self_admin.dashboard'))
    return render_template('dashboard.html')
