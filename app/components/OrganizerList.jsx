'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Table,
  Form,
  Spinner,
  Alert,
  Button,
  InputGroup,
  Badge,
} from 'react-bootstrap';
import { FaSearch, FaUserTie } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function OrganizerList() {
  const [organizers, setOrganizers] = useState([]);
  const [filteredOrganizers, setFilteredOrganizers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [togglingId, setTogglingId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkSessionAndFetch = async () => {
      try {
        const sessionRes = await fetch('http://localhost:5000/api/me', {
          credentials: 'include',
        });

        if (sessionRes.status === 401) {
          router.push('/login');
          return;
        }

        const sessionData = await sessionRes.json();
        if (sessionData.user.role !== 'admin') {
          router.push('/login');
          return;
        }

        await fetchOrganizers();
      } catch (err) {
        setError('Session check failed.');
        setLoading(false);
      }
    };

    checkSessionAndFetch();
  }, [router]);

  const fetchOrganizers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/all-organizers', {
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || 'Failed to fetch organizers');

      setOrganizers(data.organizers);
      setFilteredOrganizers(data.organizers);
    } catch (err) {
      console.error('Error fetching organizers:', err);
      setError('Unable to load organizers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = organizers.filter(org =>
      `${org.first_name} ${org.last_name} ${org.email}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
    setFilteredOrganizers(filtered);
  }, [search, organizers]);

  const toggleStatus = async (organizerId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'deactivated' : 'active';
    const confirmToggle = confirm(
      `Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} this account?`
    );
    if (!confirmToggle) return;

    try {
      setTogglingId(organizerId);

      const res = await fetch(`http://localhost:5000/api/admin/toggle-status/${organizerId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || 'Failed to update status');

      // Update UI
      const updatedOrganizers = organizers.map(org =>
        org.user_id === organizerId ? { ...org, status: newStatus } : org
      );
      setOrganizers(updatedOrganizers);
      setFilteredOrganizers(updatedOrganizers);
    } catch (err) {
      console.error('Status toggle error:', err);
      alert('Failed to update status.');
    } finally {
      setTogglingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge bg="success">Active</Badge>;
      case 'deactivated':
        return <Badge bg="danger">Deactivated</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  return (
    <Container className="py-4">
      {/* Header and search bar */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="d-flex align-items-center gap-2 mb-0">
          <FaUserTie className="text-primary" />
          All Organizers
        </h4>
        <div className="ms-auto" style={{ maxWidth: '300px' }}>
          <InputGroup>
            <InputGroup.Text><FaSearch /></InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search organizers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </div>
      </div>

      {/* Main content */}
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <>
          <Table striped bordered hover responsive className="shadow-sm">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Organizer Name</th>
                <th>Email Address</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrganizers.map((org, index) => (
                <tr key={org.user_id}>
                  <td>{index + 1}</td>
                  <td>{org.first_name} {org.last_name}</td>
                  <td>{org.email}</td>
                  <td>{getStatusBadge(org.status)}</td>
                  <td>
                    <Button
                      variant={org.status === 'active' ? 'outline-danger' : 'outline-success'}
                      size="sm"
                      disabled={togglingId === org.user_id}
                      onClick={() => toggleStatus(org.user_id, org.status)}
                    >
                      {togglingId === org.user_id
                        ? 'Updating...'
                        : org.status === 'active'
                        ? 'Deactivate'
                        : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {filteredOrganizers.length === 0 && (
            <p className="text-muted text-center">No matching organizers found.</p>
          )}
        </>
      )}
    </Container>
  );
}
