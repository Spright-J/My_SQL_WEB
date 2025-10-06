import React from 'react';

interface NavbarProps {
  uploadedFile: string | null;
  selectedTable: string | null;
  availableTables: string[];
  onTableChange: (table: string) => void;
  onNewUpload: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  uploadedFile,
  selectedTable,
  availableTables,
  onTableChange,
  onNewUpload
}) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark shadow-sm" style={{ backgroundColor: 'var(--dark-bg-tertiary)' }}>
      <div className="container-fluid">
        <a className="navbar-brand fw-bold" href="#">
          <i className="bi bi-database-fill me-2"></i>
          SQLite Database Viewer
        </a>
        
        {uploadedFile && (
          <div className="navbar-nav ms-auto">
            <div className="nav-item dropdown">
              <button
                className="btn btn-outline-light dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="bi bi-table me-2"></i>
                {selectedTable || 'Select Table'}
              </button>
              <ul className="dropdown-menu">
                {availableTables.map((table) => (
                  <li key={table}>
                    <button
                      className={`dropdown-item ${selectedTable === table ? 'active' : ''}`}
                      onClick={() => onTableChange(table)}
                    >
                      <i className="bi bi-table me-2"></i>
                      {table}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="nav-item ms-3">
              <button
                className="btn btn-outline-light"
                onClick={onNewUpload}
                title="Upload New Database"
              >
                <i className="bi bi-upload me-2"></i>
                New Upload
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
