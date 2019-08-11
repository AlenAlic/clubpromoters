from flask import Flask, g, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager, AnonymousUserMixin, current_user
from flask_mail import Mail
from flask_admin import Admin, AdminIndexView, expose
from flask_admin.contrib.sqla import ModelView
from wtforms import PasswordField
import clubpromoters.values as values
from datetime import datetime


class MyAdminIndexView(AdminIndexView):
    @expose('/')
    def index(self):
        if current_user.is_admin() or current_user.is_tournament_office_manager():
            return self.render(self._template)
        else:
            return redirect(url_for('main.index'))


db = SQLAlchemy()
migrate = Migrate()
login = LoginManager()
mail = Mail()
admin = Admin(template_mode='bootstrap3', index_view=MyAdminIndexView())


class BaseView(ModelView):
    column_hide_backrefs = False
    page_size = 1000

    def is_accessible(self):
        return current_user.is_admin()

    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for('main.index'))


class UserView(BaseView):
    column_exclude_list = ['password_hash', ]
    form_excluded_columns = ['password_hash', ]
    form_extra_fields = {'password2': PasswordField('Password')}

    # noinspection PyPep8Naming
    def on_model_change(self, form, User, is_created):
        if form.password2.data != '':
            User.set_password(form.password2.data)


class Anonymous(AnonymousUserMixin):

    @staticmethod
    def is_admin():
        return False

    @staticmethod
    def is_organizer():
        return False

    @staticmethod
    def is_club_owner(self):
        return False


def create_app():
    """
    Create instance of website.
    """
    from clubpromoters.models import User, Configuration, Party, Ticket, Purchase, Refund, Code
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object('config')
    app.config.from_pyfile('config.py')
    app.url_map.strict_slashes = False

    db.init_app(app)
    migrate.init_app(app, db, render_as_batch=app.config['SQLALCHEMY_DATABASE_URI'].startswith('sqlite:'))
    login.init_app(app)
    login.login_view = 'main.login'
    login.anonymous_user = Anonymous
    mail.init_app(app)
    admin.init_app(app)
    admin.add_view(UserView(User, db.session))
    admin.add_view(BaseView(Configuration, db.session))
    admin.add_view(BaseView(Party, db.session))
    admin.add_view(BaseView(Ticket, db.session))
    admin.add_view(BaseView(Purchase, db.session))
    admin.add_view(BaseView(Refund, db.session))
    admin.add_view(BaseView(Code, db.session))

    @app.before_request
    def before_request_callback():
        g.values = values
        if current_user.is_authenticated:
            current_user.last_seen = datetime.utcnow()
            db.session.commit()
        g.inactive_parties = Party.query.filter(Party.is_active.is_(False)).all()
        g.active_parties = Party.query.filter(Party.is_active.is_(True),
                                              Party.party_end_datetime > datetime.utcnow()).all()
        mollie = Configuration.query.first()
        g.mollie = mollie.mollie_api_key if mollie is not None else None

    @app.context_processor
    def inject_now():
        return {'now': f"?{int(datetime.utcnow().timestamp())}"}

    @app.shell_context_processor
    def make_shell_context():
        return {'create_admin': create_admin}

    def create_admin(email, password):
        if len(User.query.filter(User.access == values.ACCESS[values.ADMIN]).all()) == 0:
            a = User()
            a.username = 'admin'
            a.email = email
            a.set_password(password)
            a.access = values.ACCESS[values.ADMIN]
            a.is_active = True
            db.session.add(a)
            conf = Configuration()
            if app.config.get("MOLLIE_API_KEY") is not None:
                conf.mollie_api_key = app.config.get("MOLLIE_API_KEY")
            db.session.add(conf)
            db.session.commit()

    from clubpromoters.main import bp as main_bp
    app.register_blueprint(main_bp)

    from clubpromoters.auth import bp as auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')

    from clubpromoters.admin import bp as admin_bp
    app.register_blueprint(admin_bp, url_prefix='/administration')

    from clubpromoters.organizer import bp as organizer_bp
    app.register_blueprint(organizer_bp, url_prefix='/organizer')

    from clubpromoters.purchases import bp as purchases_bp
    app.register_blueprint(purchases_bp, url_prefix='/purchases')

    return app


# noinspection PyPep8
from clubpromoters import models
