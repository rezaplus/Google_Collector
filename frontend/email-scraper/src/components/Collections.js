import React, { useState, useEffect } from "react";
import "./../assets/css/CollectedData.css";
import * as XLSX from "xlsx"; // Import XLSX library for Excel export
import { saveAs } from "file-saver"; // Import file-saver for saving files
import { Dropdown, DropdownButton } from "react-bootstrap"; // Import Bootstrap components

const CollectedData = () => {
  const [data, setData] = useState([]);
  const [filterEmails, setFilterEmails] = useState(
    filterHistory("filterEmails")
  );
  const [filterPhoneNumbers, setFilterPhoneNumbers] = useState(
    filterHistory("filterPhoneNumbers")
  );
  const [search, setSearch] = useState(filterHistory("search"));
  const [selectedColumn, setSelectedColumn] = useState(
    filterHistory("selectedColumn")
  );

  function filterHistory(filter) {
    const savedFilters = JSON.parse(localStorage.getItem("filterHistory"));
    if (savedFilters) {
      return savedFilters[filter] || "";
    }
    return "";
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Save filter history to localStorage
    const filterHistory = {
      filterEmails,
      filterPhoneNumbers,
      search,
      selectedColumn,
    };
    localStorage.setItem("filterHistory", JSON.stringify(filterHistory));
  }, [filterEmails, filterPhoneNumbers, search, selectedColumn]);

  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:3000/collected-data?page=1&limit=100000000000");
      const jsonData = await response.json();

      // define column names
      const columns = [
        "title",
        "domain",
        "emails",
        "phoneNumbers",
        "cms",
        "lang",
        "query",
      ];

      let sortedData = [];

      // filter out columns that are not in the columns array
      sortedData = jsonData.map((row) => {
        const newRow = {};
        columns.forEach((column) => {
          newRow[column] = row[column];
        });
        return newRow;
      });

      // reverse
      sortedData = sortedData.reverse();

      setData(sortedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const applyFilters = () => {
    let filteredData = [...data];

    if (filterEmails) {
      filteredData = filteredData.filter(
        (row) => row.emails && row.emails.length > 0 && !row.emails.includes("Error") && !row.emails.includes("Unknown")
      );
    }

    if (filterPhoneNumbers) {
      filteredData = filteredData.filter(
        (row) => row.phoneNumbers && row.phoneNumbers.length > 0 && !row.phoneNumbers.includes("Error") && !row.phoneNumbers.includes("Unknown")
      );
    }

    if (search) {
      filteredData = filteredData.filter((row) => {
        if (selectedColumn === "All Columns") {
          // Step 2: Check if search is for all columns
          return Object.values(row).some((value) => {
            if (typeof value === "string" && typeof search === "string") {
              return value.toLowerCase().includes(search.toLowerCase());
            }
            return false;
          });
        } else {
          // Step 3: Search only within the selected column
          const value = row[selectedColumn] || "";
          return (
            typeof value === "string" &&
            typeof search === "string" &&
            value.toLowerCase().includes(search.toLowerCase())
          );
        }
      });
    }

    return filteredData;
  };

  // Export data to Excel format
  const exportFilteredToExcel = () => {
    const filteredData = applyFilters();
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";
    const exportData = filteredData.map((row) => {
      const newRow = {};
      Object.keys(row).forEach((key) => {
        newRow[key] = row[key];
      });
      return newRow;
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const fileData = new Blob([excelBuffer], { type: fileType });
    saveAs(fileData, ExportFileName(fileExtension));
  };

  // Export data to JSON format
  const exportFilteredToJSON = () => {
    const filteredData = applyFilters();
    const fileData = new Blob([JSON.stringify(filteredData)], {
      type: "application/json",
    });
    saveAs(fileData, ExportFileName("json"));
  };

  // Export data to CSV format
  const exportFilteredToCSV = () => {
    const filteredData = applyFilters();
    const csvData = filteredData
      .map((row) => Object.values(row).join(","))
      .join("\n");
    const fileData = new Blob([csvData], { type: "text/csv" });
    saveAs(fileData, ExportFileName("csv"));
  };

  function ExportFileName(fileExtension) {
    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();
    return `collection_${day}-${month}-${year}_${hour}-${minute}-${second}.${fileExtension}`;
  }

  return (
    <div className="container">
      <h1 className="text-center mb-5 display-4 fw-semibold">Collections</h1>
      <div className="container">
        <div className="row justify-content-center w-100">
          <div className="col-12">
            <form className="row g-3 align-items-center">
              <div className="col-auto">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={filterEmails}
                    onChange={() => setFilterEmails(!filterEmails)}
                    id="filterEmails"
                  />
                  <label className="form-check-label" htmlFor="filterEmails">
                    Filter by Emails
                  </label>
                </div>
              </div>
              <div className="col-auto">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={filterPhoneNumbers}
                    onChange={() => setFilterPhoneNumbers(!filterPhoneNumbers)}
                    id="filterPhoneNumbers"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="filterPhoneNumbers">
                    Filter by Phone Numbers
                  </label>
                </div>
              </div>
              <div className="col-5 ms-auto">
                <div className="input-group">
                  <select
                    className="form-select w-25"
                    value={selectedColumn}
                    onChange={(e) => setSelectedColumn(e.target.value)}
                  >
                    <option value="All Columns">All Columns</option>
                    {Object.keys(data[0] || {}).map((key) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    className="form-control w-75"
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              {Object.keys(data[0] || {}).map((key) => (
                <th key={key} className="scrollable-cell text-capitalize"> {key} </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {applyFilters().map((row, index) => (
                <tr key={index}>
                {Object.values(row).map((value, index) => (
                  <td key={index} className="scrollable-cell">
                    {Array.isArray(value) ? (
                      <div className="d-flex flex-wrap gap-1">
                        {value.map((item, index) => (
                          <span key={index} className="badge bg-secondary me-1">
                            {item.includes("@") ? (
                              <a className="text-white text-decoration-none" href={`mailto:${item}`}>{item}</a>
                            ) :(
                                <a className="text-white text-decoration-none" href={`tel:${item}`}>{item}</a>
                            )}
                          </span>
                        ))}
                      </div>
                    ) : (
                      value
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {/* Your existing JSX code */}
        <div className="d-flex justify-content-end mb-5 mt-2">
          <DropdownButton id="exportDropdown" title="Export">
            <Dropdown.Item onClick={exportFilteredToExcel}>
              Export to Excel
            </Dropdown.Item>
            <Dropdown.Item onClick={exportFilteredToJSON}>
              Export to JSON
            </Dropdown.Item>
            <Dropdown.Item onClick={exportFilteredToCSV}>
              Export to CSV
            </Dropdown.Item>
          </DropdownButton>
        </div>
      </div>
    </div>
  );
};

export default CollectedData;
