import React, { useEffect, useState } from "react";

interface TableViewerProps {
  fileName: string;
  table: string;
}

const PAGE_SIZE_OPTIONS = [25, 50, 75, 100];

const TableViewer: React.FC<TableViewerProps> = ({ fileName, table }) => {
  const [allData, setAllData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [filters, setFilters] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setPage(1); // Reset to first page when table changes
    setFilters({}); // Reset filters when table changes
  }, [table, fileName, pageSize]);

  useEffect(() => {
    if (!fileName || !table) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all data for the selected table
        const response = await fetch("http://localhost:443/v1/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName, table }),
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch table data");
        }
        setAllData(result.result || []);
        if (result.result && result.result.length > 0) {
          setColumns(Object.keys(result.result[0]));
        } else {
          setColumns([]);
        }
      } catch (err: any) {
        setError(err.message);
        setAllData([]);
        setColumns([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fileName, table]);

  // Filter data based on active filters
  const filteredData = allData.filter((row) => {
    return columns.every((column) => {
      const filterValue = filters[column];
      if (!filterValue) return true;

      const cellValue = row[column]?.toString().toLowerCase() || "";
      return cellValue.includes(filterValue.toLowerCase());
    });
  });

  // Calculate paged data from filtered data
  const totalRows = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const pagedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  // Handle filter changes
  const handleFilterChange = (column: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
    setPage(1); // Reset to first page when filtering
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({});
    setPage(1);
  };

  // If pageSize or data changes, reset to first page if current page is out of bounds
  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [pageSize, totalRows, totalPages, page]);

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div
              className="card-header border-0 py-3"
              style={{ backgroundColor: "var(--dark-bg-tertiary)" }}
            >
              <div className="row align-items-center">
                <div className="col-md-6">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-table me-2 text-primary"></i>
                    Table: <span className="text-primary fw-bold">{table}</span>
                  </h5>
                </div>
                <div className="col-md-6">
                  <div className="d-flex justify-content-md-end align-items-center gap-3">
                    <div className="d-flex align-items-center">
                      <label
                        htmlFor="pageSizeSelect"
                        className="form-label me-2 mb-0"
                      >
                        <i className="bi bi-list-ol me-1"></i>
                        Rows per page:
                      </label>
                      <select
                        id="pageSizeSelect"
                        className="form-select form-select-sm"
                        style={{ width: "auto" }}
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setPage(1);
                        }}
                      >
                        {PAGE_SIZE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                    <span className="text-muted small">
                      <i className="bi bi-info-circle me-1"></i>
                      Showing {pagedData.length} of {totalRows} rows
                      {Object.keys(filters).some((key) => filters[key]) && (
                        <span className="ms-2">
                          <i className="bi bi-funnel me-1"></i>
                          Filtered from {allData.length} total rows
                        </span>
                      )}
                    </span>
                    {Object.keys(filters).some((key) => filters[key]) && (
                      <button
                        className="btn btn-outline-secondary btn-sm ms-2"
                        onClick={clearAllFilters}
                        title="Clear all filters"
                      >
                        <i className="bi bi-x-circle me-1"></i>
                        Clear Filters
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Loading table data...</p>
                </div>
              ) : error ? (
                <div className="alert alert-danger m-4" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0 table-bordered">
                    <thead
                      style={{ backgroundColor: "var(--dark-bg-tertiary)" }}
                    >
                      <tr>
                        {columns.map((col) => (
                          <th key={col} className="text-nowrap border-end">
                            <i className="bi bi-columns me-1"></i>
                            {col}
                          </th>
                        ))}
                      </tr>
                      <tr
                        style={{ backgroundColor: "var(--dark-bg-secondary)" }}
                      >
                        {columns.map((col) => (
                          <td key={`filter-${col}`} className="border-end p-2">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder={`Filter ${col}...`}
                              value={filters[col] || ""}
                              onChange={(e) =>
                                handleFilterChange(col, e.target.value)
                              }
                              style={{
                                backgroundColor: "var(--dark-bg-tertiary)",
                                borderColor: "var(--dark-border)",
                                color: "var(--dark-text-primary)",
                              }}
                            />
                          </td>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pagedData.length === 0 ? (
                        <tr>
                          <td
                            colSpan={columns.length}
                            className="text-center py-5"
                          >
                            <i className="bi bi-inbox display-4 text-muted mb-3"></i>
                            <p className="text-muted">No data available</p>
                          </td>
                        </tr>
                      ) : (
                        pagedData.map((row, idx) => (
                          <tr key={idx}>
                            {columns.map((col) => (
                              <td key={col} className="text-nowrap border-end">
                                {row[col]?.toString() || (
                                  <span className="text-muted">—</span>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div
              className="card-footer border-0 py-3"
              style={{ backgroundColor: "var(--dark-bg-tertiary)" }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <i className="bi bi-chevron-left me-1"></i>
                    Previous
                  </button>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                    <i className="bi bi-chevron-right ms-1"></i>
                  </button>
                </div>
                <span className="text-muted">
                  Page {page} of {totalPages}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableViewer;
