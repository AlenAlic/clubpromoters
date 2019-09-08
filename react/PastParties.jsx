class PastParties extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            year: this.props.year,
            month: this.props.month,
            min_year: this.props.min_year,
            parties: [],
            loading: false
        };
    }

    componentDidMount() {
        this.getPastParties(this.props.year, this.props.month);
    }

    getPastParties(year, month) {
        this.setState({loading: true});
        fetch("/organizer/parties/" + year +"/" + month, {method: "GET", credentials: 'same-origin'})
        .then(response => response.json())
        .then(result => {
            this.setState({parties: result, loading: false})
        }
        ).catch(error => {
            console.log('Error: \n', error);
        });
    }

    yearChange = event => {
        let year = event.target.value;
        this.setState({year: year});
        this.getPastParties(year, this.state.month)
    };
    monthChange = event => {
        let month = event.target.value;
        this.setState({month: month});
        this.getPastParties(this.state.year, month)
    };

    render() {
        const yearArray = Array.from({length:this.state.min_year-this.state.year+1},(v,k)=>k+this.state.min_year);
        const parties = this.state.parties;

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
                <h2>Parties in {MONTHS[this.state.month]} {!this.state.loading && <span className="badge badge-pill badge-primary">{parties.length}</span>}</h2>
                {this.state.loading ?
                    <div className="d-flex justify-content-center mb-4">
                        <Bubble/>
                    </div>
                    :
                    <div className="d-grid grid-template-columns-md-2 grid-column-gap-2 grid-row-gap-2">
                        {parties.map(p => (
                            <div key={p.party_id}>
                                <div className="card">
                                    <div className="card-body">
                                        <h4 className="card-title text-center">{p.title}</h4>
                                        <div className="d-flex justify-content-between">
                                            <span className="font-weight-bold">Date:</span>
                                            <span className="text-right">
                                                {p.party_date}
                                                <br/>
                                                {p.party_time}
                                            </span>
                                        </div>
                                        <div className="font-weight-bold">Tickets:</div>
                                        <div className="d-flex justify-content-between">
                                            <i>Made available:</i>
                                            <span className="text-right">{p.num_available_tickets}</span>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <i>Sold:</i>
                                            <span className="text-right">{p.sold_tickets}</span>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <i>Left over:</i>
                                            <span className="text-right">{p.remaining_tickets}</span>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <span className="font-weight-bold">Income:</span>
                                            <span className="text-right">{currencyFormat(p.party_income)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <span className="font-weight-bold">Refunded:</span>
                                            <span className="text-right">{currencyFormat(-p.party_refunds)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <span className="font-weight-bold">Promoters:</span>
                                            <span className="text-right">{currencyFormat(-p.party_promoter_cut)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <span className="font-weight-bold">Club Owners:</span>
                                            <span className="text-right">{currencyFormat(-p.party_club_owner_cut)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <span className="font-weight-bold">Profit:</span>
                                            <span className="text-right">{currencyFormat(p.party_profit)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                }
            </React.Fragment>
        )
    }
}