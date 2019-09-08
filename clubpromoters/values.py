# Environments
DEVELOPMENT_ENV = 'development'
DEBUG_ENV = 'debug'
TESTING_ENV = 'testing'
PRODUCTION_ENV = 'production'
TESTING_ENVIRONMENTS = [DEVELOPMENT_ENV, TESTING_ENV, DEBUG_ENV]

# Access levels
ADMIN = 'Admin'
ORGANIZER = 'Organizer'
CLUB_OWNER = 'Club Owner'
HOSTESS = 'Hostess'
PROMOTER = 'Promoter'

ACCESS = {
    ADMIN: 0,
    ORGANIZER: 10,
    CLUB_OWNER: 20,
    HOSTESS: 21,
    PROMOTER: 30,
}
ACCESS_LEVEL = {v: k for k, v in ACCESS.items()}
NEW_ACCOUNTS_ORGANIZER = [(ACCESS[a], a) for a in [CLUB_OWNER, PROMOTER]]

NO = 'No'
YES = 'Yes'
TF = {True: YES, False: NO}


def hostess_name(name):
    return f"{name}{HOSTESS}"


def format_euro(price):
    if price > 0:
        return '€{:,.2f}'.format(price)
    return '€0,00'


NORMAL = "Normal"

STATUS_OPEN = 'open'
STATUS_PENDING = 'pending'
STATUS_CANCELED = 'canceled'
STATUS_EXPIRED = 'expired'
STATUS_FAILED = 'failed'
STATUS_PAID = 'paid'
STATUS_AUTHORIZED = 'authorized'
HOLD_STATUS = [STATUS_PAID, STATUS_OPEN, STATUS_PENDING, STATUS_AUTHORIZED]

PLACEHOLDER_URL = "/static/placeholder.png"
UPLOAD_FOLDER = 'uploads'
IMAGE = 'image'
LOGO = 'logo'
