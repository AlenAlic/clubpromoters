class PurchaseRefund extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            year: this.props.year,
            month: this.props.month,
            min_year: this.props.min_year,
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
    }

    componentDidMount() {
        this.getPurchases(this.props.year, this.props.month);
    }

    getPurchases(year, month) {
        fetch("/organizer/purchases/" + year +"/" + month, {method: "GET", credentials: 'same-origin'})
        .then(response => response.json())
        .then(result => {
            this.setState({purchases: result, loading: false})
        }
        ).catch(error => {
            console.log('Error: \n', error);
        });
    }

    yearChange = event => {
        let year = event.target.value;
        this.setState({year: year});
        this.getPurchases(year, this.state.month)
    };
    monthChange = event => {
        let month = event.target.value;
        this.setState({month: month});
        this.getPurchases(this.state.year, month)
    };

    filterName = event => {
        this.setState({name: event.target.value});
    };
    filterEmail = event => {
        this.setState({email: event.target.value});
    };
    filterEntranceCode = event => {
        this.setState({entrance_code: String(event.target.value)});
    };

    showModal = p => {
        this.setState({modalPurchase: p});
    };
    closeModal = p => {
        this.setState({modalPurchase: undefined, refundAmount: "", refundCheckbox: false, processingRefund: undefined});
    };
    giveRefund = id => {
        this.setState({processingRefund: this.state.modalPurchase.purchase_id});
        fetch("/organizer/refund",
            {method: "POST", credentials: 'same-origin',
                body: JSON.stringify({purchase_id: this.state.modalPurchase.purchase_id, amount: this.state.refundAmount})})
        .then(response => response.json())
        .then(result => {
            $.notify({message: `Refund given for purchase ${this.state.modalPurchase.purchase_id}`},{type: 'alert-info'});
            this.closeModal();
            $(`#${id}`).modal('hide');
            this.getPurchases(this.state.year, this.state.month);
        }
        ).catch(error => {
            this.setState({processingRefund: undefined});
            console.log('Error: \n', error);
        });
    };

    handleRefundAmount = event => {
        this.setState({refundAmount: event.target.value});
    };
    handleRefundCheckbox = event => {
        let target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        this.setState({refundCheckbox: value});
    };


    render() {
        const yearArray = Array.from({length:this.state.min_year-this.state.year+1},(v,k)=>k+this.state.min_year);
        const purchases = this.state.purchases;
        let filteredPurchases = purchases
            .filter(p => {return p.email.includes(this.state.email) && p.name.includes(this.state.name) && p.entrance_code.includes(this.state.entrance_code)});

        return (
            <React.Fragment>
                <div className="form-row">
                    <div className="col-6">
                        <div className="form-group">
                            <select className="form-control" id="year" value={this.state.year} onChange={this.yearChange}>
                                {yearArray.map( y => (<option key={y} value={y}>{y}</option>))}
                            </select>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="form-group">
                            <select className="form-control" id="month" value={this.state.month} onChange={this.monthChange}>
                                {Object.keys(MONTHS).map( y => (<option key={y} value={y}>{MONTHS[y]}</option>))}
                            </select>
                        </div>
                    </div>
                </div>
                <h2 className="text-center">Purchases in {MONTHS[this.state.month]} {!this.state.loading && <span className="badge badge-pill badge-primary">{filteredPurchases.length}</span>}</h2>
                {this.state.loading ?
                    <div className="d-flex justify-content-center mb-4">
                        <Bubble/>
                    </div>
                    :
                    <div>
                        <div className="d-grid grid-column-gap-2 grid-row-gap-2 grid-template-columns-md-3 mb-2">
                            <div className="input-group">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">Name</span>
                                </div>
                                <input type="text" className="form-control"/>
                            </div>
                            <div className="input-group">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">Email</span>
                                </div>
                                <input type="text" className="form-control" value={this.state.email} onChange={this.filterEmail} />
                            </div>
                            <div className="input-group">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">Code</span>
                                </div>
                                <input type="text" className="form-control" value={this.state.entrance_code} onChange={this.filterEntranceCode} />
                            </div>
                        </div>
                        <div className="d-grid grid-template-columns-md-2 grid-template-columns-xl-4 grid-column-gap-3 grid-row-gap-3">
                            {filteredPurchases.map(p => (
                                <div key={p.purchase_id}>
                                    <div className="card">
                                        <div className="card-body">
                                            <h4 className="card-title text-center">Purchase {p.purchase_id}</h4>
                                            <div className="d-flex justify-content-between">
                                                <span className="font-weight-bold">STATUS:</span>
                                                <span className="text-right">{p.status}</span>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span className="font-weight-bold">Purchase date:</span>
                                                <span className="text-right">{p.purchase_date}</span>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span className="font-weight-bold">Entrance code:</span>
                                                <span className="text-right">{p.entrance_code}</span>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span className="font-weight-bold">Purchased by:</span>
                                                <span className="text-right">
                                                    {p.name}<br/>
                                                    {p.email}
                                                </span>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span className="font-weight-bold">Party:</span>
                                                <span className="text-right">
                                                    {p.party_title}<br/>
                                                    {p.party_date}
                                                </span>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span className="font-weight-bold"># Tickets:</span>
                                                <span className="text-right">
                                                    {p.number_of_tickers}
                                                </span>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span className="font-weight-bold">Price:</span>
                                                <span className="text-right">
                                                    {currencyFormat(p.price)}
                                                </span>
                                            </div>
                                            <div className="mt-2">
                                                <b>Refunds:</b>
                                                {p.refunds.map(r => (
                                                    <div key={r.refund_id} className="text-right">
                                                        {currencyFormat(r.price)}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="text-center my-3">
                                                {p.status === "paid" &&
                                                <button className="btn btn-primary" data-toggle="modal" data-target={`#refund-${p.purchase_id}`} onClick={() => this.showModal(p)}>Give refund</button>}
                                            </div>
                                            <div className="modal fade show sidebar-modal" id={`refund-${p.purchase_id}`} tabIndex="-1" role="dialog">
                                                <div className="modal-dialog" role="document">
                                                    <div className="modal-content">
                                                        <div className="modal-header">
                                                            <h5 className="modal-title">Refund for purchase {p.purchase_id}</h5>
                                                        </div>
                                                        <div className="modal-body">
                                                            How much is the refund for?
                                                            <div className="input-group my-3">
                                                                <div className="input-group-prepend">
                                                                    <span className="input-group-text">
                                                                        <i className="fas fa-euro-sign"/>
                                                                    </span>
                                                                </div>
                                                                <input type="number" className="form-control" min="0" step="0.01" value={this.state.refundAmount} onChange={this.handleRefundAmount} />
                                                            </div>
                                                            <div className="form-check my-3">
                                                                <input className="form-check-input" type="checkbox" checked={this.state.refundCheckbox} id={`refund-checkbox-${p.purchase_id}`} onChange={this.handleRefundCheckbox}/>
                                                                    <label className="form-check-label clickable" htmlFor={`refund-checkbox-${p.purchase_id}`}>
                                                                        Yes, I am sure I want to give a refund
                                                                    </label>
                                                            </div>
                                                        </div>
                                                        {this.state.processingRefund === p.purchase_id ?
                                                            <div className="modal-footer d-flex justify-content-center">
                                                                <Bubble/>
                                                            </div>
                                                            :
                                                            <div className="modal-footer">
                                                                <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={this.closeModal}>Cancel </button>
                                                                <button type="button" className="btn btn-primary" disabled={!this.state.refundCheckbox} onClick={() => this.giveRefund(`refund-${p.purchase_id}`)}>Give refund</button>
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                }
            </React.Fragment>
        )
    }
}