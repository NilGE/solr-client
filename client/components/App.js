import React from 'react';
import solwr from 'solwr';
import axios from 'axios';
import {asyncContainer, Typeahead} from 'react-bootstrap-typeahead';
const AsyncTypeahead = asyncContainer(Typeahead);

import Input from 'react-input-datalist';

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
      solr: solwr.core('news2'),
      options: [],
      spellCorrect: true,
      correctedQuery: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleFilter = this.handleFilter.bind(this);
  }

  componentDidMount() {
    // this.compareResult();
  }

  compareResult() {
    let solr = this.state.solr;

    let queries = ["Brexit", "NASDAQ", "NBA", "Snapchat", "Illegal Immigration", "Donald Trump", "Russia", "NASA"];
    let promises_tfidf = [];
    let promises_pgrank = [];

    queries.map(query => {
      promises_tfidf.push(solr.find(query).fieldlist("id").exec());
      promises_pgrank.push(solr.find(query).fieldlist("id").sort("pageRankFile desc").exec());
    });

    axios.all(promises_tfidf).then(() => {
      axios.all(promises_pgrank).then(() => {

        for (let i = 0; i < promises_pgrank.length; i++) {
          // compare the two promise
          let tfidf_result = [];
          let pgrank_result = [];
          promises_tfidf[i].then(res1 => {
            promises_pgrank[i].then(res2 => {
              res1.docs.map(doc => {
                tfidf_result.push(doc.id);
              });
              res2.docs.map(doc => {
                pgrank_result.push(doc.id);
              });
              console.log(queries[i]);
              console.log(tfidf_result);
              console.log(pgrank_result);
              let a = new Set(tfidf_result);
              let b = new Set(pgrank_result);
              let intersection = [...a].filter(x => b.has(x));
              console.log(intersection);
              console.log(intersection.length);
            });
          });
        }
      });
    });
  }

  handleChange(selectedItems) {
    this.setState({query: selectedItems[0]})
  }

  // handleChange(query) {
  //   console.log(query);
  //   this.setState({query:query})
  //   let solr = this.state.solr;
  //   solr.suggest(query).exec().then(res => {
  //     let options = [];
  //     res.suggest[query].suggestions.map(candidate => {
  //       options.push(candidate.term);
  //       console.log(candidate.term);
  //     });
  //     this.setState({options: options})
  //   }).catch(err => console.log(err));
  // }

  handleSearch(query) {
    if (!query) {
      return;
    }
    let solr = this.state.solr;
    solr.suggest(query).exec().then(res => {
      let options = [];
      res.suggest[query].suggestions.map(candidate => {
        options.push(candidate.term);
      });
      this.setState({options: options})
      this.setState({query: query})
    }).catch(err => console.log(err));
  }

  handleSelect(e) {
    document.getElementById('sort-selector').innerHTML = e.target.innerHTML;
  }

  handleFilter(option, text) {
    return (option);
  }

  handleSubmit(e) {
    e.preventDefault();
    let query = this.state.query;
    let words = query.split(/\s+/);
    let promises_spellcheck = [];
    words.map(word => {
      promises_spellcheck.push(axios.post('/api/spellcheck', {query: word}));
    });
    let spellCorrect = true;
    axios.all(promises_spellcheck).then(responses => {
      let results = [];
      let correctedQuery = [];
      for (let i = 0; i < responses.length; i++) {
        let curr = responses[i].data;
        results.push(curr);
        if (curr != words[i]) {
          spellCorrect = false;
          correctedQuery.push('<b><i>' + curr + '</i></b>')
        } else {
          correctedQuery.push(curr);
        }
      }
      query = results.join(' ');
      if (!spellCorrect) {
        correctedQuery = correctedQuery.join(' ');
        this.setState({correctedQuery: correctedQuery});
      }
      this.setState({spellCorrect: spellCorrect});

      console.log('query: ' + query);
      let solr = this.state.solr;
      let sortContent = document.getElementById('sort-selector').innerHTML == 'Page Rank' ? 'pageRankFile desc' : '';
      solr.find(query).sort(sortContent).exec().then(res => {
        console.log(res);
        this.setState({docs:res.docs})
      }).catch(err => console.error(err));
    }).catch(err => console.log(err));
  }

  render() {
    return (
      <div className="search-input">
        <form onSubmit={this.handleSubmit} autoComplete="off">
          <div className="row">

            <div className="col-md-6 col-md-offset-3">

              <div className="input-group">
                <span className="input-group-btn dropdown">
                  <button id="sort-selector" className="btn btn-info btn-lg dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                      Luence
                  </button>
                  <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
                    <li><a onClick={this.handleSelect}>Luence</a></li>
                    <li><a onClick={this.handleSelect}>Page Rank</a></li>
                  </ul>
                </span>
                <AsyncTypeahead
                    filterBy={this.handleFilter}
                    onSearch={this.handleSearch}
                    minLength={1}
                    placeholder="Type what you want to search here"
                    onChange={this.handleChange}
                    options={this.state.options}
                    selected={[]}
                />
                <span className="input-group-btn">
                    <button className="btn btn-info btn-lg" type="submit">
                        Search
                    </button>
                </span>
              </div>
            </div>
        	</div>
        </form>

        <br />
        <br />
        {this.state.spellCorrect == true ? '' :
          <div className="spell-block col-md-10 col-md-offset-1">
            <div className="spell">
              Show results for <span id="correct_spell" dangerouslySetInnerHTML = {{ __html: this.state.correctedQuery }}></span>
            </div>
            <div className="spell-origin">
              Search instead for <span id="origin_spell">{this.state.query}</span>
            </div>
          </div>
        }
        {this.state.docs.map(doc => {
          let path = doc.id.split('/');
          return (
            <div className="col-md-10 col-md-offset-1" key={doc.id}>
              <div className="well" >
                  <a href={doc.og_url}>
                    <h3>
                        {doc.dc_title}
                    </h3>
                  </a>
                  <p>
                    <b>Description: </b> {doc.description}
                  </p>
                  <p>
                    <b>Id: </b> {doc.id}
                  </p>
                  <p>
                    <b>Url: </b> <a href={doc.og_url}>{doc.og_url}</a>
                  </p>
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
