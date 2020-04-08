import React, { Component } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import MdFileDownload from 'react-icons/lib/md/file-download';
import Search from 'react-icons/lib/md/search';
import Paginator from 'react-js-paginator';
import SearchBar from 'react-js-search';
import FileSaver from 'file-saver/FileSaver';
import PropTypes from 'prop-types';
import ReactHtmlParser from 'react-html-parser';
import './style.css';


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
      searchResults: null,
    };

    if (this.props.content && this.props.sortColumn) {
      this.sortTable();
    }
  }

  highlightSyntax(json) {
    if (json) {
      json = json
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      return json.replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
        (match) => {
          let cls = 'hljs-number';
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = 'hljs-key';
            } else {
              cls = 'hljs-string';
            }
          } else if (/true|false/.test(match)) {
            cls = 'hljs-boolean';
          } else if (/null/.test(match)) {
            cls = 'hljs-null';
          }
          return `<span class="${cls}">${match}</span>`;
        },
      );
    }
    return '';
  }

  componentDidUpdate(prevProps) {
    if (prevProps.content !== this.props.content && this.props.sortColumn) {
      this.sortTable();
    }
  }

  sortTable() {
    const criteria = this.props.sortColumn;
    if (criteria) {
      this.props.content.sort(this.compare(criteria));
    }
  }

  compare(criteria) {
    return (a, b) => {
      if (a[criteria] < b[criteria]) { return -1; }
      if (a[criteria] > b[criteria]) { return 1; }
      return 0;
    };
  }

  generateAndDownloadCSV() {
    const encoding = this.props.encoding ? this.props.encoding : 'UTF-8';
    const csvType = { encoding, type: `text/plain;charset=${encoding}` };
    const filename = this.props.filename ? this.props.filename : 'logResults.csv';
    let csvContent = '';
    const data = this.props.content;
    const headers = [];
    this.props.content.forEach((rowObj) => {
      if (headers === undefined || headers.length === 0) {
        for (const property in rowObj) {
          if (rowObj.hasOwnProperty(property)) {
            headers.push(property);
          }
        }
      } else {
        for (const property in rowObj) {
          if (rowObj.hasOwnProperty(property)) {
            if (headers.indexOf(property) == -1) {
              headers.push(property);
            }
          }
        }
      }
      const rowData = [];
      for (const i in headers) {
        let data = rowObj[headers[i]];
        if (data && typeof data === 'string' && data.indexOf(',') >= 0) {
          data = `"${data.replace(/"/g, '""')}"`;
        }
        rowData.push(data);
      }
      const row = rowData.join(',');
      csvContent += `${row}\r\n`;
    });
    const row = headers.join(',');
    csvContent = `${row}\r\n${csvContent}`;
    const blob = new Blob([csvContent], csvType);
    FileSaver.saveAs(blob, filename);
  }

  renderDownload() {
    if (this.props.activateDownloadButton) {
      const buttonStyle = this.props.downloadButtonStyle ? this.props.downloadButtonStyle : {};
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
            {this.props.downloadName ? this.props.downloadName : 'Download Table Data'}
          </button>
        </div>
      );
    }

    return null;
  }

  renderTitle() {
    const titleStyle = this.props.titleStyle ? this.props.titleStyle : {};
    if (Array.isArray(this.props.content) && this.props.content.length > 0) {
      return (
        <h2 className="tableTitle" style={titleStyle}>{this.props.title}</h2>
      );
    }

    return null;
  }

  render() {
    const tableStyle = this.props.tableStyle ? this.props.tableStyle : {};
    const height = { maxHeight: this.props.maxHeight, ...tableStyle };
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

  onSearch(term, elements) {
    if (term.length > 0) {
      this.setState({ searchResults: elements });
    } else {
      this.setState({ searchResults: null });
    }
    this.pageChange(1);
  }

  renderSearch() {
    if (this.props.searchEnabled) {
      let search = 'Search...';
      if (this.props.placeholderSearchText) {
        search = this.props.placeholderSearchText;
      }
      const caseInsensitive = !!this.props.caseInsensitive;
      return (
        <SearchBar
          onSearchTextChange={(b, e) => { this.onSearch(b, e); }}
          onSearchButtonClick={(b, e) => { this.onSearch(b, e); }}
          placeHolderText={search}
          data={this.props.content}
          caseInsensitive={caseInsensitive}
        />
      );
    }
    return null;
  }

  renderTopPagination() {
    if (this.props.topPagination) {
      return this.renderPagination(true);
    }
    return null;
  }

  renderPagination(isTop = false) {
    if (this.props.pagination || isTop) {
      const boxStyle = this.props.pageBoxStyle ? this.props.pageBoxStyle : {};
      const activeStyle = this.props.activePageBoxStyle ? this.props.activePageBoxStyle : {};
      const pagesDisplay = this.props.maxPagesToDisplay ? this.props.maxPagesToDisplay : 5;
      if (this.props.content.length <= this.props.pagination) {
        return null;
      }

      let totalElements = this.props.content.length;
      if (this.state.searchResults) {
        totalElements = this.state.searchResults.length;
      }
      return (
          <Paginator
            pageSize={this.props.pagination}
            totalElements={totalElements}
            onPageChangeCallback={(e) => { this.pageChange(e); }}
            pageBoxStyle={boxStyle}
            activePageBoxStyle={activeStyle}
            maxPagesToDisplay={pagesDisplay}
          />
      );
    }
    return null;
  }

  pageChange(page) {
    this.setState({ currentPage: page });
  }

  renderAllRows() {
    const rows = this.props.content;
    const { headers } = this.props;
    return rows.map((row, i) => this.getRow(row, i));
  }

  renderRowPage(rows) {
    const rowsContent = [];
    const pageStart = (this.state.currentPage - 1) * this.props.pagination;
    const rowQty = rows.length;
    const { headers } = this.props;
    for (let i = pageStart; i < pageStart + this.props.pagination && rows[i]; i++) {
      rowsContent.push(this.getRow(rows[i], i));
    }
    return rowsContent;
  }

  renderBody() {
    const rows = this.state.searchResults || this.props.content;
    if (rows !== null) {
      if (this.props.pagination) {
        return this.renderRowPage(rows);
      }
      return this.renderAllRows(rows);
    }

    return (null);
  }

  getRow(row, i) {
    const isWarning = row.warning || false;
    const isSucccess = row.success;
    let fontColor = '#000000';

    if (isSucccess === false) { // because can be undefined
      fontColor = (this.props.errorColor) ? this.props.errorColor : '#b30009';
    } else if (isWarning) {
      fontColor = (this.props.warningColor) ? this.props.warningColor : '#ba8722';
    } else if (isSucccess === true) {
      fontColor = (this.props.successColor) ? this.props.successColor : '#0b7012';
    }

    return (
      <div
        key={`table_row_${i} `}
        className={'divTableRow'}
        style={{ ...this.props.bodyCss, ...{ color: fontColor } } }
      >
        {this.renderRow(row, i)}
      </div>
    );
  }

  renderLineNumber(i) {
    return (
      <div
        key={`table_row_number_${i}`}
        className="divTableCell">
        {i}
      </div>
    );
  }

  renderNumberHeader(headerCss) {
    if (this.props.renderLineNumber) {
      return (
        <div key={'table_header_line'} className="divTableCell" style={headerCss}>
          Line
        </div>
      );
    }

    return null;
  }

  isFunction(functionToCheck) {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
  }

  renderRow(row, i) {
    const { headers } = this.props;
    if (row) {
      const rowData = [];
      // Render line number
      if (this.props.renderLineNumber) {
        let number = i + 1;
        if (this.props.reverseLineNumber) {
          number = this.props.content.length - i;
        }
        rowData.push(this.renderLineNumber(number));
      }
      // Create content
      const rowContent = headers.map((header, element) => {
        let content = row[header];
        let isJson = false;
        try {
          if (isNaN(content)) {
            content = JSON.parse(content);
            isJson = true;
          }
        } catch (e) {
          content = row[header];
          isJson = false;
          try{
            if (this.isFunction(content)){
              content = content();
            }
          }
          catch (e){
            if (content) {
              content = content.split('\n').map((item, i) => (<div  key={`part-${i}`}>{item}</div>));
            }
          }
        }
        if (isJson) {
          return this.renderJsonContent(content,i, element);
        }


        return (
          <div
            key={`table_row_${i}_cell_${element}`}
            className="divTableCell">
            { content }
          </div>
        );
      });
      return [...rowData, ...rowContent];
    }

    return null;
  }

  renderJsonContent(content,i,element){
    const jsonText = JSON.stringify(content, undefined, 2);
    const highlight = this.highlightSyntax(jsonText);
    const parsedHtml = ReactHtmlParser(highlight, true);
    return (
      <div
        key={`table_row_${i}_cell_${element}`}
        className="divTableCell">
        <pre>
          {parsedHtml}
        </pre>
      </div>
    );
  }

  renderHeaders() {
    const { headers } = this.props;
    const { headerCss } = this.props;
    if (headers) {
      return (
        <div className="divTableRow">
          {this.renderNumberHeader(headerCss)}
          {headers.map((header, index) => (
              <div key={`table_header_${index}`} className="divTableCell" style={headerCss}>
                {header}
              </div>
          ))}
        </div>
      );
    }

    return null;
  }

  renderStats() {
    if (this.props.renderStats) {
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

    return null;
  }
}

TableViewer.propTypes = {
  content: PropTypes.array.isRequired,
  headers: PropTypes.array.isRequired,
  minHeight: PropTypes.number.isRequired,
  maxHeight: PropTypes.number.isRequired,
  activateDownloadButton: PropTypes.bool,
  topPaginator: PropTypes.bool,
  headerCss: PropTypes.object,
  titleStyle: PropTypes.object,
  bodyCss: PropTypes.object,
  filename: PropTypes.string,
  renderLineNumber: PropTypes.bool,
  reverseLineNumber: PropTypes.bool,
  pagination: PropTypes.number,
  pageBoxStyle: PropTypes.object,
  activePageBoxStyle: PropTypes.object,
  maxPagesToDisplay: PropTypes.number,
  downloadButtonStyle: PropTypes.object,
  sortColumn: PropTypes.string,
  encoding: PropTypes.string,
  successColor: PropTypes.string,
  warningColor: PropTypes.string,
  errorColor: PropTypes.string,
};

export default TableViewer;
