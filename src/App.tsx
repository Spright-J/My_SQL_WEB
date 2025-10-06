import { useState } from "react";
import Upload from "./components/upload/Upload";
import TableViewer from "./components/upload/table";
import Navbar from "./components/Navbar";

function App() {
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [availableTables, setAvailableTables] = useState<string[]>([]);

  // This callback will be passed to Upload to get fileName and selectedTable
  const handleUploadResult = (
    fileName: string | null,
    table: string | null,
    tables?: string[]
  ) => {
    setUploadedFile(fileName);
    setSelectedTable(table);
    if (tables) {
      setAvailableTables(tables);
    }
  };

  const handleTableChange = (table: string) => {
    setSelectedTable(table);
  };

  const handleNewUpload = () => {
    setUploadedFile(null);
    setSelectedTable(null);
    setAvailableTables([]);
  };

  return (
    <div className="min-vh-100">
      <Navbar
        uploadedFile={uploadedFile}
        selectedTable={selectedTable}
        availableTables={availableTables}
        onTableChange={handleTableChange}
        onNewUpload={handleNewUpload}
      />

      {!uploadedFile ? (
        <Upload
          onTableSelect={(fileName: string, table: string, tables?: string[]) =>
            handleUploadResult(fileName, table, tables)
          }
        />
      ) : uploadedFile && selectedTable ? (
        <TableViewer fileName={uploadedFile} table={selectedTable} />
      ) : (
        <div className="container-fluid py-5">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-6">
              <div className="card shadow-sm border-0">
                <div className="card-body text-center py-5">
                  <i className="bi bi-table display-1 text-muted mb-4"></i>
                  <h4 className="text-muted">
                    Select a table from the navigation menu above
                  </h4>
                  <p className="text-muted">Choose a table to view its data</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
