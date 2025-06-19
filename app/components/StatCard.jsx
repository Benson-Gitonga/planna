'use client';
import { Card } from 'react-bootstrap';
import CountUp from 'react-countup';
import { IconContext } from 'react-icons';
import { FaCalendarAlt, FaUsers, FaCheckCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

const iconMap = {
  events: <FaCalendarAlt />,
  organizers: <FaUsers />,
  rsvps: <FaCheckCircle />,
};

const gradientMap = {
  events: 'linear-gradient(135deg, #74ebd5, #ACB6E5)',
  organizers: 'linear-gradient(135deg, #FAD961, #F76B1C)',
  rsvps: 'linear-gradient(135deg, #84fab0, #8fd3f4)',
};

const StatCard = ({ title, value, description, type }) => {
  const parsedValue = Number(value) || 0;
  const gradient = gradientMap[type] || '#f8f9fa';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{
        scale: 1.05,
        z: 10,
        translateZ: 30, // This mimics the "move forward" effect
        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)',
        transition: { type: 'spring', stiffness: 300 },
      }}
      style={{ cursor: 'pointer', perspective: 1000 }}
    >
      <Card
        className="text-white mb-4"
        style={{
          minHeight: '200px',
          borderRadius: '1rem',
          background: gradient,
          border: 'none',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
          transformStyle: 'preserve-3d',
        }}
      >
        <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
          <IconContext.Provider value={{ size: '2.2em', color: '#fff' }}>
            <div className="mb-3">{iconMap[type]}</div>
          </IconContext.Provider>

          <Card.Title className="text-uppercase fw-semibold small">{title}</Card.Title>
          <Card.Text className="fw-bold display-6">
            <CountUp key={parsedValue} end={parsedValue} duration={1.5} separator="," />
          </Card.Text>
          {description && <Card.Text className="small">{description}</Card.Text>}
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default StatCard;
