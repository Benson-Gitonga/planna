'use Client'
import { useState, useEffect } from 'react';
import {Container, Card, ListGroup, Badge, Spinner, Alert} from 'react-bootstrap';
import { motion } from 'framer-motion';

const badgeColors = ['warning', 'secondary', 'danger'];

export default function TopOrganizers(){
    const [organizers, setOrganizers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrganizers = async () => {
            try{
                const res = await fetch('http://localhost:5000/api/admin/most-active-organizers', {
                    credentials: 'include',
                });
                const data = await res.json();
                if(res.ok){
                    setOrganizers(data.most_active_organizers);
                }else{
                    throw new Error(data.error || 'Failed to load organizers');
                }
            }catch(err){
                console.error(err);
                serError('Failed to fetch organizers');
            }finally{
                setLoading(false);
            }
        };
        fetchOrganizers();
    }, []);
    return (
         <Container className="my-5">
      <h5 className="mb-3">🏆 Most Active Organizers</h5>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Card className="shadow-sm border-0">
          <ListGroup variant="flush">
            {organizers.map((org, index) => (
              <motion.div
                whileHover={{ scale: 1.02 }}
                key={org.user_id}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{org.first_name} {org.last_name}</strong>
                    <div className="text-muted small">{org.email_address}</div>
                  </div>
                  <div>
                    <span className="me-2 text-dark fw-semibold">
                      {org.total_events} events
                    </span>
                    {index < 3 && (
                      <Badge bg={badgeColors[index]}>
                        {['🥇 1st', '🥈 2nd', '🥉 3rd'][index]}
                      </Badge>
                    )}
                  </div>
                </ListGroup.Item>
              </motion.div>
            ))}
          </ListGroup>
        </Card>
      )}
    </Container>        
    );
}