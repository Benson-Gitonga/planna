-- Users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'organizer', 'guest')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE events (
    event_id SERIAL PRIMARY KEY,
    organizer_id INTEGER NOT NULL REFERENCES users(user_id),
    event_name VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    location VARCHAR(255) NOT NULL,
    table_count INTEGER,
    seats_per_table INTEGER,
    number_of_rows INTEGER,
    seats_per_row INTEGER,
    total_capacity INTEGER GENERATED ALWAYS AS (
        COALESCE(table_count * seats_per_table, number_of_rows * seats_per_row)
    ) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT seating_config CHECK (
        (table_count IS NOT NULL AND seats_per_table IS NOT NULL) OR
        (number_of_rows IS NOT NULL AND seats_per_row IS NOT NULL)
    )
);

-- Guests table
CREATE TABLE guests (
    guest_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    event_id INTEGER NOT NULL REFERENCES events(event_id),
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    category VARCHAR(20) CHECK (category IN ('VIP', 'Regular', 'Press')) NOT NULL,
    rsvp_status VARCHAR(20) CHECK (rsvp_status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
    check_in_status BOOLEAN DEFAULT FALSE,
    qr_code VARCHAR(255) UNIQUE NOT NULL,
    seating_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_guest_event UNIQUE (email, event_id)
);

-- CSV Uploads table
CREATE TABLE csv_uploads (
    csv_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    event_id INTEGER NOT NULL REFERENCES events(event_id),
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    category VARCHAR(20) CHECK (category IN ('VIP', 'Regular', 'Press')) NOT NULL,
    processed_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_guests_event ON guests(event_id);
CREATE INDEX idx_guests_user ON guests(user_id);
CREATE INDEX idx_guests_email ON guests(email);
CREATE INDEX idx_csv_uploads_event ON csv_uploads(event_id);
CREATE INDEX idx_csv_uploads_user ON csv_uploads(user_id);