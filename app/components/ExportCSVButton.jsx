'use client';

import { Button } from 'react-bootstrap';
import { FaDownload } from 'react-icons/fa';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

export default function ExportCSVButton({ data, filename = 'export.csv', disabled }) {
  const handleExport = () => {
    if (!data || data.length === 0) return;

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, filename);
  };

  return (
    <Button
      variant="outline-secondary"
      onClick={handleExport}
      disabled={disabled || !data || data.length === 0}
    >
      <FaDownload className="me-2" />
      Export CSV
    </Button>
  );
}
