'use client';

import { Button } from 'react-bootstrap';
import { FaFilePdf } from 'react-icons/fa';

export default function ExportPDFButton({
  data = [],
  filename = 'export.pdf',
  title = 'Exported Data',
  columns = [],
  mapRow = (item) => [],
}) {
  const handleExport = async () => {
    const { default: jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    if (!data.length) {
      alert('No data to export');
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(title, 14, 22);

    const tableRows = data.map(mapRow);

    autoTable(doc, {
      head: [columns],
      body: tableRows,
      startY: 30,
      styles: {
        fontSize: 10,
      },
    });

    doc.save(filename);
  };

  return (
    <Button variant="danger" size="sm" onClick={handleExport}>
      <FaFilePdf className="me-2" />
      Export PDF
    </Button>
  );
}
