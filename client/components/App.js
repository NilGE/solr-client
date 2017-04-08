import React from 'react';
import solwr from 'solwr';

class App extends React.Component {
  constructor(props) {
    super(props);
    solwr.address({
      host: "http://localhost",
      port: 8983
    });
    this.state = {
      query: '',
      docs: [],
      solr: solwr.core('news')
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    let solr = this.state.solr;
    solr.find(this.state.query).exec().then(res => {
      console.log(res);
      this.setState({docs:res.docs})
    }).catch(err => console.error(err));
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value});
  }
  render() {
    return (
      <div className="search-input">
        <form onSubmit={this.handleSubmit} >
          <div className="row">
            <div className="col-md-6 col-md-offset-3">
              <div className="input-group">
                  <input name="query" type="text" className="form-control input-lg" placeholder="Search" onChange={this.handleChange} />
                  <span className="input-group-btn">
                      <button className="btn btn-info btn-lg" type="submit">
                          Search
                      </button>
                  </span>
              </div>
            </div>
        	</div>
        </form>

        {this.state.docs.map(doc => {
          let path = doc.id.split('/');
          return (
            <div key={doc.id}>
              <div className="wall" >
                  <a href={'/CNNDownloadData/'+path[path.length - 1]}>
                    <h2>
                        {doc.dc_title}
                    </h2>
                    <h3>
                        {doc.description}
                    </h3>
                  </a>
              </div>
              <hr />
            </div>
          );
        }

        )}
      </div>
    );
  }
}

export default App;
