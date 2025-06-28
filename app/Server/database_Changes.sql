--The following are the changes made to the database schema

--Removing user_id from the guests table
Alter TABLE guests
    DROP COLUMN user_id;
 
--Adding a UUID column which will be used by the guests for frontend access
ALTER TABLE guests
    ADD COLUMN access_code VARCHAR(255) UNIQUE NOT NULL;

--Add a qr_expires_at column to store the expiry of the QR code
ALTER TABLE guests
ADD COLUMN qr_expires_at TIMESTAMP;

--Adding start and end time columns to the events table
ALTER TABLE events
ADD COLUMN start_time TIME,
ADD COLUMN end_time TIME;
-- Adding a constraint to ensure that end_time is greater than start_time if both are provided
ALTER TABLE events
ADD CONSTRAINT valid_event_times CHECK (
  end_time IS NULL OR start_time IS NULL OR end_time > start_time
);

--Added a status column to the users table
-- Step 1: Create the enum type
CREATE TYPE user_status AS ENUM ('active', 'deactivated');

-- Step 2: Alter the Users table to add the new status column
ALTER TABLE Users
ADD COLUMN status user_status NOT NULL DEFAULT 'active';
