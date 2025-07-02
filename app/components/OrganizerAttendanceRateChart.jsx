'use client';
import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Card } from 'react-bootstrap';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function AttendanceRateChart() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/organizer/attendance-rate', {
          credentials: 'include',
        });
        const data = await res.json();

        if (res.ok && data.attendance_rate_per_event) {
          const labels = data.attendance_rate_per_event.map(ev => ev.event_name);
          const attendance = data.attendance_rate_per_event.map(ev =>
            parseFloat(ev.attendance_rate.replace('%', ''))
          );

          setChartData({
            labels,
            datasets: [
              {
                label: 'Attendance Rate (%)',
                data: attendance,
                backgroundColor: '#4CAF50',
              },
            ],
          });
        }
      } catch (err) {
        console.error('Failed to load attendance chart:', err);
      }
    };
    fetchAttendance();
  }, []);

  return (
    <Card className="mb-4 p-3">
      <h6 className="fw-bold mb-3">🎟 Attendance Rate by Event</h6>
      {chartData ? (
        <Bar
          data={chartData}
          options={{
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
              },
            },
          }}
        />
      ) : (
        <p>Loading chart...</p>
      )}
    </Card>
  );
}
