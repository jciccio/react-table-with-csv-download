import React, { Component } from "react";
import { Scrollbars } from "react-custom-scrollbars";

import "./logViewer.css";
import MdFileDownload from "react-icons/lib/md/file-download";


/**
 * TableViewer component
 *
 * @version 0.1.10
 * @author [Jose Antonio Ciccio](https://github.com/jciccio)
 */
class TableViewer extends Component {
  constructor(props) {
    super(props);
    this.generateAndDownloadCSV = this.generateAndDownloadCSV.bind(this);
  }

  generateAndDownloadCSV() {
    var csvContent = "data:text/csv;charset=utf-8,";
    var data = this.props.content;
    var headers = [];
    this.props.content.forEach(function(rowObj) {
      if (headers === undefined || headers.length === 0) {
        for (let property in rowObj) {
          if (rowObj.hasOwnProperty(property)) {
            headers.push(property);
          }
        }
        let row = headers.join(",");
        csvContent += row + "\r\n";
      }
      var rowData = [];
      for (var i in headers) {
        rowData.push(rowObj[headers[i]]);
      }
      let row = rowData.join(",");
      csvContent += row + "\r\n";
    });
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    let filename = this.props.filename? this.props.filename : "logResults.csv";
    
    link.setAttribute("download", filename);
    link.innerHTML = "Download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

 /* static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.csvText !== prevState.csvText) {
      let Papa = require("papaparse/papaparse.min.js");
      let data = Papa.parse(nextProps.csvText);
      return { 
        csv: data,
        csvText: nextProps.csvText
      }
    }  
    return null;
  }

  shouldComponentUpdate(nextProps, nextState){
    return (this.state.csvText !== nextState.csvText);
  }*/

  renderDownload() {
    if (this.props.activateDownloadButton) {
      return (
        <div className="csvFileDownloader">
          <button
            download={this.props.csvFileName}
            onClick={this.generateAndDownloadCSV}
          >
            <MdFileDownload size={30} color="green" /> {this.props.downloadName ? his.props.downloadName : "Download Table Data"}
          </button>
        </div>
      );
    } 
    else {
      return null;
    }
  }

  render() {
    var height = {height: this.props.maxHeight}
    return (
      <div className="logViewer">
        {this.renderStats()}
        {this.renderDownload()}
        <div className="divTable"  style={height}>
          <div className="divTableHeading">{this.renderHeaders()}</div>
          <div className="divTableBody">{this.renderBody()}</div>
        </div>
      </div>
    );
  }

  renderBody() {
    var rows = this.props.content;
    var headers  = this.props.headers;

    if (rows !== null){
      return rows.map((row, i) => {
        return this.getRow(row,i);
      });
    }
    else {
      return (null);
    }

  }

  getRow(row, i){
    return(
      <div 
        key={`table_row_${i} `} 
        className={`divTableRow logViewerSuccess_${row.success}`}
        style={this.props.bodyCss}
      >
        {this.renderRow(row,i)}
      </div>
    )
  }

  renderRow(row, i){
    var headers = this.props.headers;
    if (row){
      var rowContent = headers.map((header, element) => {
        return (
          <div 
          key={`table_row_${i}_cell_${element}`} 
          className="divTableCell">
            {row[header]}
          </div>
        )
      });
      return rowContent;
    }
    else {
      return null;
    }
   /* 
    return headers.map(function(header, i) {
      return (
        <td className={`header`}>{row[header]}</td>
      );
    });*/
  }

  renderHeaders() {
    let headers = this.props.headers;
    var headerCss = this.props.headerCss;
    if (headers){
      return (
        <div className="divTableRow">
        {headers.map(function(header, index) {
          return (
            <div key={`table_header_${index}`} className="divTableCell" style={headerCss}>
              {header}
            </div>
          );
        })}
        </div>
      );
    }
    else {
      return null;
    }
  }

  renderStats(){
    if (this.props.renderStats){
      return (
        <div>
        <label>{this.props.title}</label>
        <br />
        <label className="logViewerSuccess_true">
          Success: {this.props.successRows}
        </ label>
        <br />
        <label className="logViewerSuccess_false">
          Error: {this.props.errorsRows}
        </ label>
        <br />
        <label>-----------------------------</label>
        <br />
        <label>Total: {this.props.totalRows}</label>
        <br />
        </div>
      );
    }
    else{
      return null;
    }
  }

}

export default TableViewer;
