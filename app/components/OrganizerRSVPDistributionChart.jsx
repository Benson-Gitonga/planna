'use client';
import { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Card } from 'react-bootstrap';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function RSVPDistributionChart() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/organizer/popular-events', {
          credentials: 'include',
        });
        const result = await res.json();

        if (res.ok && result.popular_events?.length > 0) {
          let accepted = 0;
          let declined = 0;

          result.popular_events.forEach(ev => {
            accepted += parseInt(ev.accepted_rsvps);
            declined += parseInt(ev.declined_rsvps);
          });

          const pending = Math.max(0, result.popular_events.reduce((acc, ev) => {
            const total = parseInt(ev.total_rsvps);
            const accDecl = parseInt(ev.accepted_rsvps) + parseInt(ev.declined_rsvps);
            return acc + (total - accDecl);
          }, 0));

          setData({
            labels: ['Accepted', 'Declined', 'Pending'],
            datasets: [
              {
                data: [accepted, declined, pending],
                backgroundColor: ['#4caf50', '#f44336', '#ff9800'],
              },
            ],
          });
        }
      } catch (err) {
        console.error('Error loading RSVP data', err);
      }
    };

    fetchPopular();
  }, []);

  return (
    <Card className="mb-4 p-3">
      <h6 className="fw-bold mb-3">📨 RSVP Distribution</h6>
      {data ? (
        <Pie
          data={data}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom',
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
