from flask import render_template, redirect, url_for, request, flash, g, session
from flask_login import current_user, login_user, logout_user, login_required
from clubpromoters.purchases import bp
from clubpromoters import db
from clubpromoters.models import code_required, Party, Ticket, Purchase, Code
from mollie.api.client import Client
from mollie.api.error import Error
from clubpromoters.purchases.email import send_purchased_tickets


@bp.route('/', methods=['GET', "POST"])
@bp.route('/index', methods=['GET', "POST"])
def index():
    if len(g.active_parties) == 0:
        return redirect(url_for('main.index'))
    return render_template('purchases/index.html')


@bp.route('/order', methods=['POST'])
@code_required
def order():
    if "party_id" in request.form and "tickets" in request.form:
        party = Party.query.filter(Party.party_id == request.form["party_id"]).first()
        tickets = int(request.form["tickets"])
        if party is not None:
            if party.num_available_tickets >= int(request.form["tickets"]):
                if "purchase_tickets" in request.form:
                    print(request.form)
                    purchase = Purchase(party=party, price=party.ticket_price * tickets,
                                        email=request.form["email"], name=request.form["name"],
                                        code=Code.query.filter(Code.code == session["code"]).first())
                    for _ in range(int(request.form["tickets"])):
                        purchase.tickets.append(Ticket())
                    db.session.add(purchase)
                    db.session.flush()
                    purchase_hash = purchase.calculate_hash()
                    while Purchase.query.filter(Purchase.hash == purchase_hash).first() is not None:
                        purchase_hash = purchase.calculate_hash(add_date=True)
                    purchase.hash = purchase.calculate_hash()
                    mollie_client = Client()
                    mollie_client.set_api_key(g.mollie)
                    payment = mollie_client.payments.create({
                        'amount': {
                            'currency': 'EUR',
                            'value': purchase.mollie_price()
                        },
                        'description': f'{purchase.mollie_description()}',
                        'webhookUrl': url_for('purchases.mollie_webhook', _external=True),
                        'redirectUrl': url_for('purchases.completed', purchase_hash=purchase.hash, _external=True),
                        'metadata': {
                            'purchase_id': str(purchase.purchase_id),
                        }
                    })
                    purchase.mollie_payment_id = payment.id
                    db.session.commit()
                    return redirect(payment.checkout_url)
                else:
                    return render_template('purchases/order.html', tickets=tickets, party=party)
            else:
                flash(f"There are only {party.num_available_tickets} tickets left, cannot "
                      f"order {request.form['tickets']}.", "warning")
    return redirect(url_for('purchases.index'))


@bp.route('/mollie_webhook', methods=['POST'])
def mollie_webhook():
    try:
        mollie_client = Client()
        mollie_client.set_api_key(g.mollie)
        if 'id' not in request.form:
            flask.abort(404, 'Unknown payment id')
        payment_id = request.form['id']
        payment = mollie_client.payments.get(payment_id)
        purchase = Purchase.query.filter(Purchase.purchase_id == payment.metadata["purchase_id"]).first()
        if purchase is not None:
            if payment.is_paid():
                # At this point you'd probably want to start the process of delivering the product to the customer.
                purchase.purchase_paid()
                db.session.commit()
                send_purchased_tickets(purchase)
                return 'Paid'
            elif payment.is_pending():
                # The payment has started but is not complete yet.
                purchase.purchase_pending()
                db.session.commit()
                return 'Pending'
            elif payment.is_open():
                # The payment has not started yet. Wait for it.
                return 'Open'
            else:
                # The payment has been unsuccessful.
                purchase.cancel_purchase()
                db.session.commit()
                return 'Cancelled'
        return "No purchase found"
    except Error as e:
        return 'Mollie Webhook call failed: {error}'.format(error=e)


@bp.route('/completed/<purchase_hash>', methods=['GET'])
def completed(purchase_hash=None):
    if purchase_hash is None:
        flask.abort(404, 'Unknown purchase')
    purchase = Purchase.query.filter(Purchase.hash == purchase_hash).first()
    if purchase is not None:
        return render_template('purchases/completed.html', purchase=purchase)
    return redirect(url_for('purchases.failed'))


@bp.route('/failed', methods=['GET'])
def failed():
    return render_template('purchases/failed.html')


@bp.route('/qr_code/<purchase_hash>', methods=['GET'])
def qr_code(purchase_hash=None):
    if purchase_hash is None:
        flask.abort(404, 'Unknown purchase')
    purchase = Purchase.query.filter(Purchase.hash == purchase_hash).first()
    if purchase is not None:
        return render_template('purchases/completed.html', purchase=purchase)
    return redirect(url_for('purchases.failed'))


# payment = {
#     'amount': {
#         'currency': 'EUR',
#         'value': '120.00'
#     },
#     'description': 'My first API payment',
#     'webhookUrl': '{root}02-webhook-verification'.format(root=flask.request.url_root),
#     'redirectUrl': '{root}03-return-page?my_webshop_id={id}'.format(root=flask.request.url_root,
#                                                                     id=my_webshop_id),
#     'locale': 'optional',
#     'method': ['optional'],
#     'metadata': {
#         'my_webshop_id': str(my_webshop_id)
#     }
# }