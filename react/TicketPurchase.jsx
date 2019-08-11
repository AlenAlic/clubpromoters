const WAIT_INTERVAL = 800;

class TicketPurchase extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tickets: this.props.tickets,
            email: "",
            emailError: "",
            first_name: "",
            readyToSubmit: false
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
    handleSubmit(event) {
        // event.preventDefault();
        console.log(this.state)
    }
    updateEmail(event) {
        clearTimeout(this.timer);
        this.setState({email: event.target.value});
        if (validateEmail(this.state.email)) {this.checkEmail()}
        else {this.timer = setTimeout(this.checkEmail, WAIT_INTERVAL)}
    }
    checkEmail = () => {
        const correctEmail = validateEmail(this.state.email);
        this.setState({emailError: correctEmail ? "" : "Error", readyToSubmit: correctEmail})
    };
    updateName(event) {
        this.setState({name: event.target.value});
    }

    render() {
        const party = this.props.party;
        const totalPrice = this.state.tickets * party.ticket_price;

        return (
            <div className="purchase-order">
                <div className="card">
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
                        <form className="form" method="POST" encType="multipart/form-data" noValidate
                              onSubmit={this.handleSubmit}>
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