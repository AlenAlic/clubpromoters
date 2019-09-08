var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var WAIT_INTERVAL = 800;

var TicketPurchase = function (_React$Component) {
    _inherits(TicketPurchase, _React$Component);

    function TicketPurchase(props) {
        _classCallCheck(this, TicketPurchase);

        var _this = _possibleConstructorReturn(this, (TicketPurchase.__proto__ || Object.getPrototypeOf(TicketPurchase)).call(this, props));

        _this.checkEmail = function (email) {
            var correctEmail = validateEmail(email);
            _this.setState({ emailError: correctEmail ? "" : "Error" }, function () {
                _this.checkReadyToSubmit();
            });
        };

        _this.checkReadyToSubmit = function () {
            if (validateEmail(_this.state.email) && _this.state.name.replace(" ", "") !== "" && _this.state.checked) {
                _this.setState({ readyToSubmit: true });
                return true;
            }
            _this.setState({ readyToSubmit: false });
            return false;
        };

        _this.state = {
            tickets: _this.props.tickets,
            email: "",
            emailError: "",
            name: "",
            readyToSubmit: false,
            checked: false
        };
        return _this;
    }

    _createClass(TicketPurchase, [{
        key: "componentWillMount",
        value: function componentWillMount() {
            this.timer = null;
        }
    }, {
        key: "changeTicketAmount",
        value: function changeTicketAmount(input) {
            var newValue = this.state.tickets + input;
            if (newValue > 0) {
                this.setState({ tickets: newValue });
            }
        }
    }, {
        key: "updateName",
        value: function updateName(event) {
            this.setState({ name: event.target.value });
        }
    }, {
        key: "updateEmail",
        value: function updateEmail(event) {
            clearTimeout(this.timer);
            var email = event.target.value;
            this.setState({ email: email });
            if (validateEmail(email)) {
                this.checkEmail(email);
            } else {
                this.timer = setTimeout(this.checkEmail, WAIT_INTERVAL, email);
            }
        }
    }, {
        key: "updateCheckbox",
        value: function updateCheckbox(event) {
            var _this2 = this;

            var target = event.target;
            this.setState({ checked: target.checked }, function () {
                _this2.checkReadyToSubmit();
            });
        }
    }, {
        key: "render",
        value: function render() {
            var _this3 = this;

            var party = this.props.party;
            var totalPrice = this.state.tickets * party.ticket_price;

            return React.createElement(
                "div",
                { className: "purchase-order" },
                React.createElement(
                    "div",
                    { className: "card mx-3 my-3" },
                    React.createElement(
                        "div",
                        { className: "card-body text-center" },
                        React.createElement(
                            "h4",
                            { className: "card-title" },
                            "Ticket purchase"
                        ),
                        React.createElement(
                            "div",
                            { className: "left-right-split-container mt-3" },
                            React.createElement(
                                "span",
                                null,
                                "Event:"
                            ),
                            React.createElement(
                                "span",
                                null,
                                party.title
                            )
                        ),
                        React.createElement(
                            "div",
                            { className: "left-right-split-container" },
                            React.createElement("span", null),
                            React.createElement(
                                "span",
                                null,
                                party.party_date
                            )
                        ),
                        React.createElement(
                            "div",
                            { className: "left-right-split-container mb-3" },
                            React.createElement("span", null),
                            React.createElement(
                                "span",
                                null,
                                party.party_time
                            )
                        ),
                        React.createElement(
                            "form",
                            { className: "form", method: "POST", encType: "multipart/form-data", noValidate: true },
                            React.createElement(
                                "div",
                                { className: "tickets-container mb-3 unselectable" },
                                React.createElement(
                                    "span",
                                    { className: "party-title" },
                                    "Ticket(s)"
                                ),
                                React.createElement(
                                    "span",
                                    { className: "party-counter" },
                                    React.createElement("i", { className: "fas fa-minus-circle clickable", onClick: function onClick() {
                                            return _this3.changeTicketAmount(-1);
                                        } }),
                                    React.createElement("input", { className: "party-amount", id: "tickets", name: "tickets", value: this.state.tickets, onChange: function onChange() {
                                            return _this3.changeTicketAmount(0);
                                        } }),
                                    React.createElement("i", { className: "fas fa-plus-circle clickable", onClick: function onClick() {
                                            return _this3.changeTicketAmount(1);
                                        } })
                                )
                            ),
                            React.createElement(
                                "div",
                                { className: "left-right-split-container mb-3" },
                                React.createElement(
                                    "span",
                                    null,
                                    "Price per ticket:"
                                ),
                                React.createElement(
                                    "span",
                                    null,
                                    currencyFormat(party.ticket_price)
                                )
                            ),
                            React.createElement(
                                "div",
                                { className: "left-right-split-container mb-3" },
                                React.createElement(
                                    "span",
                                    null,
                                    "Total price:"
                                ),
                                React.createElement(
                                    "span",
                                    null,
                                    currencyFormat(totalPrice)
                                )
                            ),
                            React.createElement(
                                "div",
                                { className: "form-group text-left" },
                                React.createElement("input", { type: "text", name: "name", className: "form-control", placeholder: "Full name",
                                    value: this.state.name, onChange: function onChange() {
                                        return _this3.updateName(event);
                                    }, required: true }),
                                React.createElement(
                                    "small",
                                    { className: "form-text text-muted" },
                                    "Required for entry to the party."
                                )
                            ),
                            React.createElement(
                                "div",
                                { className: "form-group text-left" },
                                React.createElement("input", { type: "email", name: "email", className: classNames("form-control", { "is-invalid": this.state.emailError !== "" }, { "is-valid": this.state.emailError === "" && validateEmail(this.state.email) }),
                                    placeholder: "Email address", value: this.state.email, onChange: function onChange() {
                                        return _this3.updateEmail(event);
                                    }, required: true }),
                                this.state.emailError === "" ? React.createElement(
                                    "small",
                                    { className: "form-text text-muted" },
                                    "Your tickets will be emailed to you."
                                ) : React.createElement(
                                    "div",
                                    { className: "invalid-feedback" },
                                    "Please enter a valid email address."
                                )
                            ),
                            React.createElement("input", { type: "checkbox", className: "d-none", name: "purchase_tickets", value: "", defaultChecked: "checked" }),
                            React.createElement(
                                "div",
                                { className: "form-group form-check" },
                                React.createElement("input", { type: "checkbox", className: "form-check-input", id: "terms", value: this.state.checked, onChange: function onChange() {
                                        return _this3.updateCheckbox(event);
                                    }, style: { "marginTop": "0.5rem" } }),
                                React.createElement(
                                    "label",
                                    { className: "form-check-label", htmlFor: "terms", style: { "fontSize": "0.65rem" } },
                                    "I have read, and accept the ",
                                    React.createElement(
                                        "a",
                                        { href: "/terms", target: "_blank" },
                                        "terms and conditions"
                                    ),
                                    "."
                                )
                            ),
                            React.createElement(
                                "button",
                                { type: "submit", name: "party_id", value: party.party_id,
                                    className: classNames("btn btn-dark my-3", { "disabled": !this.state.readyToSubmit }), disabled: !this.state.readyToSubmit },
                                "Purchase ticket(s)"
                            )
                        ),
                        React.createElement(
                            "a",
                            { className: "btn btn-secondary", href: "/" },
                            "Cancel"
                        )
                    )
                )
            );
        }
    }]);

    return TicketPurchase;
}(React.Component);