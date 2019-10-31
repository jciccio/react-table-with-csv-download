import React, { Component } from 'react';
import TableViewer from 'react-js-table-with-csv-dl';
import './App.css';

class App extends Component {

  constructor(props) {
    super(props);

    let headers = ["number", "position", "name", "metadata"];


    let json = {
      "Key1": {"id":10,"values":"1-2"},
      "Key2":{},
      "Key3":"(Zone 1)",
      "description":"","array":[100],
      "array2":[],
      "Object":[{"id":1000,"values":"K-1"}]};

    let text = '"Gianluigi\nBuffon"';

    let table = [ 
      {number: 12, name:text,  success: true},
      {number: 21, name: "Pirlo", metadata: JSON.stringify(json), success: false},
      {number: 10, name: "Ruiz", position: "MDI"},
      {number: 7, name: "Nesta", position: "RB"},
      {number: 4, name: "Cannavaro", metadata: JSON.stringify(json), age: 38},
      {number: 2, name: "Puyol", position: "CB", success: false, foot: "lefty"},
      {number: 15, name: "Bonaventura", position: "MD", warning:true}
    ]

    this.state = {
      table: table,
      headers: headers,
      activateDownloadButton:true
    };
    
  }

  render() {
    let overallStyle = {"width":'auto'};
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Table Component</h1>
        </header>

        <h1> Table example: </h1>
          <TableViewer
            title="Lineup"
            content={this.state.table}
            headers={this.state.headers}
            minHeight={0}
            maxHeight={400}
            activateDownloadButton={this.state.activateDownloadButton}
            pagination={5}
            renderLineNumber
            reverseLineNumber
            searchEnabled
            sortColumn={"name"}
            topPagination
            tableStyle={overallStyle}
            titleStyle={{'textAlign':'left'}}
          />
      </div>
    );
  }
}

export default App;
