var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PastParties = function (_React$Component) {
    _inherits(PastParties, _React$Component);

    function PastParties(props) {
        _classCallCheck(this, PastParties);

        var _this = _possibleConstructorReturn(this, (PastParties.__proto__ || Object.getPrototypeOf(PastParties)).call(this, props));

        _this.yearChange = function (event) {
            var year = event.target.value;
            _this.setState({ year: year });
            _this.getPastParties(year, _this.state.month);
        };

        _this.monthChange = function (event) {
            var month = event.target.value;
            _this.setState({ month: month });
            _this.getPastParties(_this.state.year, month);
        };

        _this.state = {
            year: _this.props.year,
            month: _this.props.month,
            min_year: _this.props.min_year,
            parties: [],
            loading: false
        };
        return _this;
    }

    _createClass(PastParties, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            this.getPastParties(this.props.year, this.props.month);
        }
    }, {
        key: "getPastParties",
        value: function getPastParties(year, month) {
            var _this2 = this;

            this.setState({ loading: true });
            fetch("/organizer/parties/" + year + "/" + month, { method: "GET", credentials: 'same-origin' }).then(function (response) {
                return response.json();
            }).then(function (result) {
                _this2.setState({ parties: result, loading: false });
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
            var parties = this.state.parties;

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
                    null,
                    "Parties in ",
                    MONTHS[this.state.month],
                    " ",
                    !this.state.loading && React.createElement(
                        "span",
                        { className: "badge badge-pill badge-primary" },
                        parties.length
                    )
                ),
                this.state.loading ? React.createElement(
                    "div",
                    { className: "d-flex justify-content-center mb-4" },
                    React.createElement(Bubble, null)
                ) : React.createElement(
                    "div",
                    { className: "d-grid grid-template-columns-md-2 grid-column-gap-2 grid-row-gap-2" },
                    parties.map(function (p) {
                        return React.createElement(
                            "div",
                            { key: p.party_id },
                            React.createElement(
                                "div",
                                { className: "card" },
                                React.createElement(
                                    "div",
                                    { className: "card-body" },
                                    React.createElement(
                                        "h4",
                                        { className: "card-title text-center" },
                                        p.title
                                    ),
                                    React.createElement(
                                        "div",
                                        { className: "d-flex justify-content-between" },
                                        React.createElement(
                                            "span",
                                            { className: "font-weight-bold" },
                                            "Date:"
                                        ),
                                        React.createElement(
                                            "span",
                                            { className: "text-right" },
                                            p.party_date,
                                            React.createElement("br", null),
                                            p.party_time
                                        )
                                    ),
                                    React.createElement(
                                        "div",
                                        { className: "font-weight-bold" },
                                        "Tickets:"
                                    ),
                                    React.createElement(
                                        "div",
                                        { className: "d-flex justify-content-between" },
                                        React.createElement(
                                            "i",
                                            null,
                                            "Made available:"
                                        ),
                                        React.createElement(
                                            "span",
                                            { className: "text-right" },
                                            p.num_available_tickets
                                        )
                                    ),
                                    React.createElement(
                                        "div",
                                        { className: "d-flex justify-content-between" },
                                        React.createElement(
                                            "i",
                                            null,
                                            "Sold:"
                                        ),
                                        React.createElement(
                                            "span",
                                            { className: "text-right" },
                                            p.sold_tickets
                                        )
                                    ),
                                    React.createElement(
                                        "div",
                                        { className: "d-flex justify-content-between" },
                                        React.createElement(
                                            "i",
                                            null,
                                            "Left over:"
                                        ),
                                        React.createElement(
                                            "span",
                                            { className: "text-right" },
                                            p.remaining_tickets
                                        )
                                    ),
                                    React.createElement(
                                        "div",
                                        { className: "d-flex justify-content-between" },
                                        React.createElement(
                                            "span",
                                            { className: "font-weight-bold" },
                                            "Income:"
                                        ),
                                        React.createElement(
                                            "span",
                                            { className: "text-right" },
                                            currencyFormat(p.party_income)
                                        )
                                    ),
                                    React.createElement(
                                        "div",
                                        { className: "d-flex justify-content-between" },
                                        React.createElement(
                                            "span",
                                            { className: "font-weight-bold" },
                                            "Refunded:"
                                        ),
                                        React.createElement(
                                            "span",
                                            { className: "text-right" },
                                            currencyFormat(-p.party_refunds)
                                        )
                                    ),
                                    React.createElement(
                                        "div",
                                        { className: "d-flex justify-content-between" },
                                        React.createElement(
                                            "span",
                                            { className: "font-weight-bold" },
                                            "Promoters:"
                                        ),
                                        React.createElement(
                                            "span",
                                            { className: "text-right" },
                                            currencyFormat(-p.party_promoter_cut)
                                        )
                                    ),
                                    React.createElement(
                                        "div",
                                        { className: "d-flex justify-content-between" },
                                        React.createElement(
                                            "span",
                                            { className: "font-weight-bold" },
                                            "Club Owners:"
                                        ),
                                        React.createElement(
                                            "span",
                                            { className: "text-right" },
                                            currencyFormat(-p.party_club_owner_cut)
                                        )
                                    ),
                                    React.createElement(
                                        "div",
                                        { className: "d-flex justify-content-between" },
                                        React.createElement(
                                            "span",
                                            { className: "font-weight-bold" },
                                            "Profit:"
                                        ),
                                        React.createElement(
                                            "span",
                                            { className: "text-right" },
                                            currencyFormat(p.party_profit)
                                        )
                                    )
                                )
                            )
                        );
                    })
                )
            );
        }
    }]);

    return PastParties;
}(React.Component);