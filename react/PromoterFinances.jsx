class PromoterFinances extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            year: this.props.year,
            month: this.props.month,
            min_year: this.props.min_year,
            purchases: [],
            refunds: [],
            loading: false
        };
    }

    componentDidMount() {
        this.getPurchases(this.props.year, this.props.month);
    }

    getPurchases(year, month) {
        this.setState({loading: true});
        fetch("/promoter/parties/" + year +"/" + month, {method: "GET", credentials: 'same-origin'})
        .then(response => response.json())
        .then(result => {
            this.setState({purchases: result.purchases, refunds: result.refunds, loading: false})
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

    render() {
        const yearArray = Array.from({length:this.state.min_year-this.state.year+1},(v,k)=>k+this.state.min_year);
        const purchases = this.state.purchases;
        const totalPrice = purchases.map(p => p.price).reduce(reduceArraySum, 0);
        const refunds = this.state.refunds;
        const totalRefund = refunds.map(p => p.refund_price).reduce(reduceArraySum, 0);

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
                <div className="d-flex justify-content-center mb-4">
                    <div className="card">
                        <div className="card-body">
                            <h4 className="card-title text-center">Total for {MONTHS[this.state.month]} {this.state.year}</h4>
                            {this.state.loading
                                ?
                                <div className="d-flex justify-content-center">
                                    <Bubble/>
                                </div>
                                :
                                <div>
                                    <div className="d-flex justify-content-between">
                                        <div>Income</div>
                                        <div>{currencyFormat(totalPrice)}</div>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <div>Refunds</div>
                                        <div>{currencyFormat(-totalRefund)}</div>
                                    </div>
                                    <div className="d-flex justify-content-between mt-2">
                                        <div>Total for this month</div>
                                        <b className="border-top">{currencyFormat(totalPrice - totalRefund)}</b>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </div>
                <div className="d-grid grid-template-columns-md-2 grid-column-gap-2 grid-row-gap-2">
                    <div>
                        <div className="card">
                            <div className="card-body">
                                <h4 className="card-title text-center mb-0">Income</h4>
                            </div>
                            {this.state.loading
                                ?
                                <div className="d-flex justify-content-center">
                                    <Bubble />
                                </div>
                                :
                                <table className="table">
                                    <thead>
                                    <tr>
                                        <th style={{width: "65%"}}>Party</th>
                                        <th style={{width: "15%"}}>Tickets</th>
                                        <th style={{width: "20%"}} className="text-right">Profit</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {purchases.map(p => (
                                        <tr key={p.party_id}>
                                            <td>{p.title} - {p.party_date}</td>
                                            <td>{p.tickets}</td>
                                            <td className="text-right">{currencyFormat(p.price)}</td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td/>
                                        <td className="text-right"><i>Total</i></td>
                                        <td className="text-right"><i>{currencyFormat(totalPrice)}</i></td>
                                    </tr>
                                    </tbody>
                                </table>
                            }
                        </div>
                    </div>
                    <div>
                        <div className="card">
                            <div className="card-body">
                                <h4 className="card-title text-center mb-0">Refund costs</h4>
                            </div>
                            {this.state.loading
                                ?
                                <div className="d-flex justify-content-center">
                                    <Bubble/>
                                </div>
                                :
                                <table className="table">
                                    <thead>
                                    <tr>
                                        <th style={{width: "65%"}}>Party</th>
                                        <th style={{width: "15%"}}>Tickets</th>
                                        <th style={{width: "20%"}} className="text-right">Profit</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {refunds.map(p => (
                                        <tr key={p.party_id}>
                                            <td>{p.title} - {p.party_date}</td>
                                            <td>{p.refund_tickets}</td>
                                            <td className="text-right">{currencyFormat(p.refund_price)}</td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td/>
                                        <td className="text-right"><i>Total</i></td>
                                        <td className="text-right"><i>{currencyFormat(totalRefund)}</i></td>
                                    </tr>
                                    </tbody>
                                </table>
                            }
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}