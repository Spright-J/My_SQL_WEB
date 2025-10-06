import React, { useState } from "react";

interface UploadProps {
  onTableSelect: (fileName: string, table: string, tables?: string[]) => void;
}

function Upload({ onTableSelect }: UploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    fileName: string;
    tables: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setResult(null);
    setError(null);
    setSelectedTable("");
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    setUploading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:443/v1/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Upload failed");
      }
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container-fluid py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-xl-6">
          <div className="card shadow-lg border-0">
            <div
              className="card-header text-center py-4"
              style={{
                backgroundColor: "var(--dark-bg-tertiary)",
                color: "var(--dark-text-primary)",
              }}
            >
              <i className="bi bi-cloud-upload display-4 mb-3"></i>
              <h2 className="card-title mb-0">Upload SQLite Database</h2>
              <p className="card-text mt-2 mb-0 opacity-75">
                Select a .sqlite, .db, or .sqlite3 file to get started
              </p>
            </div>
            <div className="card-body p-5">
              <form onSubmit={handleUpload}>
                <div className="mb-4">
                  <label htmlFor="fileInput" className="form-label fw-semibold">
                    <i className="bi bi-file-earmark-arrow-up me-2"></i>
                    Choose Database File
                  </label>
                  <input
                    id="fileInput"
                    type="file"
                    className="form-control form-control-lg"
                    accept=".sqlite,.db,.sqlite3"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                  <div className="form-text">
                    Supported formats: .sqlite, .db, .sqlite3
                  </div>
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={uploading || !file}
                  >
                    {uploading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-upload me-2"></i>
                        Upload Database
                      </>
                    )}
                  </button>
                </div>
              </form>

              {error && (
                <div className="alert alert-danger mt-4" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </div>
              )}

              {result && (
                <div className="mt-4">
                  <div className="alert alert-success" role="alert">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    <strong>File uploaded successfully:</strong>{" "}
                    {result.fileName}
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="tableSelect"
                      className="form-label fw-semibold"
                    >
                      <i className="bi bi-table me-2"></i>
                      Select a table to view:
                    </label>
                    <select
                      id="tableSelect"
                      className="form-select form-select-lg"
                      value={selectedTable}
                      onChange={(e) => {
                        setSelectedTable(e.target.value);
                        if (e.target.value && result) {
                          onTableSelect(
                            result.fileName,
                            e.target.value,
                            result.tables
                          );
                        }
                      }}
                    >
                      <option value="">Choose a table...</option>
                      {result.tables && result.tables.length > 0 ? (
                        result.tables.map((table) => (
                          <option key={table} value={table}>
                            {table}
                          </option>
                        ))
                      ) : (
                        <option disabled>No tables found</option>
                      )}
                    </select>
                  </div>

                  {selectedTable && (
                    <div className="alert alert-info" role="alert">
                      <i className="bi bi-info-circle-fill me-2"></i>
                      <strong>Selected table:</strong> {selectedTable}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Upload;
