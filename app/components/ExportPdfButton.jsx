'use client';

import { Button } from 'react-bootstrap';
import { FaFilePdf } from 'react-icons/fa';

export default function ExportPDFButton({ data, filename = 'events_export.pdf' }) {
  const handleExport = async () => {
    const { default: jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Your Events', 14, 22);

    const tableColumn = ['#', 'Event Name', 'Date', 'Location', 'Time'];
    const tableRows = data.map((event, index) => [
      index + 1,
      event.event_name,
      event.event_date,
      event.location,
      `${event.start_time} - ${event.end_time}`,
    ]);

    // Register the plugin directly
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
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
