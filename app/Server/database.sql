--A test database file that contains the database proposed database schema

--Users table will contain the details of all the users of the application
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(50) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'organizer', 'guest'))
);

--Events table will contain all the events created by the event organizers
CREATE TABLE events (
  event_id SERIAL PRIMARY KEY,
  organizer_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  event_name VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  location VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--Seating_configurations table will contain the seating arrangements for each event
CREATE TABLE seating_configurations (
  config_id SERIAL PRIMARY KEY,
  event_id INT NOT NULL UNIQUE REFERENCES events(event_id) ON DELETE CASCADE,
  table_count INT,
  seats_per_table INT,
  number_of_rows INT,
  seats_per_row INT,
  total_capacity INT GENERATED ALWAYS AS (
    COALESCE(table_count * seats_per_table, number_of_rows * seats_per_row)
  ) STORED,
  CONSTRAINT seating_valid CHECK (
    (table_count IS NOT NULL AND seats_per_table IS NOT NULL)
    OR
    (number_of_rows IS NOT NULL AND seats_per_row IS NOT NULL)
  )
);

--Guests table will contain the details of all the RSVP responses of guests
CREATE TABLE guests (
  guest_id SERIAL PRIMARY KEY,
  event_id INT NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
  user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email_address VARCHAR(255) NOT NULL,
  category VARCHAR(50) CHECK (category IN ('VIP', 'Regular')),
  qr_code TEXT UNIQUE NOT NULL,
  check_in_status BOOLEAN DEFAULT FALSE,
  seat_number VARCHAR(20),
  invitation_sent BOOLEAN DEFAULT FALSE,
  reminder_sent BOOLEAN DEFAULT FALSE,
  rsvp_status VARCHAR(20) CHECK (rsvp_status IN ('accepted', 'declined'))
);

--csv_uploads will contain the details of the guests who have been invited to an event via a CSV file
CREATE TABLE csv_uploads (
  csv_id SERIAL PRIMARY KEY,
  uploader_id INT REFERENCES users(user_id) ON DELETE SET NULL,
  event_id INT NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email_address VARCHAR(255) NOT NULL,
  category VARCHAR(50) CHECK (category IN ('VIP', 'Regular')),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

