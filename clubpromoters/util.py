from flask import g, current_app, flash
from clubpromoters import db
import os
from werkzeug.utils import secure_filename
from clubpromoters.values import UPLOAD_FOLDER
from clubpromoters.models import File
from time import time
from datetime import datetime


def file_extension(filename):
    return filename.rsplit('.', 1)[1].lower()


def allowed_file(filename):
    return '.' in filename and file_extension(filename) in g.config.allowed_file_types()


def upload_file(file, club_owner, file_type):
    if file.filename != "" and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        directory = os.path.join(current_app.static_folder, UPLOAD_FOLDER, club_owner.username)
        path = os.path.join(directory, f"{time()}.{file_extension(filename)}")
        if File.query.filter(File.path == path).first() is not None:
            flash(f"Could not upload file {filename} ({file_type}). Please try again")
            return None
        if not os.path.exists(directory):
            os.makedirs(directory)
        file.save(path)
        db_file = File()
        db_file.user = club_owner
        db_file.type = file_type
        db_file.name = filename
        db_file.path = path
        db.session.add(db_file)
        db.session.commit()
        flash(f"File uploaded {filename} ({file_type}).")
        return db_file
    return None


def last_month_datetime(year, month):
    last_month = datetime(year, month, 1)
    previous_month = last_month.month - 1 or 12
    if previous_month == 1:
        last_month.replace(year=last_month.year - 1)
    return last_month
