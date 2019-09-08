var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PurchaseRefund = function (_React$Component) {
    _inherits(PurchaseRefund, _React$Component);

    function PurchaseRefund(props) {
        _classCallCheck(this, PurchaseRefund);

        var _this = _possibleConstructorReturn(this, (PurchaseRefund.__proto__ || Object.getPrototypeOf(PurchaseRefund)).call(this, props));

        _this.yearChange = function (event) {
            var year = event.target.value;
            _this.setState({ year: year });
            _this.getPurchases(year, _this.state.month);
        };

        _this.monthChange = function (event) {
            var month = event.target.value;
            _this.setState({ month: month });
            _this.getPurchases(_this.state.year, month);
        };

        _this.filterName = function (event) {
            _this.setState({ name: event.target.value });
        };

        _this.filterEmail = function (event) {
            _this.setState({ email: event.target.value });
        };

        _this.filterEntranceCode = function (event) {
            _this.setState({ entrance_code: String(event.target.value) });
        };

        _this.showModal = function (p) {
            _this.setState({ modalPurchase: p });
        };

        _this.closeModal = function (p) {
            _this.setState({ modalPurchase: undefined, refundAmount: "", refundCheckbox: false, processingRefund: undefined });
        };

        _this.giveRefund = function (id) {
            _this.setState({ processingRefund: _this.state.modalPurchase.purchase_id });
            fetch("/organizer/refund", { method: "POST", credentials: 'same-origin',
                body: JSON.stringify({ purchase_id: _this.state.modalPurchase.purchase_id, amount: _this.state.refundAmount }) }).then(function (response) {
                return response.json();
            }).then(function (result) {
                $.notify({ message: "Refund given for purchase " + _this.state.modalPurchase.purchase_id }, { type: 'alert-info' });
                _this.closeModal();
                $("#" + id).modal('hide');
                _this.getPurchases(_this.state.year, _this.state.month);
            }).catch(function (error) {
                _this.setState({ processingRefund: undefined });
                console.log('Error: \n', error);
            });
        };

        _this.handleRefundAmount = function (event) {
            _this.setState({ refundAmount: event.target.value });
        };

        _this.handleRefundCheckbox = function (event) {
            var target = event.target;
            var value = target.type === 'checkbox' ? target.checked : target.value;
            _this.setState({ refundCheckbox: value });
        };

        _this.state = {
            year: _this.props.year,
            month: _this.props.month,
            min_year: _this.props.min_year,
            purchases: [],
            loading: true,
            name: "",
            email: "",
            entrance_code: "",
            modalPurchase: undefined,
            refundAmount: "",
            refundCheckbox: false,
            processingRefund: undefined
        };
        return _this;
    }

    _createClass(PurchaseRefund, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            this.getPurchases(this.props.year, this.props.month);
        }
    }, {
        key: "getPurchases",
        value: function getPurchases(year, month) {
            var _this2 = this;

            fetch("/organizer/purchases/" + year + "/" + month, { method: "GET", credentials: 'same-origin' }).then(function (response) {
                return response.json();
            }).then(function (result) {
                _this2.setState({ purchases: result, loading: false });
            }).catch(function (error) {
                console.log('Error: \n', error);
            });
        }
    }, {
        key: "render",
        value: function render() {
            var _this3 = this;

            var yearArray = Array.from({ length: this.state.min_year - this.state.year + 1 }, function (v, k) {
                return k + _this3.state.min_year;
            });
            var purchases = this.state.purchases;
            var filteredPurchases = purchases.filter(function (p) {
                return p.email.includes(_this3.state.email) && p.name.includes(_this3.state.name) && p.entrance_code.includes(_this3.state.entrance_code);
            });

            return React.createElement(
                React.Fragment,
                null,
                React.createElement(
                    "div",
                    { className: "form-row" },
                    React.createElement(
                        "div",
                        { className: "col-6" },
                        React.createElement(
                            "div",
                            { className: "form-group" },
                            React.createElement(
                                "select",
                                { className: "form-control", id: "year", value: this.state.year, onChange: this.yearChange },
                                yearArray.map(function (y) {
                                    return React.createElement(
                                        "option",
                                        { key: y, value: y },
                                        y
                                    );
                                })
                            )
                        )
                    ),
                    React.createElement(
                        "div",
                        { className: "col-6" },
                        React.createElement(
                            "div",
                            { className: "form-group" },
                            React.createElement(
                                "select",
                                { className: "form-control", id: "month", value: this.state.month, onChange: this.monthChange },
                                Object.keys(MONTHS).map(function (y) {
                                    return React.createElement(
                                        "option",
                                        { key: y, value: y },
                                        MONTHS[y]
                                    );
                                })
                            )
                        )
                    )
                ),
                React.createElement(
                    "h2",
                    { className: "text-center" },
                    "Purchases in ",
                    MONTHS[this.state.month],
                    " ",
                    !this.state.loading && React.createElement(
                        "span",
                        { className: "badge badge-pill badge-primary" },
                        filteredPurchases.length
                    )
                ),
                this.state.loading ? React.createElement(
                    "div",
                    { className: "d-flex justify-content-center mb-4" },
                    React.createElement(Bubble, null)
                ) : React.createElement(
                    "div",
                    null,
                    React.createElement(
                        "div",
                        { className: "d-grid grid-column-gap-2 grid-row-gap-2 grid-template-columns-md-3 mb-2" },
                        React.createElement(
                            "div",
                            { className: "input-group" },
                            React.createElement(
                                "div",
                                { className: "input-group-prepend" },
                                React.createElement(
                                    "span",
                                    { className: "input-group-text" },
                                    "Name"
                                )
                            ),
                            React.createElement("input", { type: "text", className: "form-control" })
                        ),
                        React.createElement(
                            "div",
                            { className: "input-group" },
                            React.createElement(
                                "div",
                                { className: "input-group-prepend" },
                                React.createElement(
                                    "span",
                                    { className: "input-group-text" },
                                    "Email"
                                )
                            ),
                            React.createElement("input", { type: "text", className: "form-control", value: this.state.email, onChange: this.filterEmail })
                        ),
                        React.createElement(
                            "div",
                            { className: "input-group" },
                            React.createElement(
                                "div",
                                { className: "input-group-prepend" },
                                React.createElement(
                                    "span",
                                    { className: "input-group-text" },
                                    "Code"
                                )
                            ),
                            React.createElement("input", { type: "text", className: "form-control", value: this.state.entrance_code, onChange: this.filterEntranceCode })
                        )
                    ),
                    React.createElement(
                        "div",
                        { className: "d-grid grid-template-columns-md-2 grid-template-columns-xl-4 grid-column-gap-3 grid-row-gap-3" },
                        filteredPurchases.map(function (p) {
                            return React.createElement(
                                "div",
                                { key: p.purchase_id },
                                React.createElement(
                                    "div",
                                    { className: "card" },
                                    React.createElement(
                                        "div",
                                        { className: "card-body" },
                                        React.createElement(
                                            "h4",
                                            { className: "card-title text-center" },
                                            "Purchase ",
                                            p.purchase_id
                                        ),
                                        React.createElement(
                                            "div",
                                            { className: "d-flex justify-content-between" },
                                            React.createElement(
                                                "span",
                                                { className: "font-weight-bold" },
                                                "STATUS:"
                                            ),
                                            React.createElement(
                                                "span",
                                                { className: "text-right" },
                                                p.status
                                            )
                                        ),
                                        React.createElement(
                                            "div",
                                            { className: "d-flex justify-content-between" },
                                            React.createElement(
                                                "span",
                                                { className: "font-weight-bold" },
                                                "Purchase date:"
                                            ),
                                            React.createElement(
                                                "span",
                                                { className: "text-right" },
                                                p.purchase_date
                                            )
                                        ),
                                        React.createElement(
                                            "div",
                                            { className: "d-flex justify-content-between" },
                                            React.createElement(
                                                "span",
                                                { className: "font-weight-bold" },
                                                "Entrance code:"
                                            ),
                                            React.createElement(
                                                "span",
                                                { className: "text-right" },
                                                p.entrance_code
                                            )
                                        ),
                                        React.createElement(
                                            "div",
                                            { className: "d-flex justify-content-between" },
                                            React.createElement(
                                                "span",
                                                { className: "font-weight-bold" },
                                                "Purchased by:"
                                            ),
                                            React.createElement(
                                                "span",
                                                { className: "text-right" },
                                                p.name,
                                                React.createElement("br", null),
                                                p.email
                                            )
                                        ),
                                        React.createElement(
                                            "div",
                                            { className: "d-flex justify-content-between" },
                                            React.createElement(
                                                "span",
                                                { className: "font-weight-bold" },
                                                "Party:"
                                            ),
                                            React.createElement(
                                                "span",
                                                { className: "text-right" },
                                                p.party_title,
                                                React.createElement("br", null),
                                                p.party_date
                                            )
                                        ),
                                        React.createElement(
                                            "div",
                                            { className: "d-flex justify-content-between" },
                                            React.createElement(
                                                "span",
                                                { className: "font-weight-bold" },
                                                "# Tickets:"
                                            ),
                                            React.createElement(
                                                "span",
                                                { className: "text-right" },
                                                p.number_of_tickers
                                            )
                                        ),
                                        React.createElement(
                                            "div",
                                            { className: "d-flex justify-content-between" },
                                            React.createElement(
                                                "span",
                                                { className: "font-weight-bold" },
                                                "Price:"
                                            ),
                                            React.createElement(
                                                "span",
                                                { className: "text-right" },
                                                currencyFormat(p.price)
                                            )
                                        ),
                                        React.createElement(
                                            "div",
                                            { className: "mt-2" },
                                            React.createElement(
                                                "b",
                                                null,
                                                "Refunds:"
                                            ),
                                            p.refunds.map(function (r) {
                                                return React.createElement(
                                                    "div",
                                                    { key: r.refund_id, className: "text-right" },
                                                    currencyFormat(r.price)
                                                );
                                            })
                                        ),
                                        React.createElement(
                                            "div",
                                            { className: "text-center my-3" },
                                            p.status === "paid" && React.createElement(
                                                "button",
                                                { className: "btn btn-primary", "data-toggle": "modal", "data-target": "#refund-" + p.purchase_id, onClick: function onClick() {
                                                        return _this3.showModal(p);
                                                    } },
                                                "Give refund"
                                            )
                                        ),
                                        React.createElement(
                                            "div",
                                            { className: "modal fade show sidebar-modal", id: "refund-" + p.purchase_id, tabIndex: "-1", role: "dialog" },
                                            React.createElement(
                                                "div",
                                                { className: "modal-dialog", role: "document" },
                                                React.createElement(
                                                    "div",
                                                    { className: "modal-content" },
                                                    React.createElement(
                                                        "div",
                                                        { className: "modal-header" },
                                                        React.createElement(
                                                            "h5",
                                                            { className: "modal-title" },
                                                            "Refund for purchase ",
                                                            p.purchase_id
                                                        )
                                                    ),
                                                    React.createElement(
                                                        "div",
                                                        { className: "modal-body" },
                                                        "How much is the refund for?",
                                                        React.createElement(
                                                            "div",
                                                            { className: "input-group my-3" },
                                                            React.createElement(
                                                                "div",
                                                                { className: "input-group-prepend" },
                                                                React.createElement(
                                                                    "span",
                                                                    { className: "input-group-text" },
                                                                    React.createElement("i", { className: "fas fa-euro-sign" })
                                                                )
                                                            ),
                                                            React.createElement("input", { type: "number", className: "form-control", min: "0", step: "0.01", value: _this3.state.refundAmount, onChange: _this3.handleRefundAmount })
                                                        ),
                                                        React.createElement(
                                                            "div",
                                                            { className: "form-check my-3" },
                                                            React.createElement("input", { className: "form-check-input", type: "checkbox", checked: _this3.state.refundCheckbox, id: "refund-checkbox-" + p.purchase_id, onChange: _this3.handleRefundCheckbox }),
                                                            React.createElement(
                                                                "label",
                                                                { className: "form-check-label clickable", htmlFor: "refund-checkbox-" + p.purchase_id },
                                                                "Yes, I am sure I want to give a refund"
                                                            )
                                                        )
                                                    ),
                                                    _this3.state.processingRefund === p.purchase_id ? React.createElement(
                                                        "div",
                                                        { className: "modal-footer d-flex justify-content-center" },
                                                        React.createElement(Bubble, null)
                                                    ) : React.createElement(
                                                        "div",
                                                        { className: "modal-footer" },
                                                        React.createElement(
                                                            "button",
                                                            { type: "button", className: "btn btn-secondary", "data-dismiss": "modal", onClick: _this3.closeModal },
                                                            "Cancel "
                                                        ),
                                                        React.createElement(
                                                            "button",
                                                            { type: "button", className: "btn btn-primary", disabled: !_this3.state.refundCheckbox, onClick: function onClick() {
                                                                    return _this3.giveRefund("refund-" + p.purchase_id);
                                                                } },
                                                            "Give refund"
                                                        )
                                                    )
                                                )
                                            )
                                        )
                                    )
                                )
                            );
                        })
                    )
                )
            );
        }
    }]);

    return PurchaseRefund;
}(React.Component);