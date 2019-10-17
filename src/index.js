import React, { Component } from "react";
import { Scrollbars } from "react-custom-scrollbars";
import MdFileDownload from "react-icons/lib/md/file-download";
import Search from "react-icons/lib/md/search";
import Paginator from 'react-js-paginator';
import SearchBar from 'react-js-search';
import FileSaver from 'file-saver/FileSaver';
import PropTypes from 'prop-types';
import ReactHtmlParser from "react-html-parser";
import "./style.css";

/**
 * TableViewer component
 * @author [Jose Antonio Ciccio](https://github.com/jciccio)
 */

class TableViewer extends Component {
  constructor(props) {
    super(props);
    this.generateAndDownloadCSV = this.generateAndDownloadCSV.bind(this);
    this.state = {
      currentPage: 1,
      searchResults: null
    };

    if(this.props.content && this.props.sortColumn){
      this.sortTable()
    }
  }

 highlightSyntax(json) {
    if (json) {
      json = json
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      return json.replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
        function(match) {
          var cls = "hljs-number";
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = "hljs-key";
            } else {
              cls = "hljs-string";
            }
          } else if (/true|false/.test(match)) {
            cls = "hljs-boolean";
          } else if (/null/.test(match)) {
            cls = "hljs-null";
          }
          return '<span class="' + cls + '">' + match + "</span>";
        }
      );
    } else {
      return "";
    }
  }

  componentDidUpdate(prevProps){
    if(prevProps.content !== this.props.content && this.props.sortColumn){
      this.sortTable();
    }
  }

  sortTable(){
    let criteria = this.props.sortColumn;
    if (criteria){
      this.props.content.sort(this.compare(criteria));
    }
  }

  compare(criteria) {
    return (a,b) => {
      if (a[criteria] < b[criteria])
        return -1;
      if (a[criteria] > b[criteria])
        return 1;
      return 0;
    }
  }

  generateAndDownloadCSV() {
    let encoding = this.props.encoding ? this.props.encoding : "UTF-8";
    let csvType = {encoding:encoding,type:"text/plain;charset="+encoding};
    let filename = this.props.filename? this.props.filename : "logResults.csv";
    var csvContent = "";
    var data = this.props.content;
    var headers = [];
    this.props.content.forEach(function(rowObj) {
      if (headers === undefined || headers.length === 0) {
        for (let property in rowObj) {
          if (rowObj.hasOwnProperty(property)) {
            headers.push(property);
          }
        }
      }
      else{
        for (let property in rowObj) {
          if (rowObj.hasOwnProperty(property)) {
            if (headers.indexOf(property) == -1){
              headers.push(property);
            }
          }
        }
        var rowData = [];
        for (var i in headers) {
          let data = rowObj[headers[i]];
          if (data && typeof data == "string" && data.indexOf(",") >= 0 ){
            data = `"${data.replace(/"/g, '""')}"`;
          }
          rowData.push(data);
        }
        let row = rowData.join(",");
        csvContent += row + "\r\n";
      }
      
    });
    let row = headers.join(",");
    csvContent = row +"\r\n"+ csvContent ;
    var blob = new Blob([csvContent], csvType);
    FileSaver.saveAs(blob, filename);
  }

  renderDownload() {
    if (this.props.activateDownloadButton) {
      let buttonStyle = this.props.downloadButtonStyle ? this.props.downloadButtonStyle : {};
      return (
        <div className="csvFileDownloader">
          <button 
            style={buttonStyle}
            download={this.props.csvFileName}
            onClick={this.generateAndDownloadCSV}
          >
            <MdFileDownload 
            size={30} 
            color="green"/> 
            {this.props.downloadName ? this.props.downloadName : "Download Table Data"}
          </button>
        </div>
      );
    } 
    else {
      return null;
    }
  }

  renderTitle(){
    let titleStyle = this.props.titleStyle ? this.props.titleStyle : {};
    if(Array.isArray(this.props.content) &&  this.props.content.length > 0){
      return(
        <h2 className="tableTitle" style={titleStyle}>{this.props.title}</h2>
      );
    }
    else{
      return null;
    }
  }

  render() {
    let tableStyle = this.props.tableStyle ? this.props.tableStyle : {};
    var height = {maxHeight: this.props.maxHeight, ...tableStyle};
    return (
      <div className="tableWithCSV" >
        {this.renderTitle()}
        {this.renderStats()}
        <div className="titleContainer">
          {this.renderDownload()}
          {this.renderTopPagination()}
          <div className="search-container">
            {this.renderSearch()}
          </div>
        </div>

        <div className="divTableContainer" >
          <div className="divTable" style={height}>
            <div className="divTableHeading">{this.renderHeaders()}</div>
            <div className="divTableBody">{this.renderBody()}</div>
          </div>
        </div>
        {this.renderPagination()}
      </div>
    );
  }

  onSearch(term, elements){
    if (term.length > 0){
      this.setState({searchResults: elements})
    }
    else{
      this.setState({searchResults: null})
    }
    this.pageChange(1);
  }

  renderSearch(){
    if(this.props.searchEnabled){
      let search = "Search...";
      if (this.props.placeholderSearchText){
        search = this.props.placeholderSearchText;
      }

      let caseInsensitive = this.props.caseInsensitive ? true : false;

      return (
        <SearchBar 
          onSearchTextChange={(b,e) => {this.onSearch(b,e)}}
          onSearchButtonClick={(b,e) => {this.onSearch(b,e)}}
          placeHolderText={search}
          data={this.props.content}
          caseInsensitive={caseInsensitive}
        />
        )
    }
    else{
      return null;
    }
  }

  renderTopPagination(){
    if (this.props.topPagination){
      return this.renderPagination(true);
    }
    return null;
  }

  renderPagination(isTop = false){
    if (this.props.pagination || isTop){
      var boxStyle = this.props.pageBoxStyle ? this.props.pageBoxStyle: {};
      var activeStyle = this.props.activePageBoxStyle ? this.props.activePageBoxStyle: {}
      var pagesDisplay = this.props.maxPagesToDisplay ? this.props.maxPagesToDisplay : 5;
      if(this.props.content.length <= this.props.pagination){
        return null;
      }
      else{
        let totalElements = this.props.content.length;
        if (this.state.searchResults){
          totalElements = this.state.searchResults.length
        }
        return(
          <Paginator
            pageSize={this.props.pagination}
            totalElements={totalElements}
            onPageChangeCallback={(e) => {this.pageChange(e)}}
            pageBoxStyle={boxStyle}
            activePageBoxStyle={activeStyle}
            maxPagesToDisplay={pagesDisplay}
          />
        );
      }
    }
    else{
      return null;
    }
  }

  pageChange(page){
    this.setState({currentPage: page});
  }

  renderAllRows(){
    var rows = this.props.content;
    var headers  = this.props.headers;
    return rows.map((row, i) => {
      return this.getRow(row,i);
    });
  }

  renderRowPage(rows){
    let rowsContent = []
    let pageStart = (this.state.currentPage-1) * this.props.pagination;
    var rowQty = rows.length; 
    var headers  = this.props.headers;

    for(var i = pageStart; i < pageStart+this.props.pagination && rows[i]; i++){
      rowsContent.push(this.getRow(rows[i], i));
    }

    return rowsContent;
  }

  renderBody() {
    var rows = this.state.searchResults || this.props.content;
    if (rows !== null){
      if(this.props.pagination){
        return this.renderRowPage(rows);
      }else{
        return this.renderAllRows(rows);
      }
    }
    else {
      return (null);
    }

  }

  getRow(row, i){
    let isWarning = row.warning || false;
    let isSucccess = row.success;
    let fontColor = "#000000";
    if(isWarning){
      fontColor = (this.props.warningColor ) ? this.props.warningColor : '#ba8722';
    }
    else if (isSucccess === true){
      fontColor = (this.props.successColor ) ? this.props.successColor : '#0b7012';
    }
    else if (isSucccess=== false){ // because can be undefined
      fontColor = (this.props.errorColor ) ? this.props.errorColor : '#b30009';
    }

    return(
      <div 
        key={`table_row_${i} `} 
        className={`divTableRow`}
        style={{...this.props.bodyCss, ...{"color":fontColor}} }
      >
        {this.renderRow(row,i)}
      </div>
    )
  }

  renderLineNumber(i){
    return (
      <div 
        key={`table_row_number_${i}`} 
        className="divTableCell">
        {i}
      </div>
    )
  }

  renderNumberHeader(headerCss){
    if(this.props.renderLineNumber){
      return (
        <div key={`table_header_line`} className="divTableCell" style={headerCss}>
          Line
        </div>
      );
    }
    else{
      return null;
    }
  }

  renderRow(row, i){
    var headers = this.props.headers;
    if (row){
      let rowData = [];
      // Render line number
      if(this.props.renderLineNumber){
        let number = i+1;
        if (this.props.reverseLineNumber){
          number = this.props.content.length - i;
        }
        rowData.push(this.renderLineNumber(number));
      }

      // Create content
      let rowContent = headers.map((header, element) => {
        let content = row[header];
        let isJson = false;
        try {
          if (isNaN(content)){
            content = JSON.parse(content);
            isJson = true;
          }
        } catch (e) {
          content = row[header];
          isJson = false;
        }
        if (isJson){
          let jsonText = JSON.stringify(content,undefined,2);
          let highlight = this.highlightSyntax(jsonText);
          let parsedHtml = ReactHtmlParser(highlight, true);
          return (
            <div 
              key={`table_row_${i}_cell_${element}`} 
              className="divTableCell">
              <pre>
                {parsedHtml}
              </pre>
            </div>
          )
        }
        else{
          return (
            <div 
              key={`table_row_${i}_cell_${element}`} 
              className="divTableCell">
              {content}
            </div>
          )
        }
        
      });
      return [...rowData, ...rowContent];
    }
    else {
      return null;
    }
  }

  renderHeaders() {
    let headers = this.props.headers;
    var headerCss = this.props.headerCss;
    if (headers){
      return (
        <div className="divTableRow">
          {this.renderNumberHeader(headerCss)}
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
        <label className="tableWithCSVSuccess_true">
          Success: {this.props.successRows}
        </label>
        <br />
        <label className="tableWithCSVSuccess_false">
          Error: {this.props.errorsRows}
        </label>
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

TableViewer.propTypes = {
  content: PropTypes.array.isRequired,
  headers: PropTypes.array.isRequired,
  minHeight: PropTypes.number.isRequired, 
  maxHeight: PropTypes.number.isRequired,
  activateDownloadButton: PropTypes.bool,
  topPaginator: PropTypes.bool,
  headerCss:PropTypes.object,
  titleStyle:PropTypes.object,
  bodyCss: PropTypes.object,
  filename:PropTypes.string,
  renderLineNumber:PropTypes.bool,
  reverseLineNumber:PropTypes.bool,
  pagination: PropTypes.number,
  pageBoxStyle:PropTypes.object,
  activePageBoxStyle:PropTypes.object,
  maxPagesToDisplay: PropTypes.number,
  downloadButtonStyle:PropTypes.object,
  sortColumn:PropTypes.string,
  encoding:PropTypes.string,
  successColor: PropTypes.string,
  warningColor: PropTypes.string,
  errorColor: PropTypes.string
};

export default TableViewer;
