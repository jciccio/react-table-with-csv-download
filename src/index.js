import React, { Component } from "react";
import { Scrollbars } from "react-custom-scrollbars";

import "./logViewer.css";
import MdFileDownload from "react-icons/lib/md/file-download";

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
    link.setAttribute("download", "logResults.csv");
    link.innerHTML = "Download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  

  renderDownload() {
    if (this.props.activateDownloadButton) {
      return (
        <div class="csvFileDownloader">
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
    return (
      <div className="logViewer">

        {this.renderStats()}
        {this.renderDownload()}

        <Scrollbars
          autoHeight
          autoHeightMin={this.props.minHeight}
          autoHeightMax={this.props.maxHeight}
        >
          <table className="logViewerTable">
            <thead>{this.renderHeaders()}</thead>
            {this.renderBody()}
          </table>
        </Scrollbars>
      </div>
    );
  }


  renderRow(row){
    var headers = this.props.headers;
    return headers.map(function(header, i) {
      return (
        <td className={`header${i}`}>{row[header]}</td>
      );
    });
  }
 

  renderBody() {
    var rows = this.props.content;
    var headers  = this.props.headers;
    var bodyStyle = this.props.bodyCss;
    return rows.map(function(row, i) {
      return (
        <tr
          key={"rowNumber_" + i}
          className={`logViewerBody logViewerSuccess_${row.success}`}
          style={bodyStyle}
        >
          
          { headers.map(function(header, i) {
            return (
              <td className={`header${i}`}>{row[header]}</td>
            );
          })}
        </tr>
      );
    });
  }

  renderHeaders() {
    let headers = this.props.headers;
    var headerCss = this.props.headerCss;
    if (headers){
      return (
        <tr>
        {headers.map(function(header, i) {
          return (
              <th className="logViewerTableHeader" style={headerCss}>
                <div>{header}</div>
              </th>
          );
        })}
        </tr>
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
