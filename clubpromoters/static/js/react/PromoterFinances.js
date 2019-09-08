var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PromoterFinances = function (_React$Component) {
    _inherits(PromoterFinances, _React$Component);

    function PromoterFinances(props) {
        _classCallCheck(this, PromoterFinances);

        var _this = _possibleConstructorReturn(this, (PromoterFinances.__proto__ || Object.getPrototypeOf(PromoterFinances)).call(this, props));

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

        _this.state = {
            year: _this.props.year,
            month: _this.props.month,
            min_year: _this.props.min_year,
            purchases: [],
            refunds: [],
            loading: false
        };
        return _this;
    }

    _createClass(PromoterFinances, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            this.getPurchases(this.props.year, this.props.month);
        }
    }, {
        key: "getPurchases",
        value: function getPurchases(year, month) {
            var _this2 = this;

            this.setState({ loading: true });
            fetch("/promoter/parties/" + year + "/" + month, { method: "GET", credentials: 'same-origin' }).then(function (response) {
                return response.json();
            }).then(function (result) {
                _this2.setState({ purchases: result.purchases, refunds: result.refunds, loading: false });
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
            var totalPrice = purchases.map(function (p) {
                return p.price;
            }).reduce(reduceArraySum, 0);
            var refunds = this.state.refunds;
            var totalRefund = refunds.map(function (p) {
                return p.refund_price;
            }).reduce(reduceArraySum, 0);

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
                    "div",
                    { className: "d-flex justify-content-center mb-4" },
                    React.createElement(
                        "div",
                        { className: "card" },
                        React.createElement(
                            "div",
                            { className: "card-body" },
                            React.createElement(
                                "h4",
                                { className: "card-title text-center" },
                                "Total for ",
                                MONTHS[this.state.month],
                                " ",
                                this.state.year
                            ),
                            this.state.loading ? React.createElement(
                                "div",
                                { className: "d-flex justify-content-center" },
                                React.createElement(Bubble, null)
                            ) : React.createElement(
                                "div",
                                null,
                                React.createElement(
                                    "div",
                                    { className: "d-flex justify-content-between" },
                                    React.createElement(
                                        "div",
                                        null,
                                        "Income"
                                    ),
                                    React.createElement(
                                        "div",
                                        null,
                                        currencyFormat(totalPrice)
                                    )
                                ),
                                React.createElement(
                                    "div",
                                    { className: "d-flex justify-content-between" },
                                    React.createElement(
                                        "div",
                                        null,
                                        "Refunds"
                                    ),
                                    React.createElement(
                                        "div",
                                        null,
                                        currencyFormat(-totalRefund)
                                    )
                                ),
                                React.createElement(
                                    "div",
                                    { className: "d-flex justify-content-between mt-2" },
                                    React.createElement(
                                        "div",
                                        null,
                                        "Total for this month"
                                    ),
                                    React.createElement(
                                        "b",
                                        { className: "border-top" },
                                        currencyFormat(totalPrice - totalRefund)
                                    )
                                )
                            )
                        )
                    )
                ),
                React.createElement(
                    "div",
                    { className: "d-grid grid-template-columns-md-2 grid-column-gap-2 grid-row-gap-2" },
                    React.createElement(
                        "div",
                        null,
                        React.createElement(
                            "div",
                            { className: "card" },
                            React.createElement(
                                "div",
                                { className: "card-body" },
                                React.createElement(
                                    "h4",
                                    { className: "card-title text-center mb-0" },
                                    "Income"
                                )
                            ),
                            this.state.loading ? React.createElement(
                                "div",
                                { className: "d-flex justify-content-center" },
                                React.createElement(Bubble, null)
                            ) : React.createElement(
                                "table",
                                { className: "table" },
                                React.createElement(
                                    "thead",
                                    null,
                                    React.createElement(
                                        "tr",
                                        null,
                                        React.createElement(
                                            "th",
                                            { style: { width: "65%" } },
                                            "Party"
                                        ),
                                        React.createElement(
                                            "th",
                                            { style: { width: "15%" } },
                                            "Tickets"
                                        ),
                                        React.createElement(
                                            "th",
                                            { style: { width: "20%" }, className: "text-right" },
                                            "Profit"
                                        )
                                    )
                                ),
                                React.createElement(
                                    "tbody",
                                    null,
                                    purchases.map(function (p) {
                                        return React.createElement(
                                            "tr",
                                            { key: p.party_id },
                                            React.createElement(
                                                "td",
                                                null,
                                                p.title,
                                                " - ",
                                                p.party_date
                                            ),
                                            React.createElement(
                                                "td",
                                                null,
                                                p.tickets
                                            ),
                                            React.createElement(
                                                "td",
                                                { className: "text-right" },
                                                currencyFormat(p.price)
                                            )
                                        );
                                    }),
                                    React.createElement(
                                        "tr",
                                        null,
                                        React.createElement("td", null),
                                        React.createElement(
                                            "td",
                                            { className: "text-right" },
                                            React.createElement(
                                                "i",
                                                null,
                                                "Total"
                                            )
                                        ),
                                        React.createElement(
                                            "td",
                                            { className: "text-right" },
                                            React.createElement(
                                                "i",
                                                null,
                                                currencyFormat(totalPrice)
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    ),
                    React.createElement(
                        "div",
                        null,
                        React.createElement(
                            "div",
                            { className: "card" },
                            React.createElement(
                                "div",
                                { className: "card-body" },
                                React.createElement(
                                    "h4",
                                    { className: "card-title text-center mb-0" },
                                    "Refund costs"
                                )
                            ),
                            this.state.loading ? React.createElement(
                                "div",
                                { className: "d-flex justify-content-center" },
                                React.createElement(Bubble, null)
                            ) : React.createElement(
                                "table",
                                { className: "table" },
                                React.createElement(
                                    "thead",
                                    null,
                                    React.createElement(
                                        "tr",
                                        null,
                                        React.createElement(
                                            "th",
                                            { style: { width: "65%" } },
                                            "Party"
                                        ),
                                        React.createElement(
                                            "th",
                                            { style: { width: "15%" } },
                                            "Tickets"
                                        ),
                                        React.createElement(
                                            "th",
                                            { style: { width: "20%" }, className: "text-right" },
                                            "Profit"
                                        )
                                    )
                                ),
                                React.createElement(
                                    "tbody",
                                    null,
                                    refunds.map(function (p) {
                                        return React.createElement(
                                            "tr",
                                            { key: p.party_id },
                                            React.createElement(
                                                "td",
                                                null,
                                                p.title,
                                                " - ",
                                                p.party_date
                                            ),
                                            React.createElement(
                                                "td",
                                                null,
                                                p.refund_tickets
                                            ),
                                            React.createElement(
                                                "td",
                                                { className: "text-right" },
                                                currencyFormat(p.refund_price)
                                            )
                                        );
                                    }),
                                    React.createElement(
                                        "tr",
                                        null,
                                        React.createElement("td", null),
                                        React.createElement(
                                            "td",
                                            { className: "text-right" },
                                            React.createElement(
                                                "i",
                                                null,
                                                "Total"
                                            )
                                        ),
                                        React.createElement(
                                            "td",
                                            { className: "text-right" },
                                            React.createElement(
                                                "i",
                                                null,
                                                currencyFormat(totalRefund)
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
            );
        }
    }]);

    return PromoterFinances;
}(React.Component);