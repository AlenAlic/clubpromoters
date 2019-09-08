const WAIT_INTERVAL = 800;

class TicketPurchase extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tickets: this.props.tickets,
            email: "",
            emailError: "",
            name: "",
            readyToSubmit: false,
            checked: false
        };
    }
    componentWillMount() {
        this.timer = null;
    }
    changeTicketAmount(input) {
        let newValue = this.state.tickets + input;
        if (newValue > 0) {
            this.setState({tickets: newValue});
        }
    }
    updateName(event) {
        this.setState({name: event.target.value});
    }
    updateEmail(event) {
        clearTimeout(this.timer);
        const email = event.target.value;
        this.setState({email: email});
        if (validateEmail(email)) {this.checkEmail(email)}
        else {this.timer = setTimeout(this.checkEmail, WAIT_INTERVAL, email)}
    }
    checkEmail = email => {
        const correctEmail = validateEmail(email);
        this.setState({emailError: correctEmail ? "" : "Error"}, () => {
            this.checkReadyToSubmit()
        });
    };
    updateCheckbox(event) {
        const target = event.target;
        this.setState({checked: target.checked}, () => {
            this.checkReadyToSubmit()
        });
    };
    checkReadyToSubmit = () => {
        if (validateEmail(this.state.email) && this.state.name.replace(" ", "") !== "" && this.state.checked) {
            this.setState({readyToSubmit: true});
            return true
        }
        this.setState({readyToSubmit: false});
        return false
    };

    render() {
        const party = this.props.party;
        const totalPrice = this.state.tickets * party.ticket_price;

        return (
            <div className="purchase-order">
                <div className="card mx-3 my-3">
                    <div className="card-body text-center">
                        <h4 className="card-title">Ticket purchase</h4>
                        <div className="left-right-split-container mt-3">
                            <span>Event:</span>
                            <span>{party.title}</span>
                        </div>
                        <div className="left-right-split-container">
                            <span/>
                            <span>{party.party_date}</span>
                        </div>
                        <div className="left-right-split-container mb-3">
                            <span/>
                            <span>{party.party_time}</span>
                        </div>
                        <form className="form" method="POST" encType="multipart/form-data" noValidate>
                            <div className="tickets-container mb-3 unselectable">
                                <span className="party-title">Ticket(s)</span>
                                <span className="party-counter">
                                    <i className="fas fa-minus-circle clickable" onClick={() => this.changeTicketAmount(-1)}/>
                                    <input className="party-amount" id="tickets" name="tickets" value={this.state.tickets} onChange={() => this.changeTicketAmount(0)}/>
                                    <i className="fas fa-plus-circle clickable" onClick={() => this.changeTicketAmount(1)}/>
                                </span>
                            </div>
                            <div className="left-right-split-container mb-3">
                                <span>Price per ticket:</span>
                                <span>{currencyFormat(party.ticket_price)}</span>
                            </div>
                            <div className="left-right-split-container mb-3">
                                <span>Total price:</span>
                                <span>{currencyFormat(totalPrice)}</span>
                            </div>
                            <div className="form-group text-left">
                                <input type="text" name="name" className="form-control" placeholder="Full name"
                                       value={this.state.name} onChange={() => this.updateName(event)} required={true}/>
                                <small className="form-text text-muted">Required for entry to the party.</small>
                            </div>
                            <div className="form-group text-left">
                                <input type="email" name="email" className={classNames("form-control",
                                    {"is-invalid": this.state.emailError !== ""},
                                    {"is-valid": this.state.emailError === "" && validateEmail(this.state.email)})}
                                       placeholder="Email address" value={this.state.email} onChange={() => this.updateEmail(event)} required={true}/>
                                {this.state.emailError === "" ?
                                    <small className="form-text text-muted">
                                        Your tickets will be emailed to you.
                                    </small> :
                                    <div className="invalid-feedback">Please enter a valid email address.</div>
                                }
                            </div>
                            <input type="checkbox" className={"d-none"} name="purchase_tickets" value="" defaultChecked="checked" />
                            <div className="form-group form-check">
                                <input type="checkbox" className="form-check-input" id="terms" value={this.state.checked} onChange={() => this.updateCheckbox(event)} style={{"marginTop": "0.5rem"}}/>
                                <label className="form-check-label" htmlFor="terms" style={{"fontSize": "0.65rem"}}>I have read, and accept the <a href="/terms" target="_blank">terms and conditions</a>.</label>
                            </div>
                            <button type="submit" name="party_id" value={party.party_id}
                                    className={classNames("btn btn-dark my-3", {"disabled": !this.state.readyToSubmit})} disabled={!this.state.readyToSubmit}>Purchase ticket(s)
                            </button>
                        </form>
                        <a className="btn btn-secondary" href="/">Cancel</a>
                    </div>
                </div>
            </div>
        )
    }
}