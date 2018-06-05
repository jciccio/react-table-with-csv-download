import React, { Component } from 'react';
import TableViewer from 'react-table-with-csv-download';
import './App.css';

class App extends Component {

  constructor(props) {
    super(props);

    let headers = ["number", "position", "name"];

    let table = [ {number: 12, name: "Del Piero", position: "ST"},
      {number: 21, name: "Pirlo", position: "MC"},
      {number: 10, name: "Ruiz", position: "MDI"},
      {number: 7, name: "Nesta", position: "RB"},
      {number: 4, name: "Cannavaro", position: "CB"},
      {number: 2, name: "Puyol", position: "CB"},
      {number: 15, name: "Abate", position: "LB"},
      {number: 16, name: "Locatelli", position: "MDI"},
      {number: 1, name: "Buffon", position: "GK"},
      {number: 8, name: "Gattusso", position: "MD"}
    ]

    this.state = {
      table: table,
      headers: headers,
      activateDownloadButton:true
    };
    
  }

  

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Table Component</h1>
        </header>

        <body>
        <h1> Table example: </h1>
          <TableViewer
            title="Lineup"
            content={this.state.table}
            headers={this.state.headers}
            minHeight={0}
            maxHeight={400}
            activateDownloadButton={this.state.activateDownloadButton}
          />
        </body>
      </div>
    );
  }
}

export default App;
